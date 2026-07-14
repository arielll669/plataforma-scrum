const { Op } = require('sequelize');
const SequelizeRepository = require('./SequelizeRepository');
const { User } = require('../index');

class UserRepository extends SequelizeRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    // Postgres es case-sensitive por defecto; ILIKE hace el equivalente
    // case-insensitive al .toLowerCase() que usaba el prototipo en memoria.
    const row = await this.model.findOne({ where: { email: { [Op.iLike]: email } } });
    return row ? row.toJSON() : null;
  }
}

module.exports = new UserRepository();
