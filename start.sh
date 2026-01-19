#!/bin/bash
set -e

# Start Next.js application
exec node .next/standalone/server.js
