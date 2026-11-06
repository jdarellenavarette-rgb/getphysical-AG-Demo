#!/usr/bin/env bash
# Applies every migration to a throwaway database and runs the SQL test files.
#
# Usage:
#   PGHOST=localhost PGPORT=5432 PGUSER=postgres ./supabase/tests/run-db-tests.sh
#
# Requires a superuser connection to a vanilla Postgres 15+ with pgcrypto
# available. The database named by $TEST_DB (default gp_test) is recreated.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(cd "$here/../.." && pwd)"
db="${TEST_DB:-gp_test}"

psql_admin() { psql -v ON_ERROR_STOP=1 -X -q -d postgres "$@"; }
psql_test() { psql -v ON_ERROR_STOP=1 -X -q -d "$db" "$@"; }

psql_admin -c "drop database if exists $db with (force)"
psql_admin -c "create database $db"

echo "→ shim"
psql_test -f "$here/00_supabase_shim.sql"

for migration in "$root"/supabase/migrations/*.sql; do
  echo "→ migration $(basename "$migration")"
  psql_test -f "$migration"
done

psql_test -f "$here/01_test_helpers.sql"

echo "→ seed"
psql_test -f "$root/supabase/seed.sql"

failures=0
for test_file in "$here"/[1-9]*_*.test.sql; do
  echo "→ test $(basename "$test_file")"
  # ON_ERROR_STOP makes psql exit non-zero on the first failing assertion.
  if ! psql_test -o /dev/null -f "$test_file" 2>&1 | sed 's/^psql:[^ ]* NOTICE:  /  /'; then
    failures=$((failures + 1))
  fi
done

if [ "$failures" -ne 0 ]; then
  echo "✗ $failures test file(s) failed"
  exit 1
fi
echo "✓ all database tests passed"
