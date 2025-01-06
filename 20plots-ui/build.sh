#!/bin/sh

echo "REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL" > /app/.env

npm run clean
exec npm run build