const express = require('express');
const authrouter = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/Users');
const jwt = require('jsonwebtoken');
const {AuthenticateUser,AuthenticateSeller} = require('../middlewares/AuthenticateUser');
const Businesses = require('../models/Businesses');
// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

authrouter.post('/signup', async (req, res) => {
  try {
    const { name, phone, email, password,signupseller } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Encrypt password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification token
    const token = crypto.randomBytes(20).toString('hex');

    // Create new user
    const newUser = new User({
      name,
      phone,
      email,
      password: hashedPassword,
      emailVerificationToken: token,
      signupseller,
      emailVerificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    // Save user to database
    const savedUser = await newUser.save();

    // Send email verification link Please click this <a href="${process.env.BASE_URL}/verify-email/${token}">link</a> to verify your email.
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email',
      html: `<!DOCTYPE html>
      <html>
      <head>
      
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <title>Email Confirmation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style type="text/css">
        /**
         * Google webfonts. Recommended to include the .woff version for cross-client compatibility.
         */
        @media screen {
          @font-face {
            font-family: 'Source Sans Pro';
            font-style: normal;
            font-weight: 400;
            src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format('woff');
          }
          @font-face {
            font-family: 'Source Sans Pro';
            font-style: normal;
            font-weight: 700;
            src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format('woff');
          }
        }
        /**
         * Avoid browser level font resizing.
         * 1. Windows Mobile
         * 2. iOS / OSX
         */
        body,
        table,
        td,
        a {
          -ms-text-size-adjust: 100%; /* 1 */
          -webkit-text-size-adjust: 100%; /* 2 */
        }
        /**
         * Remove extra space added to tables and cells in Outlook.
         */
        table,
        td {
          mso-table-rspace: 0pt;
          mso-table-lspace: 0pt;
        }
        /**
         * Better fluid images in Internet Explorer.
         */
        img {
          -ms-interpolation-mode: bicubic;
        }
        /**
         * Remove blue links for iOS devices.
         */
        a[x-apple-data-detectors] {
          font-family: inherit !important;
          font-size: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
          color: inherit !important;
          text-decoration: none !important;
        }
        /**
         * Fix centering issues in Android 4.4.
         */
        div[style*="margin: 16px 0;"] {
          margin: 0 !important;
        }
        body {
          width: 100% !important;
          height: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        /**
         * Collapse table borders to avoid space between cells.
         */
        table {
          border-collapse: collapse !important;
        }
        a {
          color: purple;
        }
        img {
          height: auto;
          line-height: 100%;
          text-decoration: none;
          border: 0;
          outline: none;
        }
        </style>
      
      </head>
      <body style="background-color: #e9ecef;">
      
        <!-- start preheader -->
        <div class="preheader" style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
          A preheader is the short summary text that follows the subject line when an email is viewed in the inbox.
        </div>
        
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
      
          <!-- start logo -->
          <tr>
            <td align="center" bgcolor="#e9ecef">
           
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                <tr>
                  <td align="center" valign="top" style="padding: 36px 24px;">
                    <a href="https://africabnetworking.ca" target="_blank" style="display: inline-block;">
                      <div src="" alt="Logo" border="0" width="48" style="display: block; width: 48px; max-width: 48px; min-width: 48px;" />
                    </a>
                  </td>
                </tr>
              </table>
              <!--[if (gte mso 9)|(IE)]>
              </td>
              </tr>
              </table>
              <![endif]-->
            </td>
          </tr>
          <!-- end logo -->
      
          <!-- start hero -->
          <tr>
            <td align="center" bgcolor="#e9ecef">
          
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                <tr>
                  <td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
                    <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">Confirm Your Email Address</h1>
                  </td>
                </tr>
              </table>
           
            </td>
          </tr>
        
          <tr>
            <td align="center" bgcolor="#e9ecef">
         
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
      
                <tr>
                  <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                    <p style="margin: 0;">Tap the button below to confirm your email address. If you didn't create an account with <a href="https://africabnetworking.ca">Africab Networking Canada</a>, you can safely delete this email.</p>
                  </td>
                </tr>
               
                <tr>
                  <td align="left" bgcolor="#ffffff">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" bgcolor="#ffffff" style="padding: 12px;">
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center" bgcolor="purple" style="border-radius: 6px;">
                                <a href="${process.env.BASE_URL}/api/auth/verify-email/${token}" target="_blank" style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;">Click to Verify</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
           
                <tr>
                  <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                    <p style="margin: 0;">If that doesn't work, copy and paste the following link in your browser:</p>
                    <p style="margin: 0;"><a href="${process.env.BASE_URL}/api/auth/verify-email/${token}" target="_blank">${process.env.BASE_URL}/api/auth/verify-email/${token}</a></p>
                  </td>
                </tr>
            
                <tr>
                  <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf">
                    <p style="margin: 0;">Cheers,<br> Africab Networking Canada</p>
                  </td>
                </tr>
                <!-- end copy -->
      
              </table>
         
            </td>
          </tr>
         
          <tr>
            <td align="center" bgcolor="#e9ecef" style="padding: 24px;">
       
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
      
                <!-- start permission -->
                <tr>
                  <td align="center" bgcolor="#e9ecef" style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
                    <p style="margin: 0;">You received this email because we received a request for Signup with this mail. If you didn't request for signup you can safely delete this email.</p>
                  </td>
                </tr>
          
              </table>
           
            </td>
          </tr>
          <!-- end footer -->
      
        </table>
        <!-- end body -->
      
      </body>
      </html>`
    };
    await transporter.sendMail(mailOptions);

    // Respond with success message and user data
    res.status(201).json({success:true, message: 'User created, please verify your email', user: savedUser });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({success:false,  message: 'Server error' })
  }
});

authrouter.get('/verify-email/:token', async (req, res) => {
  try {
    // Find user with the provided email verification token
    const user = await User.findOne({
      emailVerificationToken: req.params.token,
      emailVerificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired email verification token' });
    }

    // Update user email verification status
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save();

    // Respond with success message
    res.status(200).redirect(`${process.env.FRONTEND}/signin`);
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({success:false,  message: 'Server error' });
  }
});

authrouter.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({success:false,  message: 'Invalid credentials' });
      }
  
      // Check if password is correct
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({success:false,  message: 'Invalid credentials' });
      }
  
      // Check if email is verified
      if (!user.emailVerified) {
        return res.status(401).json({success:false,  message: 'Please verify your email' });
      }
      
      // Create and sign JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email},
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      // Redirect to Create Seller page 
      var redirect;
      if(user.signupseller){
        if(!user.business){
           redirect=true
        }
      }
      // Respond with success message and JWT token
      res.status(200).json({success:true,  message: 'Logged in successfully', token,redirect });
    } catch (error) {
      console.error(error);
      res.status(500).json({success:false,  message: 'Server error' });
    }
  });
