import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDirectory = join(projectRoot, "supabase", "migrations");
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const baselineOnly = args.has("--baseline-only");

process.chdir(projectRoot);
loadEnvFile(join(projectRoot, ".release.local"));
loadEnvFile(join(projectRoot, ".env.local"));

const releaseConfig = {
  branch: process.env.EASYPANEL_BRANCH || "master",
  panelUrl: process.env.EASYPANEL_URL?.replace(/\/$/, ""),
  project: process.env.EASYPANEL_PROJECT,
  service: process.env.EASYPANEL_SERVICE,
  supabaseUrl: process.env.SUPABASE_URL?.replace(/\/$/, ""),
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

let easyPanelToken;
let easyPanelTokenSource;

function log(message) {
  console.log(`[release] ${message}`);
}

function fail(message) {
  throw new Error(message);
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;

  for (const rawLine of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match || process.env[match[1]] !== undefined) continue;

    let value = match[2].trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

function run(command, commandArgs, options = {}) {
  return execFileSync(command, commandArgs, {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: options.inherit ? "inherit" : ["ignore", "pipe", "pipe"],
    ...options,
  });
}

function npmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function sqlLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function checksum(contents) {
  return createHash("sha256").update(contents).digest("hex");
}

function discoverMigrations() {
  const migrations = readdirSync(migrationsDirectory)
    .filter((fileName) => /^\d+_[a-z0-9_]+\.sql$/i.test(fileName))
    .map((fileName) => {
      const [, version, name] = fileName.match(/^(\d+)_(.+)\.sql$/);
      const sql = readFileSync(join(migrationsDirectory, fileName), "utf8");
      return {
        fileName,
        version,
        name,
        sql,
        checksum: checksum(sql),
      };
    })
    .sort((left, right) => {
      const lengthDifference = left.version.length - right.version.length;
      return lengthDifference || left.version.localeCompare(right.version);
    });

  const versions = new Set();
  for (const migration of migrations) {
    if (versions.has(migration.version)) {
      fail(`Versão de migration duplicada: ${migration.version}.`);
    }
    versions.add(migration.version);
  }

  return migrations;
}

function requireDatabaseConfig() {
  if (!releaseConfig.supabaseUrl || !releaseConfig.serviceRoleKey) {
    fail(
      "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .release.local.",
    );
  }
}

function requireReleaseConfig() {
  const missing = [];
  if (!releaseConfig.panelUrl) missing.push("EASYPANEL_URL");
  if (!releaseConfig.project) missing.push("EASYPANEL_PROJECT");
  if (!releaseConfig.service) missing.push("EASYPANEL_SERVICE");

  if (missing.length) {
    fail(`Configure ${missing.join(", ")} em .release.local.`);
  }
}

function getEasyPanelToken() {
  if (process.env.EASYPANEL_API_KEY?.trim()) {
    easyPanelTokenSource = "environment";
    return process.env.EASYPANEL_API_KEY.trim();
  }

  if (process.platform === "win32") {
    const clipboard = run("powershell.exe", [
      "-NoProfile",
      "-Command",
      "Get-Clipboard -Raw",
    ]).trim();

    if (/^[A-Za-z0-9_-]{40,}$/.test(clipboard)) {
      easyPanelTokenSource = "clipboard";
      return clipboard;
    }
  }

  fail(
    "Copie uma API key temporária do EasyPanel ou defina EASYPANEL_API_KEY no ambiente.",
  );
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();

  if (!response.ok) {
    fail(`Requisição falhou (${response.status}) em ${new URL(url).pathname}.`);
  }

  return text ? JSON.parse(text) : null;
}

async function pgQuery(query) {
  requireDatabaseConfig();
  return requestJson(`${releaseConfig.supabaseUrl}/pg/query`, {
    method: "POST",
    headers: {
      apikey: releaseConfig.serviceRoleKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
}

async function migrationTableExists() {
  const rows = await pgQuery(
    "select to_regclass('supabase_migrations.schema_migrations') is not null as exists;",
  );
  return Boolean(rows?.[0]?.exists);
}

async function ensureMigrationTable() {
  await pgQuery(`
    create schema if not exists supabase_migrations;
    revoke all on schema supabase_migrations from anon, authenticated;

    create table if not exists supabase_migrations.schema_migrations (
      version text primary key,
      statements text[] not null default '{}',
      name text,
      checksum text,
      applied_at timestamptz not null default now()
    );

    alter table supabase_migrations.schema_migrations
      add column if not exists checksum text,
      add column if not exists applied_at timestamptz not null default now();

    revoke all on supabase_migrations.schema_migrations from anon, authenticated;
  `);
}

async function getAppliedMigrations() {
  if (!(await migrationTableExists())) return [];

  return pgQuery(`
    select version, name, coalesce(checksum, '') as checksum
    from supabase_migrations.schema_migrations
    order by length(version), version;
  `);
}

function findPendingMigrations(localMigrations, appliedMigrations) {
  const localByVersion = new Map(
    localMigrations.map((migration) => [migration.version, migration]),
  );
  const appliedByVersion = new Map(
    appliedMigrations.map((migration) => [String(migration.version), migration]),
  );

  for (const applied of appliedMigrations) {
    const local = localByVersion.get(String(applied.version));
    if (!local) {
      fail(`Migration aplicada ausente no repositório: ${applied.version}.`);
    }
    if (applied.checksum && applied.checksum !== local.checksum) {
      fail(`Migration já aplicada foi alterada: ${local.fileName}.`);
    }
  }

  const pending = localMigrations.filter(
    (migration) => !appliedByVersion.has(migration.version),
  );
  const latestApplied = appliedMigrations.at(-1)?.version;

  if (
    latestApplied &&
    pending.some((migration) =>
      compareVersions(migration.version, String(latestApplied)) < 0,
    )
  ) {
    fail("Existe migration fora de ordem. Crie uma nova versão maior.");
  }

  return pending;
}

function compareVersions(left, right) {
  return left.length - right.length || left.localeCompare(right);
}

async function assertBaselineReady() {
  const rows = await pgQuery(`
    select
      to_regclass('public.leads') is not null as has_leads,
      to_regclass('public.notes') is not null as has_notes,
      to_regclass('public.lead_webhook_tokens') is not null as has_webhook_tokens,
      exists (
        select 1 from information_schema.columns
        where table_schema = 'public'
          and table_name = 'leads'
          and column_name = 'owner_id'
      ) as has_owner_id;
  `);
  const state = rows?.[0];

  if (
    !state?.has_leads ||
    !state?.has_notes ||
    !state?.has_webhook_tokens ||
    !state?.has_owner_id
  ) {
    fail("O banco ainda não contém o schema atual; baseline recusada.");
  }
}

async function baselineMigrations(migrations) {
  if (await migrationTableExists()) {
    const existing = await getAppliedMigrations();
    if (existing.length) {
      fail("Baseline já inicializada. Use npm run release:vps.");
    }
  }

  await assertBaselineReady();
  await ensureMigrationTable();

  for (const migration of migrations) {
    await pgQuery(`
      insert into supabase_migrations.schema_migrations
        (version, name, statements, checksum)
      values (
        ${sqlLiteral(migration.version)},
        ${sqlLiteral(migration.name)},
        array[${sqlLiteral(migration.sql)}]::text[],
        ${sqlLiteral(migration.checksum)}
      )
      on conflict (version) do nothing;
    `);
  }

  const applied = await getAppliedMigrations();
  const pending = findPendingMigrations(migrations, applied);
  if (pending.length) {
    fail("O baseline terminou com migrations não registradas.");
  }

  log(`${migrations.length} migrations registradas como baseline.`);
}

async function createLogicalBackup() {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const schema = `migration_backup_${timestamp}`;

  await pgQuery(`
    create schema ${schema};
    revoke all on schema ${schema} from public, anon, authenticated;

    do $backup$
    declare
      item record;
    begin
      for item in
        select tablename from pg_tables where schemaname = 'public'
      loop
        execute format(
          'create table %I.%I as table public.%I',
          ${sqlLiteral(schema)},
          item.tablename,
          item.tablename
        );
      end loop;
    end
    $backup$;

    create table ${schema}._rls_policies as
      select * from pg_policies where schemaname = 'public';

    revoke all on all tables in schema ${schema} from public, anon, authenticated;
  `);

  log(`Backup lógico criado no schema ${schema}.`);
  return schema;
}

function withoutTransactionBoundaries(sql) {
  return sql
    .replace(/^\s*begin;\s*$/gim, "")
    .replace(/^\s*commit;\s*$/gim, "")
    .trim();
}

async function applyMigration(migration) {
  const body = withoutTransactionBoundaries(migration.sql);

  await pgQuery(`
    begin;
    ${body}

    insert into supabase_migrations.schema_migrations
      (version, name, statements, checksum)
    values (
      ${sqlLiteral(migration.version)},
      ${sqlLiteral(migration.name)},
      array[${sqlLiteral(migration.sql)}]::text[],
      ${sqlLiteral(migration.checksum)}
    );
    commit;
  `);

  log(`Migration aplicada: ${migration.fileName}.`);
}

function assertGitState() {
  const branch = run("git", ["branch", "--show-current"]).trim();
  const status = run("git", ["status", "--porcelain"]).trim();

  if (branch !== releaseConfig.branch) {
    fail(`Branch atual é ${branch}; esperado ${releaseConfig.branch}.`);
  }
  if (status) {
    fail("O Git possui alterações não commitadas. Faça o commit antes do release.");
  }
}

function runProjectChecks() {
  log("Executando lint...");
  run(npmCommand(), ["run", "lint"], { inherit: true });
  log("Executando build...");
  run(npmCommand(), ["run", "build"], { inherit: true });
}

async function easyPanelRequest(path, options = {}) {
  return requestJson(`${releaseConfig.panelUrl}/api/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${easyPanelToken}`,
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...options.headers,
    },
  });
}

async function validateEasyPanelAccess() {
  await easyPanelRequest("listUsers");
  log("Acesso ao EasyPanel validado.");
}

async function latestDeploymentAction() {
  const query = new URLSearchParams({
    limit: "1",
    projectName: releaseConfig.project,
    serviceName: releaseConfig.service,
    type: "deployment",
  });
  const actions = await easyPanelRequest(`listActions?${query}`);
  return actions?.[0] ?? null;
}

async function waitForNewAutoDeploy(previousActionId) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await delay(2_000);
    const action = await latestDeploymentAction();
    if (action && action.id !== previousActionId) return action;
  }
  return null;
}

async function waitForAction(actionId) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const action = await easyPanelRequest(
      `getAction?id=${encodeURIComponent(actionId)}`,
    );
    if (action.status === "done") return true;
    if (["killed", "failed", "error"].includes(action.status)) return false;
    await delay(5_000);
  }
  fail("Tempo limite excedido aguardando o deploy automático.");
}

