import apiClient from './apiClient';

async function register({ name, email, password }) {
  const { data } = await apiClient.post('/auth/register', { name, email, password });
  return data;
}

async function login({ email, password }) {
  const { data } = await apiClient.post('/auth/login', { email, password });
  return data;
}

async function me() {
  const { data } = await apiClient.get('/auth/me');
  return data;
}

async function updateProfile(userId, changes) {
  const { data } = await apiClient.put(`/users/${userId}`, changes);
  return data;
}

export default { register, login, me, updateProfile };
