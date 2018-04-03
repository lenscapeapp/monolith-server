#!/bin/sh

echo Migrating Database

if [ $NODE_ENV = "production" ]
then
  ./node_modules/.bin/sequelize db:migrate --env production
fi

if [ $? -gt 0 ]
then
  echo Error occur when migrating database.
  exit $?
fi

echo Run server
npm start