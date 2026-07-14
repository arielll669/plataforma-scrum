const asyncHandler = require('../utils/asyncHandler');
const reportService = require('../services/report.service');

const getStatusReport = asyncHandler(async (req, res) => {
  const report = await reportService.getStatusReport(req.params.projectId);
  res.json(report);
});

const getTeamPerformanceReport = asyncHandler(async (req, res) => {
  const report = await reportService.getTeamPerformanceReport(req.params.projectId);
  res.json(report);
});

const getQualityReport = asyncHandler(async (req, res) => {
  const report = await reportService.getQualityReport(req.params.projectId);
  res.json(report);
});

module.exports = { getStatusReport, getTeamPerformanceReport, getQualityReport };
