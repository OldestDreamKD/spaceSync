const User = require("../models/user");
const bcrypt = require("bcryptjs");
require('dotenv').config();
const nodemailer = require("nodemailer");
const waitingUser = require('../models/waitingUser');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "karthik97vk@gmail.com",
    pass: process.env.APP_PASSWORD,
  },
});

const sendEmail = async (email, username) => {
  const mailOptions = {
    from: "karthik97vk@gmail.com",
    to: email,
    subject: "SpaceSync Registration",
    html: `<div class="container">
        <h2>Dear, <span> ${username}</span>! </h2>
       <p>Your account has been successfully . You can now log in and start using SpaceSync.</p>
       <p class="footer">If you did not register for this, please ignore this email.</p>
    </div>`
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  };
};

exports.register = async (req, res) => {
  const { email, password, username, designation, subordinates, organization } = req.body;
  try {
    // Check for duplicates before saving
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email or username already exists" });
    }
    console.log(existingUser)
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      designation,
      subordinates,
      organization
    });
    const response = await newUser.save();
    console.log("User created:", response);
    sendEmail(email, username);

    const deleteWaiting = await waitingUser.deleteOne({ username: username });
    console.log("Deleted from waiting:", deleteWaiting);

    res.status(201).json({ message: "Registration successful", userId: response._id });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;
  // console.log(req.body);

  try {
    const user = await User.findOne({ email });
    // console.log(user);
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });

    } else if (await bcrypt.compare(password, user.password)) {
      console.log(user);
      res.status(200).json({ message: "Login successful", userId: user._id, username: user.username });
    } else {
      return res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.status(200).json({ message: "Logged out successfully" });
};