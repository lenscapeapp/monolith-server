#!/bin/sh

echo Migrating Database

if [ $ENV = "production" ]
then
  ./node_modules/.bin/sequelize db:migrate --production
else
  if [ $ENV = "test" ]
  then
    ./node_modules/.bin/sequelize db:drop
    ./node_modules/.bin/sequelize db:create
  fi
  ./node_modules/.bin/sequelize db:migrate
fi

if [ $? -gt 0 ]
then
  echo Error occur when migrating database.
  exit $?
fi

echo Run server
npm start