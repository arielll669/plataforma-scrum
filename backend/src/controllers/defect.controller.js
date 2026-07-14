const asyncHandler = require('../utils/asyncHandler');
const defectService = require('../services/defect.service');

const listDefects = asyncHandler(async (req, res) => {
  const defects = await defectService.listDefects(req.params.projectId);
  res.json(defects);
});

const createDefect = asyncHandler(async (req, res) => {
  const defect = await defectService.createDefectForProject(req.params.projectId, req.body);
  res.status(201).json(defect);
});

module.exports = { listDefects, createDefect };
