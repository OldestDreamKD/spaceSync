const express = require('express');
const router = express.Router();
const waitingUser = require('../models/waitingUser');
require('dotenv').config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "karthik97vk@gmail.com",  // Your Gmail
        pass: process.env.APP_PASSWORD,   // Use App Password
    },
});

const sendEmail = async (email, username) => {
    const mailOptions = {
        from: "karthik97vk@gmail.com",
        to: email,
        subject: "SpaceSync Registration",
        html: `<div class="container">
        <h2>Dear, <span> ${username}</span>! </h2>
        <p>we regret to inform you that your registration request has been declined into SpaceSync.</p>
        <p>If you believe this was an error, you can contact our support team.</p>
        <p>You can also try registering again with updated details..</p>
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



router.post("/", async (req, res) => {
    console.log(req.body);
    const { email, password, username, designation, subordinates, organization } = req.body;
    try {
        // Check for duplicates before saving
        const existingUser = await waitingUser.findOne({
            $or: [{ email }, { username }],
        });

        if (existingUser) {
            return res
                .status(400)
                .json({ message: "User with this email or username already exists" });
        }


        // Save new user
        const newUser = new waitingUser({
            username,
            email,
            password: password,
            designation,
            subordinates,
            organization
        });
        const response = await newUser.save();
        console.log("User created:", response);
        res.status(201).json({ message: "Registration successful", userId: response._id });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.get("/requests", async (req, res) => {
    try {
        console.log("srhghksh")
        const user = await waitingUser.find();
        console.log(user);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


router.delete('/reject', async (req, res) => {
    try {
        const profile = req.query;
        console.log(profile);
        const response = await waitingUser.deleteOne({ _id: profile._id });
        console.log(response);
        sendEmail(profile.email, profile.username);

        res.json({ message: "User deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});



module.exports = router;