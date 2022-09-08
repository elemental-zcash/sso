const pgPromise = require('pg-promise');

const initOptions = {
  capSQL: true,
};

const config = {
  host: 'postgres',
  port: 5432,
  database: process.env.POSTGRES_DATABASE,
  user: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PSWD,
};

const pg = pgPromise(initOptions);

const db = pg(config);

module.exports = { pg, db };
