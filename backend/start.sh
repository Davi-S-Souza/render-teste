#!/bin/bash

# Convert DATABASE_URL from postgres:// to jdbc:postgresql://
if [ -n "$DATABASE_URL" ]; then
  # Extract the URL after postgres://
  JDBC_URL="${DATABASE_URL#postgres://}"
  # Add the jdbc:postgresql:// prefix
  export JDBC_DATABASE_URL="jdbc:postgresql://${JDBC_URL}"
  echo "Converted DATABASE_URL to JDBC format"
fi

# Start the application
exec java -jar /app/app.jar
