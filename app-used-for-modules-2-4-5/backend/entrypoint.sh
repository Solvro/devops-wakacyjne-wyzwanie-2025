#!/bin/sh
set -e

npx prisma migrate deploy

npx prisma db seed

exec npm start
