const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/user.service');

const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getById(req.params.id);
  res.json(user);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.params.id, req.user.id, req.body);
  res.json(user);
});

module.exports = { getUser, updateUser };
