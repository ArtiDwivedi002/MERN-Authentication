import jwt from 'jsonwebtoken';
import userModel from "../models/userModels.js";
import bcrypt from 'bcryptjs';
import transporter from '../config/nodemailer.js';
import { EMAIL_VERIFY_TEMPLATE,PASSWORD_RESET_TEMPLATE } from '../config/emailTemplate.js';

// REGISTER
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send welcome email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: `Welcome to Arti`,
      text: `Welcome to our website, your account has been created on email id ${email}`,
    };
    await transporter.sendMail(mailOptions);

    // Send response with token + user info
    res.json({
      success: true,
      message: "Register successfully",
      token,
      userData: { name: user.name, isAccountVerify: user.isAccountVerify },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ success: false, message: "Email and password are required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid Email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Password" });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send response with token + user info
    res.json({
      success: true,
      message: "Login successfully",
      token,
      userData: { name: user.name, isAccountVerify: user.isAccountVerify },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//logout
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.json({ success: true, message: "Logout successfully" });

    } catch (error) {
        res.json({ success: false, message: error.message });

    }
}
//Send verification otp
export const sendVerifyOtp = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await userModel.findById(userId);
        if (user.isAccountVerify) {
            return res.json({ success: false, message: "Account already Verified" });
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: `Account Verification Otp`,
            // text: `Your otp is ${otp}.Verify your account using this otp`,
            html:EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        }
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Verification otp sent on your email account" });
    } catch (error) {
        res.json({ success: false, error: error.message })
    }
}
// To verify the email Account with Otp
export const VerifyEmailAccount = async (req, res) => {
    const userId = req.user.id;
    const { otp } = req.body;
    if (!userId || !otp) {
        return res.json({ success: false, message: "Missing Details" });
    }
    const user = await userModel.findById(userId);
    if (user.verifyOtp === '' || user.verifyOtp !== otp) {
        return res.json({ success: false, message: "Invalid Otp" });
    }
    if (!user) {
        return res.json({ success: false, message: "User not found" });
    }
    if (user.verifyOtpExpireAt < Date.now()) {
        return res.json({ success: false, message: "Otp is expired" });
    }
    user.isAccountVerify = true;
    user.verifyOtp = '';
    user.verifyOtpExpireAt = 0;
    await user.save();
    return res.json({ success: true, message: "Email verification successfully" });
}
//Check if user is authenticated 
export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true, message: "User is Authenticated" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
//Send Password for reset otp
export const sendResetOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.json({ success: false, message: "Email is required" });
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
        await user.save();
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: `password reset  Otp`,
            // text: `Your otp  for resetting password is ${otp}. Use this otp to proceed with resetting your password `
            html:PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        }
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Otp sent on your email account" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
//Reset user Password
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: "Email , otp and new Password is required" });
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
            if (user.resetOtp === '' || user.resetOtp !== otp) {
                return res.json({ success: false, message: "Invalid otp" });
            }
            if (user.resetOtpExpireAt < Date.now()) {
                return res.json({ success: false, message: "Otp has expired" });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            user.resetOtp = '';
            user.resetOtpExpireAt = 0;
            await user.save();
            return res.json({ success: true, message: "Password has been reset successfully" });
        }
    catch (error) {
        res.json({ success: false, message: error.message });
    }

}