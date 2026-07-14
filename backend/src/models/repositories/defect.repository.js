const SequelizeRepository = require('./SequelizeRepository');
const { Defect } = require('../index');

class DefectRepository extends SequelizeRepository {
  constructor() {
    super(Defect);
  }

  async findByProject(projectId) {
    return this.findAll({ where: { projectId }, order: [['reportedAt', 'DESC']] });
  }
}

module.exports = new DefectRepository();
