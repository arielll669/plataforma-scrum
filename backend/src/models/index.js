const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { STORY_STATUS, SPRINT_STATUS, DEFECT_SEVERITY, DEFECT_STATUS } = require('../config/constants');

const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: 'users', timestamps: false }
);

const Project = sequelize.define(
  'Project',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, defaultValue: '' },
    // [{ userId, role }] — se mantiene embebido (igual que el prototipo en memoria)
    // en vez de una tabla de unión, para minimizar el riesgo de la migración.
    members: { type: DataTypes.JSONB, defaultValue: [] },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: 'projects', timestamps: false }
);

const Sprint = sequelize.define(
  'Sprint',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    projectId: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    startDate: { type: DataTypes.DATEONLY, allowNull: false },
    endDate: { type: DataTypes.DATEONLY, allowNull: false },
    goal: { type: DataTypes.TEXT, defaultValue: '' },
    status: { type: DataTypes.ENUM(...Object.values(SPRINT_STATUS)), defaultValue: SPRINT_STATUS.PLANNED },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: 'sprints', timestamps: false }
);

const UserStory = sequelize.define(
  'UserStory',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    projectId: { type: DataTypes.UUID, allowNull: false },
    sprintId: { type: DataTypes.UUID, allowNull: true },
    title: { type: DataTypes.STRING, allowNull: false },
    asA: { type: DataTypes.STRING, defaultValue: '' },
    iWant: { type: DataTypes.STRING, defaultValue: '' },
    soThat: { type: DataTypes.STRING, defaultValue: '' },
    acceptanceCriteria: { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
    storyPoints: { type: DataTypes.INTEGER, allowNull: true },
    priorityOrder: { type: DataTypes.INTEGER, allowNull: false },
    assignedTo: { type: DataTypes.UUID, allowNull: true },
    status: { type: DataTypes.ENUM(...Object.values(STORY_STATUS)), defaultValue: STORY_STATUS.TODO },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: 'user_stories', timestamps: false }
);

const Defect = sequelize.define(
  'Defect',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    projectId: { type: DataTypes.UUID, allowNull: false },
    sprintId: { type: DataTypes.UUID, allowNull: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, defaultValue: '' },
    severity: { type: DataTypes.ENUM(...Object.values(DEFECT_SEVERITY)), defaultValue: DEFECT_SEVERITY.MEDIUM },
    status: { type: DataTypes.ENUM(...Object.values(DEFECT_STATUS)), defaultValue: DEFECT_STATUS.OPEN },
    reportedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: 'defects', timestamps: false }
);

// Asociaciones (FKs reales; members de Project queda embebido, ver arriba)
Project.hasMany(UserStory, { foreignKey: 'projectId', onDelete: 'CASCADE' });
UserStory.belongsTo(Project, { foreignKey: 'projectId' });

Project.hasMany(Sprint, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Sprint.belongsTo(Project, { foreignKey: 'projectId' });

Sprint.hasMany(UserStory, { foreignKey: 'sprintId' });
UserStory.belongsTo(Sprint, { foreignKey: 'sprintId' });

Project.hasMany(Defect, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Defect.belongsTo(Project, { foreignKey: 'projectId' });

Sprint.hasMany(Defect, { foreignKey: 'sprintId' });
Defect.belongsTo(Sprint, { foreignKey: 'sprintId' });

User.hasMany(UserStory, { foreignKey: 'assignedTo' });
UserStory.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

module.exports = { sequelize, User, Project, Sprint, UserStory, Defect };
