const SequelizeRepository = require('./SequelizeRepository');
const { Sprint } = require('../index');

class SprintRepository extends SequelizeRepository {
  constructor() {
    super(Sprint);
  }

  async findByProject(projectId) {
    return this.findAll({ where: { projectId }, order: [['startDate', 'ASC']] });
  }
}

module.exports = new SprintRepository();
