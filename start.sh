#!/bin/sh
set -e

# Next.js prod server
exec npx next start -p "${PORT:-3000}" -H 0.0.0.0
