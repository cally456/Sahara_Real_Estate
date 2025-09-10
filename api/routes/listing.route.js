// api/routes/listing.route.js

import express from 'express';
import { createListing, deleteListing, updateListing, getListing, getListings } from '../controllers/listing.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { verifyOwner } from '../utils/verifyOwner.js'; // <-- Import verifyOwner

const router = express.Router();

// Apply the complete security chain to the create route:
// 1. verifyToken: Confirms the user is logged in and gets their full profile.
// 2. verifyOwner: Confirms the logged-in user has the 'owner' role.
router.post('/create', verifyToken, verifyOwner, createListing);

// Apply protection to other routes as needed
router.delete('/delete/:id', verifyToken, deleteListing);
router.post('/update/:id', verifyToken, updateListing);
router.get('/get/:id', getListing);
router.get('/get', getListings);

export default router;