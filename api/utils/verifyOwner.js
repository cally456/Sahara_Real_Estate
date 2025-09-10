// api/utils/verifyOwner.js

import { errorHandler } from './error.js';

export const verifyOwner = (req, res, next) => {
  // This middleware runs AFTER verifyToken.
  // req.user is the full user document from the database.
  if (req.user && req.user.role === 'owner') {
    next(); // User is an owner, proceed.
  } else {
    // User is not an owner, block the request.
    return next(errorHandler(403, 'Only owners can create listings!'));
  }
};