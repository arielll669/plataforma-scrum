const { Sequelize } = require('sequelize');
const env = require('./env');

if (!env.databaseUrl) {
  throw new Error(
    'Falta la variable de entorno DATABASE_URL. Copie backend/.env.example a backend/.env ' +
      'y pegue la cadena de conexión de su proyecto de Supabase (Project Settings → Database → Connection string).'
  );
}

const sequelize = new Sequelize(env.databaseUrl, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: env.nodeEnv === 'development' ? console.log : false,
  dialectOptions: env.databaseSsl
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
});

module.exports = sequelize;
