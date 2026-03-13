import { execSync } from 'child_process';

const TEST_DB_CONTAINER = 'apptemplate-test-db';
const TEST_DB_PORT = 5433;
const TEST_DB_NAME = 'apptemplate_test';
const TEST_DB_USER = 'postgres';
const TEST_DB_PASS = 'postgres';

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
    host: 'localhost',
    port: TEST_DB_PORT,
    database: TEST_DB_NAME,
    user: TEST_DB_USER,
    password: TEST_DB_PASS,
    connectionString: `Host=localhost;Port=${TEST_DB_PORT};Database=${TEST_DB_NAME};Username=${TEST_DB_USER};Password=${TEST_DB_PASS}`,
  };
}

/**
 * Check if the test database container is running.
 */
export function isTestDbRunning(): boolean {
  try {
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
 * Start the test database container if not already running.
 */
export function ensureTestDb(): void {
  if (isTestDbRunning()) return;

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
  for (let i = 0; i < maxRetries; i++) {
    try {
      execSync(
        `docker exec ${TEST_DB_CONTAINER} pg_isready -U ${TEST_DB_USER}`,
        { stdio: 'pipe' },
      );
      return;
    } catch {
      if (i === maxRetries - 1) {
        throw new Error('Test database did not become ready in time');
      }
      execSync(`sleep ${intervalMs / 1000}`, { stdio: 'pipe' });
    }
  }
}

/**
 * Reset the test database by dropping and recreating the public schema.
 */
export function resetTestDb(): void {
  execSync(
    `docker exec ${TEST_DB_CONTAINER} psql -U ${TEST_DB_USER} -d ${TEST_DB_NAME} ` +
      `-c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`,
    { stdio: 'pipe' },
  );
}

/**
 * Stop the test database container.
 */
export function stopTestDb(): void {
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
  try {
    execSync(`docker rm -f ${TEST_DB_CONTAINER}`, { stdio: 'pipe' });
  } catch {
    // Container may not exist
  }
}
