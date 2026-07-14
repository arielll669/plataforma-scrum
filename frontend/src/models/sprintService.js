import apiClient from './apiClient';

async function list(projectId) {
  const { data } = await apiClient.get(`/projects/${projectId}/sprints`);
  return data;
}

async function create(projectId, sprintData) {
  const { data } = await apiClient.post(`/projects/${projectId}/sprints`, sprintData);
  return data;
}

async function close(sprintId) {
  const { data } = await apiClient.put(`/sprints/${sprintId}/close`);
  return data;
}

async function addItem(sprintId, storyId) {
  const { data } = await apiClient.post(`/sprints/${sprintId}/items`, { storyId });
  return data;
}

async function listItems(sprintId) {
  const { data } = await apiClient.get(`/sprints/${sprintId}/items`);
  return data;
}

async function getBoard(sprintId) {
  const { data } = await apiClient.get(`/sprints/${sprintId}/board`);
  return data;
}

async function getProgress(sprintId) {
  const { data } = await apiClient.get(`/sprints/${sprintId}/progress`);
  return data;
}

export default { list, create, close, addItem, listItems, getBoard, getProgress };
