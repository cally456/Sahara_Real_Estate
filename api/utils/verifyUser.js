// api/utils/verifyUser.js

import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';
import User from '../models/user.model.js';

export const verifyToken = async (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return next(errorHandler(401, 'Unauthorized'));
  }

  try {
    // 1. Verify the token and get the payload (which contains the user's ID)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
        return next(errorHandler(404, 'User not found'));
    }

    // 3. Attach the complete user object (including the role) to the request.
    req.user = user;

    next();
  } catch (error) {
    return next(errorHandler(403, 'Forbidden'));
  }
};