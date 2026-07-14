const asyncHandler = require('../utils/asyncHandler');
const projectService = require('../services/project.service');

const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createNewProject(req.body, req.user.id);
  res.status(201).json(project);
});

const listProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.listForUser(req.user.id);
  res.json(projects);
});

const getProject = asyncHandler(async (req, res) => {
  const project = await projectService.getByIdForUser(req.params.projectId, req.user.id);
  res.json(project);
});

const addMember = asyncHandler(async (req, res) => {
  const project = await projectService.addMember(req.params.projectId, req.body);
  res.status(201).json(project);
});

const reassignRole = asyncHandler(async (req, res) => {
  const project = await projectService.reassignRole(req.params.projectId, req.params.userId, req.body);
  res.json(project);
});

module.exports = { createProject, listProjects, getProject, addMember, reassignRole };
