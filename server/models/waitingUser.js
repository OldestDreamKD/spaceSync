const mongoose = require("mongoose");

const waitingUserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Ensure this is the intended unique field
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
    designation: {
        type: String,
        required: true,
    },
    organization: {
        type: String,
        required: true,
    },
    subordinates: {
        type: String,
        required: true,
    },
});


module.exports = mongoose.model("waitingUser", waitingUserSchema);
