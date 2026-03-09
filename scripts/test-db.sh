#!/bin/bash
# Start test database
start() {
  echo "Starting test database on port 5433..."
  docker compose -f docker/docker-compose.test-db.yml up -d
  echo "Waiting for database to be ready..."
  until docker exec apptemplate-test-db pg_isready -U apptemplate -d apptemplate_test 2>/dev/null; do
    sleep 1
  done
  echo "✅ Database ready at localhost:5433"
}

# Stop and clean
stop() {
  echo "Stopping test database..."
  docker compose -f docker/docker-compose.test-db.yml down
  echo "✅ Database stopped"
}

# Reset (drop all tables, re-run from scratch)
reset() {
  echo "Resetting database..."
  docker compose -f docker/docker-compose.test-db.yml down -v
  start
}

case "$1" in
  start) start ;;
  stop) stop ;;
  reset) reset ;;
  *) echo "Usage: ./scripts/test-db.sh {start|stop|reset}" ;;
esac
