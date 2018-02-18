#!/bin/sh

echo Migrating Database
./node_modules/.bin/sequelize db:migrate

if [ $? -gt 0 ]
then
  echo Error occur when migrating database.
  exit $?
fi

echo Run server
npm start