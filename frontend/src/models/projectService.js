import apiClient from './apiClient';

async function list() {
  const { data } = await apiClient.get('/projects');
  return data;
}

async function getById(projectId) {
  const { data } = await apiClient.get(`/projects/${projectId}`);
  return data;
}

async function create({ name, description }) {
  const { data } = await apiClient.post('/projects', { name, description });
  return data;
}

async function addMember(projectId, { email, role }) {
  const { data } = await apiClient.post(`/projects/${projectId}/members`, { email, role });
  return data;
}

async function reassignRole(projectId, userId, role) {
  const { data } = await apiClient.put(`/projects/${projectId}/members/${userId}`, { role });
  return data;
}

export default { list, getById, create, addMember, reassignRole };