async function triggerManualDeploy() {
  log("Iniciando deploy manual no EasyPanel...");
  const response = await fetch(`${releaseConfig.panelUrl}/api/deployAppService`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${easyPanelToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      projectName: releaseConfig.project,
      serviceName: releaseConfig.service,
      forceRebuild: true,
    }),
  });

  if (response.body) {
    for await (const _chunk of response.body) {
      // Consumir o stream mantém o build ativo no EasyPanel.
    }
  }
  if (!response.ok) fail(`Deploy manual falhou (${response.status}).`);
}

async function deployApplication() {
  const previousActionId = (await latestDeploymentAction())?.id;
  log(`Enviando ${releaseConfig.branch} para o GitHub...`);
  run("git", ["push", "origin", releaseConfig.branch], { inherit: true });

  const automaticAction = await waitForNewAutoDeploy(previousActionId);
  if (automaticAction) {
    log("Deploy automático detectado; aguardando conclusão...");
    if (!(await waitForAction(automaticAction.id))) {
      log("Deploy automático não concluiu; tentando uma vez pelo API.");
      await triggerManualDeploy();
    }
  } else {
    await triggerManualDeploy();
  }

  const expectedCommit = run("git", ["rev-parse", "HEAD"]).trim();
  const query = new URLSearchParams({
    projectName: releaseConfig.project,
    serviceName: releaseConfig.service,
  });
  const app = await easyPanelRequest(`inspectAppService?${query}`);
  if (app?.commit?.sha !== expectedCommit) {
    fail("O EasyPanel terminou sem ativar o commit esperado.");
  }
  log(`Commit ativo: ${expectedCommit.slice(0, 7)}.`);
}

