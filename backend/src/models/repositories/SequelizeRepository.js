/**
 * Repositorio base respaldado por un modelo Sequelize (Postgres/Supabase).
 *
 * Expone la misma API async CRUD que usaban los repositorios en memoria
 * del prototipo original (findAll, findById, create, update, remove), de
 * modo que `services/` y `controllers/` no requieren ningún cambio al
 * migrar el backend de almacenamiento en memoria a una base de datos real.
 * Siempre retorna objetos planos (`.toJSON()`), nunca instancias Sequelize.
 */
class SequelizeRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll(options) {
    const rows = await this.model.findAll(options);
    return rows.map((row) => row.toJSON());
  }

  async findById(id) {
    const row = await this.model.findByPk(id);
    return row ? row.toJSON() : null;
  }

  async create(data) {
    const row = await this.model.create(data);
    return row.toJSON();
  }

  async update(id, changes) {
    const row = await this.model.findByPk(id);
    if (!row) return null;
    await row.update(changes);
    return row.toJSON();
  }

  async remove(id) {
    const deletedCount = await this.model.destroy({ where: { id } });
    return deletedCount > 0;
  }
}

module.exports = SequelizeRepository;
