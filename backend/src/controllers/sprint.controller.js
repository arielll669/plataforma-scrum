const asyncHandler = require('../utils/asyncHandler');
const sprintService = require('../services/sprint.service');

const listSprints = asyncHandler(async (req, res) => {
  const sprints = await sprintService.listSprints(req.params.projectId);
  res.json(sprints);
});

const createSprint = asyncHandler(async (req, res) => {
  const sprint = await sprintService.createSprintForProject(req.params.projectId, req.body);
  res.status(201).json(sprint);
});

const closeSprint = asyncHandler(async (req, res) => {
  const sprint = await sprintService.closeSprint(req.params.id, req.user.id);
  res.json(sprint);
});

const addItem = asyncHandler(async (req, res) => {
  const story = await sprintService.addItemToSprint(req.params.id, req.user.id, req.body.storyId);
  res.status(201).json(story);
});

const listItems = asyncHandler(async (req, res) => {
  const items = await sprintService.listSprintItems(req.params.id);
  res.json(items);
});

const getBoard = asyncHandler(async (req, res) => {
  const board = await sprintService.getBoard(req.params.id);
  res.json(board);
});

const getProgress = asyncHandler(async (req, res) => {
  const progress = await sprintService.getProgress(req.params.id);
  res.json(progress);
});

module.exports = { listSprints, createSprint, closeSprint, addItem, listItems, getBoard, getProgress };