async function runSmokeTests() {
  const project = await easyPanelRequest(
    `inspectProject?projectName=${encodeURIComponent(releaseConfig.project)}`,
  );
  const app = project.services?.find(
    (service) =>
      service.type === "app" && service.name === releaseConfig.service,
  );
  const domain = app?.domains?.[0];
  if (!domain?.host) fail("Domínio público do CRM não encontrado.");

  const protocol = domain.https ? "https" : "http";
  const baseUrl = `${protocol}://${domain.host}`;
  const rootResponse = await fetch(baseUrl, { redirect: "follow" });
  const webhookResponse = await fetch(`${baseUrl}/api/webhooks/leads`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "release-probe" }),
  });

  if (rootResponse.status !== 200) {
    fail(`CRM respondeu ${rootResponse.status} no teste de saúde.`);
  }
  if (webhookResponse.status !== 401) {
    fail(`Webhook sem token respondeu ${webhookResponse.status}; esperado 401.`);
  }
  log("Smoke tests aprovados: CRM 200 e webhook protegido 401.");
}

async function revokeTemporaryToken() {
  if (easyPanelTokenSource !== "clipboard" || !easyPanelToken) return;

  try {
    const response = await easyPanelRequest("listUsers");
    const user = response.users?.find(
      (candidate) => candidate.apiToken === easyPanelToken,
    );
    if (!user?.id) {
      log("API key temporária não pôde ser identificada para revogação automática.");
      return;
    }

    await easyPanelRequest("revokeApiToken", {
      method: "POST",
      body: JSON.stringify({ id: user.id }),
    });
    log("API key temporária do EasyPanel revogada.");
  } catch {
    log("Falha ao revogar a API key temporária; revogue-a no EasyPanel.");
  }
}

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}

