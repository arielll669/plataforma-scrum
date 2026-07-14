function createUser({ id, name, email, passwordHash }) {
  return {
    id,
    name,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
}

function toPublicUser(user) {
  if (!user) return null;
  const { passwordHash, ...publicUser } = user; // eslint-disable-line no-unused-vars
  return publicUser;
}

module.exports = { createUser, toPublicUser };
