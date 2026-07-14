function createProject({ id, name, description, ownerId }) {
  return {
    id,
    name,
    description: description || '',
    members: [{ userId: ownerId, role: 'product_owner' }],
    createdAt: new Date().toISOString(),
  };
}

module.exports = { createProject };
