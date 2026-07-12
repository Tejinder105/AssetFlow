// TODO: Implement user management controllers
// These should follow the same pattern as auth.controller.js:
//   - Thin controllers that delegate to a user.service.js
//   - Use asyncHandler wrapper
//   - Return ApiResponse instances
//
// Example:
//   import { asyncHandler } from "../utils/asynchandler.js";
//   import { ApiResponse } from "../utils/apiresponse.js";
//   import * as userService from "../services/user.service.js";
//
//   export const getAllUsers = asyncHandler(async (req, res) => {
//       const users = await userService.listUsers(req.query);
//       res.status(200).json(new ApiResponse(200, { users }, "Users fetched"));
//   });