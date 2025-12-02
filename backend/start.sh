#!/bin/bash
set -e  # Exit on error

echo "=== Application Startup ==="
echo "Java version: $(java -version 2>&1 | head -n 1)"

# Validate required environment variables
if [ -z "$SPRING_DATASOURCE_USERNAME" ] || [ -z "$SPRING_DATASOURCE_PASSWORD" ]; then
  echo "ERROR: Database credentials not provided"
  exit 1
fi

# Build JDBC URL from individual database components
if [ -n "$DB_HOST" ] && [ -n "$DB_PORT" ] && [ -n "$DB_NAME" ]; then
  JDBC_URL="jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require"
  echo "Database configuration:"
  echo "  Host: $DB_HOST"
  echo "  Port: $DB_PORT"
  echo "  Database: $DB_NAME"
  echo "  Username: $SPRING_DATASOURCE_USERNAME"
  echo "  JDBC URL: $JDBC_URL"
  
  # Start the application with optimized settings for Render free tier
  exec java \
    -Xmx450m \
    -Xms256m \
    -XX:+UseG1GC \
    -XX:MaxGCPauseMillis=100 \
    -XX:+UseStringDeduplication \
    -Djava.security.egd=file:/dev/./urandom \
    -Dspring.datasource.url="$JDBC_URL" \
    -Dspring.datasource.hikari.maximum-pool-size=5 \
    -Dspring.datasource.hikari.minimum-idle=2 \
    -Dspring.datasource.hikari.connection-timeout=20000 \
    -Dspring.datasource.hikari.idle-timeout=300000 \
    -jar /app/app.jar
else
  echo "ERROR: Database environment variables missing (DB_HOST, DB_PORT, DB_NAME)"
  echo "Available environment variables:"
  env | grep -E '^(DB_|SPRING_)' || echo "None found"
  exit 1
fi
