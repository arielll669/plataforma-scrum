const app = require('./src/app');
const env = require('./src/config/env');
const { sequelize } = require('./src/models');

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    // Crea/ajusta las tablas automáticamente a partir de los modelos.
    // Suficiente para el alcance del prototipo académico (sin migraciones formales).
    await sequelize.sync({ alter: true });
    console.log('Esquema de base de datos sincronizado.');

    app.listen(env.port, () => {
      console.log(`Servidor backend Scrum escuchando en http://localhost:${env.port}`);
    });
  } catch (err) {
    console.error('No se pudo conectar a la base de datos:', err.message);
    console.error(
      'Verifique que backend/.env tenga DATABASE_URL configurado con la cadena de conexión de Supabase (ver README.md).'
    );
    process.exit(1);
  }
}

start();
