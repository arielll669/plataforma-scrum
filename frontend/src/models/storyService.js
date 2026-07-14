import apiClient from './apiClient';

async function getBacklog(projectId) {
  const { data } = await apiClient.get(`/projects/${projectId}/backlog`);
  return data;
}

async function create(projectId, storyData) {
  const { data } = await apiClient.post(`/projects/${projectId}/stories`, storyData);
  return data;
}

async function update(storyId, changes) {
  const { data } = await apiClient.put(`/stories/${storyId}`, changes);
  return data;
}

async function remove(storyId) {
  const { data } = await apiClient.delete(`/stories/${storyId}`);
  return data;
}

async function reorder(projectId, orderedIds) {
  const { data } = await apiClient.put(`/projects/${projectId}/backlog/reorder`, { orderedIds });
  return data;
}

async function updateStatus(storyId, status) {
  const { data } = await apiClient.put(`/stories/${storyId}/status`, { status });
  return data;
}

export default { getBacklog, create, update, remove, reorder, updateStatus };
