const SequelizeRepository = require('./SequelizeRepository');
const { UserStory } = require('../index');

class UserStoryRepository extends SequelizeRepository {
  constructor() {
    super(UserStory);
  }

  async findByProject(projectId) {
    return this.findAll({ where: { projectId } });
  }

  async findBacklog(projectId) {
    return this.findAll({
      where: { projectId, sprintId: null },
      order: [['priorityOrder', 'ASC']],
    });
  }

  async findBySprint(sprintId) {
    return this.findAll({ where: { sprintId } });
  }

  async maxPriorityOrder(projectId) {
    const max = await this.model.max('priorityOrder', { where: { projectId } });
    return max || 0;
  }
}

module.exports = new UserStoryRepository();
