// api/models/user.model.js

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default:
        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    },
    // **CRITICAL FIX:** Ensure the role is defined correctly in the schema.
    // If this field is missing or misconfigured, it will not be returned by your API.
    role: {
      type: String,
      required: true,
      default: 'customer', // Default new users to the least privileged role.
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    favorites: [
      {
        type: String,
        ref: 'Listing',
      },
    ],
    searchHistory: [
      {
        type: String,
      },
    ],
    visitedProperties: [
      {
        listingId: {
          type: String,
          required: true,
        },
        visits: {
          type: Number,
          default: 1,
        },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;