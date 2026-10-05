const nodemailer = require('nodemailer');

// Create transporter — returns null if credentials are not configured
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send welcome email for new registrations
const sendWelcomeEmail = async (email, firstName) => {
  try {
    const transporter = createTransporter();
    if (!transporter) return;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Euforia! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FB8B24, #DDAA52); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to Euforia!</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #333;">Hi ${firstName}!</h2>
            <p style="color: #666; line-height: 1.6;">
              Thank you for joining Euforia! We're excited to help you discover amazing events in your area.
            </p>
            <p style="color: #666; line-height: 1.6;">
              With your new account, you can:
            </p>
            <ul style="color: #666; line-height: 1.6;">
              <li>Discover events within 50km of your location</li>
              <li>Filter events by category</li>
              <li>RSVP to events you're interested in</li>
              <li>Share events with friends</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
                 style="background: linear-gradient(135deg, #FB8B24, #DDAA52); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                Start Exploring Events
              </a>
            </div>
            <p style="color: #666; line-height: 1.6;">
              Happy event hunting!<br>
              The Euforia Team
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', email);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

// Send sign-in notification email
const sendSignInEmail = async (email, firstName) => {
  try {
    const transporter = createTransporter();
    if (!transporter) return;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome back to Euforia! 👋',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FB8B24, #DDAA52); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome Back!</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #333;">Hi ${firstName}!</h2>
            <p style="color: #666; line-height: 1.6;">
              Welcome back to Euforia! We're glad to see you again.
            </p>
            <p style="color: #666; line-height: 1.6;">
              Ready to discover new events? Check out what's happening in your area!
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
                 style="background: linear-gradient(135deg, #FB8B24, #DDAA52); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                Explore Events
              </a>
            </div>
            <p style="color: #666; line-height: 1.6;">
              Happy exploring!<br>
              The Euforia Team
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Sign-in email sent to:', email);
  } catch (error) {
    console.error('Error sending sign-in email:', error);
  }
};

// Send OTP email
const sendOTPEmail = async (email, firstName, otp) => {
  try {
    const transporter = createTransporter();
    if (!transporter) return;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Euforia Password Reset Code 🔐',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FB8B24, #DDAA52); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Password Reset</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #333;">Hi ${firstName}!</h2>
            <p style="color: #666; line-height: 1.6;">
              You requested to reset your password. Use the code below to continue:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #f0f0f0; border: 2px dashed #ccc; padding: 20px; border-radius: 8px; display: inline-block;">
                <span style="font-size: 32px; font-weight: bold; color: #333; letter-spacing: 4px;">${otp}</span>
              </div>
            </div>
            <p style="color: #666; line-height: 1.6;">
              This code will expire in 5 minutes for security reasons.
            </p>
            <p style="color: #666; line-height: 1.6;">
              If you didn't request this, please ignore this email.
            </p>
            <p style="color: #666; line-height: 1.6;">
              Best regards,<br>
              The Euforia Team
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP email sent to:', email);
  } catch (error) {
    console.error('Error sending OTP email:', error);
  }
};

// Send password reset confirmation email
const sendPasswordResetConfirmationEmail = async (email, firstName) => {
  try {
    const transporter = createTransporter();
    if (!transporter) return;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Successful ✅',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FB8B24, #DDAA52); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Password Reset Successful</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #333;">Hi ${firstName}!</h2>
            <p style="color: #666; line-height: 1.6;">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
                 style="background: linear-gradient(135deg, #FB8B24, #DDAA52); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                Sign In Now
              </a>
            </div>
            <p style="color: #666; line-height: 1.6;">
              If you didn't make this change, please contact our support team immediately.
            </p>
            <p style="color: #666; line-height: 1.6;">
              Stay secure!<br>
              The Euforia Team
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset confirmation email sent to:', email);
  } catch (error) {
    console.error('Error sending password reset confirmation email:', error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendSignInEmail,
  sendOTPEmail,
  sendPasswordResetConfirmationEmail
};