// Get all users
authrouter.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({success:true, users});
  } catch (error) {
    console.error(error);
    res.status(500).json({ success:false, message: 'Server error' });
  }
});

// Get user by ID
authrouter.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({success:true, user});
  } catch (error) {
    console.error(error);
    res.status(500).json({success:false,  message: 'Server error' });
  }
});

// Update user by ID
authrouter.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, phone, email, password } = req.body;

    // Hash password if provided
    let hashedPassword;
    if (password) {
      const salt = await bcrypt.genSalt();
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone, email, password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({success:true, user});
  } catch (error) {
    console.error(error);
    res.status(500).json({ success:false, message: 'Server error' });
  }
});

// Delete user by ID
authrouter.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({success:true,  message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success:false, message: 'Server error' });
  }
});


// Forgot password
authrouter.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({success:false,  message: 'User not found' });
    }

    // Generate password reset token
    const passwordResetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );
    const passwordResetUrl = `${process.env.APP_BASE_URL}/reset-password?token=${passwordResetToken}`;

    // Send password reset email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset',
      html: `<p>Please click <a href="${passwordResetUrl}">here</a> to reset your password.</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to send email' });
      }
      console.log(`Password reset email sent: ${info.response}`);
      res.status(200).json({success:true,  message: 'Password reset email sent' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
authrouter.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    // Verify token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken || !decodedToken.userId) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // Find user by ID
    const user = await User.findById(decodedToken.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({success:true,  message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Reset password
authrouter.post('/isloggedin',AuthenticateUser, async (req, res) => {
  try {
    res.status(200).json({success:true, user:req.user, message: 'User is logged In' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Reset password
authrouter.post('/isseller',AuthenticateUser,AuthenticateSeller, async (req, res) => {
  try {
    const seller=await Businesses.findOne({user:req.id}).populate("user","email")
    res.status(200).json({success:true,seller, message: 'User is logged In' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = authrouter;
