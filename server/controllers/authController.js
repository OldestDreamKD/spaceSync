const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  const { email, password, username } = req.body;
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

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: "employee",
    });
    const response = await newUser.save();
    // console.log("User created:", response);
    res.status(201).json({ message: "Registration successful", user: username });
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
      // console.log(user);
      res.status(200).json({ message: "Login successful", user: user.username });
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