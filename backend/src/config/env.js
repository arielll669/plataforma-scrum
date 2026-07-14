require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-not-for-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  databaseUrl: process.env.DATABASE_URL,
  // Supabase requiere SSL; desactivable (DATABASE_SSL=false) para un Postgres
  // local sin SSL, por ejemplo al probar con Docker.
  databaseSsl: process.env.DATABASE_SSL !== 'false',
};
