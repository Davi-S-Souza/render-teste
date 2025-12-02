#!/bin/bash

# Convert DATABASE_URL from postgres:// to jdbc:postgresql://
if [ -n "$DATABASE_URL" ]; then
  # Extract the URL after postgres://
  JDBC_URL="${DATABASE_URL#postgres://}"
  # Add the jdbc:postgresql:// prefix
  JDBC_DATABASE_URL="jdbc:postgresql://${JDBC_URL}"
  echo "Converted DATABASE_URL to JDBC format: $JDBC_DATABASE_URL"
  
  # Start the application with the JDBC URL as a system property
  exec java -Dspring.datasource.url="$JDBC_DATABASE_URL" -jar /app/app.jar
else
  echo "No DATABASE_URL found, starting with default configuration"
  exec java -jar /app/app.jar
fi
