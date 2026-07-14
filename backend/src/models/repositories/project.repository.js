const SequelizeRepository = require('./SequelizeRepository');
const { Project } = require('../index');

class ProjectRepository extends SequelizeRepository {
  constructor() {
    super(Project);
  }

  async findAllForUser(userId) {
    // `members` es una columna JSONB embebida (no una tabla de unión), así
    // que se trae todo y se filtra en JS. Aceptable para el alcance del
    // prototipo (RNF-09 descarta grandes volúmenes de datos).
    const all = await this.findAll();
    return all.filter((project) => project.members.some((m) => m.userId === userId));
  }
}

module.exports = new ProjectRepository();
