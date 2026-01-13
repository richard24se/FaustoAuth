#!/bin/bash
set -e

# Navigate to backend directory
cd /app/backend

# Start Supervisor
echo "Starting Supervisor..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
