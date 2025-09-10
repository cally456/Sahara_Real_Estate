import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import Listing from '../models/listing.model.js';
import nodemailer from 'nodemailer';

export const test = (req, res) => {
  res.json({
    message: 'Api route is working!',
  });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, 'You can only update your own account!'));
  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, 'You can only delete your own account!'));
  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie('access_token');
    res.status(200).json('User has been deleted!');
  } catch (error) {
    next(error);
  }
};

export const getUserListings = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      const listings = await Listing.find({ userRef: req.params.id });
      res.status(200).json(listings);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, 'You can only view your own listings!'));
  }
};

export const getUser = async (req, res, next) => {
  try {
    
    const user = await User.findById(req.params.id);
  
    if (!user) return next(errorHandler(404, 'User not found!'));
  
    const { password: pass, ...rest } = user._doc;
  
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const contactOwner = async (req, res, next) => {
  try {
    const { ownerId, customerName, customerEmail, message, listingName } = req.body;

    // 1. Find the property owner to get their email
    const owner = await User.findById(ownerId);
    if (!owner) {
      return next(errorHandler(404, 'Property owner not found!'));
    }
    const ownerEmail = owner.email;

    // 2. Configure the email transporter using Nodemailer and Mailtrap
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });

    // 3. Define the email options
    const mailOptions = {
      from: 'inquiry@saharaestate.com', // A generic sender email
      to: ownerEmail, // The actual property owner's email
      subject: `[SaharaEstate] Inquiry about your property: ${listingName}`,
      html: `
        <p>Hello ${owner.username},</p>
        <p>You have received a new inquiry about your property, "${listingName}".</p>
        <hr>
        <p><strong>From:</strong> ${customerName} (${customerEmail})</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <hr>
        <p>You can reply directly to ${customerEmail} to respond to this inquiry.</p>
        <p>Thank you for using SaharaEstate.</p>
      `,
    };

    // 4. Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Message sent successfully!' });

  } catch (error) {
    next(error);
  }
};
