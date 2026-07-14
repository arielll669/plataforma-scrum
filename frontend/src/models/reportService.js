import apiClient from './apiClient';

async function getStatusReport(projectId) {
  const { data } = await apiClient.get(`/projects/${projectId}/reports/status`);
  return data;
}

async function getTeamPerformanceReport(projectId) {
  const { data } = await apiClient.get(`/projects/${projectId}/reports/team-performance`);
  return data;
}

async function getQualityReport(projectId) {
  const { data } = await apiClient.get(`/projects/${projectId}/reports/quality`);
  return data;
}

async function listDefects(projectId) {
  const { data } = await apiClient.get(`/projects/${projectId}/defects`);
  return data;
}

async function createDefect(projectId, defectData) {
  const { data } = await apiClient.post(`/projects/${projectId}/defects`, defectData);
  return data;
}

export default {
  getStatusReport,
  getTeamPerformanceReport,
  getQualityReport,
  listDefects,
  createDefect,
};
