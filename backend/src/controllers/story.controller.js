const asyncHandler = require('../utils/asyncHandler');
const storyService = require('../services/story.service');

const getBacklog = asyncHandler(async (req, res) => {
  const backlog = await storyService.getBacklog(req.params.projectId);
  res.json(backlog);
});

const createStory = asyncHandler(async (req, res) => {
  const story = await storyService.createStory(req.params.projectId, req.body);
  res.status(201).json(story);
});

const updateStory = asyncHandler(async (req, res) => {
  const story = await storyService.updateStory(req.params.id, req.user.id, req.body);
  res.json(story);
});

const deleteStory = asyncHandler(async (req, res) => {
  const result = await storyService.deleteStory(req.params.id, req.user.id);
  res.json(result);
});

const reorderBacklog = asyncHandler(async (req, res) => {
  const backlog = await storyService.reorderBacklog(req.params.projectId, req.body.orderedIds);
  res.json(backlog);
});

const updateStatus = asyncHandler(async (req, res) => {
  const story = await storyService.updateStatus(req.params.id, req.user.id, req.body.status);
  res.json(story);
});

module.exports = { getBacklog, createStory, updateStory, deleteStory, reorderBacklog, updateStatus };
