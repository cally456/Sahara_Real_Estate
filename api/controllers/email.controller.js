
import nodemailer from 'nodemailer';

export const sendEmail = async (req, res) => {
  const { listingId, message, recipientEmail } = req.body;

  if (!listingId || !message || !recipientEmail) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields',
    });
  }

  try {
    // Create transporter for Mailtrap
    const transporter = nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });

    const mailOptions = {
      from: '"Sahara Estate" <no-reply@saharaestate.com>',
      to: recipientEmail,
      subject: `New message regarding your listing ${listingId}`,
      text: message,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send email',
    });
  }
};

export const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });

    const mailOptions = {
      from: '"Sahara Estate" <no-reply@saharaestate.com>',
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};