async function showDryRun(migrations) {
  log(`Branch esperada: ${releaseConfig.branch}.`);
  log(`${migrations.length} migrations locais válidas.`);

  if (!releaseConfig.supabaseUrl || !releaseConfig.serviceRoleKey) {
    log("Banco não consultado: .env.local incompleto.");
    return;
  }

  const applied = await getAppliedMigrations();
  const pending = findPendingMigrations(migrations, applied);
  log(`${applied.length} aplicadas; ${pending.length} pendentes.`);
  for (const migration of pending) log(`Pendente: ${migration.fileName}.`);
}

async function main() {
  const migrations = discoverMigrations();

  if (dryRun) {
    await showDryRun(migrations);
    return;
  }

  if (baselineOnly) {
    requireDatabaseConfig();
    await baselineMigrations(migrations);
    return;
  }

  requireDatabaseConfig();
  requireReleaseConfig();
  assertGitState();

  easyPanelToken = getEasyPanelToken();
  await validateEasyPanelAccess();
  runProjectChecks();

  if (!(await migrationTableExists())) {
    fail("Histórico ausente. Execute npm run migrations:baseline uma única vez.");
  }

  const applied = await getAppliedMigrations();
  const pending = findPendingMigrations(migrations, applied);
  if (pending.length) {
    await createLogicalBackup();
    for (const migration of pending) await applyMigration(migration);
  } else {
    log("Nenhuma migration pendente.");
  }

  await deployApplication();
  await runSmokeTests();
  log("Release concluído.");
}

main()
  .catch((error) => {
    console.error(`[release] ERRO: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(revokeTemporaryToken);
