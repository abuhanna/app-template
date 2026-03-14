import { execSync } from 'child_process';

const IS_CI = process.env.CI === 'true';
const TEST_DB_CONTAINER = 'apptemplate-test-db';
const TEST_DB_HOST = process.env.TEST_DB_HOST || 'localhost';
const TEST_DB_PORT = parseInt(process.env.TEST_DB_PORT || '5433', 10);
const TEST_DB_NAME = 'apptemplate_test';
const TEST_DB_USER = 'apptemplate';
const TEST_DB_PASS = 'apptemplate123';

export interface TestDbConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  connectionString: string;
}

export function getTestDbConfig(): TestDbConfig {
  return {
    host: TEST_DB_HOST,
    port: TEST_DB_PORT,
    database: TEST_DB_NAME,
    user: TEST_DB_USER,
    password: TEST_DB_PASS,
    connectionString: `Host=${TEST_DB_HOST};Port=${TEST_DB_PORT};Database=${TEST_DB_NAME};Username=${TEST_DB_USER};Password=${TEST_DB_PASS}`,
  };
}

/**
 * Check if the test database is running.
 * In CI: check port reachability via pg_isready.
 * Locally: check Docker container status.
 */
export function isTestDbRunning(): boolean {
  try {
    if (IS_CI) {
      execSync(
        `pg_isready -h ${TEST_DB_HOST} -p ${TEST_DB_PORT} -U ${TEST_DB_USER} -d ${TEST_DB_NAME}`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
      );
      return true;
    }

    const result = execSync(
      `docker inspect -f "{{.State.Running}}" ${TEST_DB_CONTAINER} 2>/dev/null`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
    ).trim();
    return result === 'true';
  } catch {
    return false;
  }
}

/**
 * Start the test database if not already running.
 * In CI: assume Postgres is provided by the services block; just wait for it.
 * Locally: start a Docker container.
 */
export function ensureTestDb(): void {
  if (isTestDbRunning()) return;

  if (IS_CI) {
    // In CI, Postgres is provided externally — just wait for it
    waitForDb();
    return;
  }

  try {
    // Try to start existing stopped container
    execSync(`docker start ${TEST_DB_CONTAINER}`, {
      stdio: 'pipe',
    });
  } catch {
    // Create new container
    execSync(
      `docker run -d --name ${TEST_DB_CONTAINER} ` +
        `-p ${TEST_DB_PORT}:5432 ` +
        `-e POSTGRES_DB=${TEST_DB_NAME} ` +
        `-e POSTGRES_USER=${TEST_DB_USER} ` +
        `-e POSTGRES_PASSWORD=${TEST_DB_PASS} ` +
        `postgres:16-alpine`,
      { stdio: 'pipe' },
    );
  }

  // Wait for PostgreSQL to be ready
  waitForDb();
}

/**
 * Wait for the database to accept connections.
 */
function waitForDb(maxRetries = 30, intervalMs = 1000): void {
  const IS_WIN = process.platform === 'win32';
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (IS_CI) {
        execSync(
          `pg_isready -h ${TEST_DB_HOST} -p ${TEST_DB_PORT} -U ${TEST_DB_USER} -d ${TEST_DB_NAME}`,
          { stdio: 'pipe' },
        );
      } else {
        execSync(
          `docker exec ${TEST_DB_CONTAINER} pg_isready -U ${TEST_DB_USER} -d ${TEST_DB_NAME}`,
          { stdio: 'pipe' },
        );
      }
      return;
    } catch {
      if (i === maxRetries - 1) {
        throw new Error('Test database did not become ready in time');
      }
      execSync(
        IS_WIN ? `ping -n 2 127.0.0.1 >nul` : `sleep ${intervalMs / 1000}`,
        { stdio: 'pipe' },
      );
    }
  }
}

/**
 * Reset the test database by dropping and recreating the public schema.
 */
export function resetTestDb(): void {
  const sqlCmd = `"DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO ${TEST_DB_USER}; GRANT ALL ON SCHEMA public TO public;"`;

  try {
    if (IS_CI) {
      execSync(
        `PGPASSWORD=${TEST_DB_PASS} psql -h ${TEST_DB_HOST} -p ${TEST_DB_PORT} -U ${TEST_DB_USER} -d ${TEST_DB_NAME} -c ${sqlCmd}`,
        { stdio: 'pipe' },
      );
    } else {
      execSync(
        `docker exec ${TEST_DB_CONTAINER} psql -U ${TEST_DB_USER} -d ${TEST_DB_NAME} -c ${sqlCmd}`,
        { stdio: 'pipe' },
      );
    }
  } catch {
    // If DB is fresh, schema may already be clean
  }
}

/**
 * Stop the test database container.
 */
export function stopTestDb(): void {
  if (IS_CI) return;
  try {
    execSync(`docker stop ${TEST_DB_CONTAINER}`, { stdio: 'pipe' });
  } catch {
    // Container may not exist
  }
}

/**
 * Remove the test database container entirely.
 */
export function removeTestDb(): void {
  if (IS_CI) return;
  try {
    execSync(`docker rm -f ${TEST_DB_CONTAINER}`, { stdio: 'pipe' });
  } catch {
    // Container may not exist
  }
}
