const mongoose = require("mongoose");

const bookingsSchema = new mongoose.Schema({
    username: {
        type: mongoose.Schema.Types.String,
        ref: 'User',  // This will reference the 'User' model
        required: true// Ensure this is the intended unique field
    },
    markerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Marker',  // This will reference the 'Marker' model
        required: true
    },
    bookingDate: {
        type: String,
        required: true
    },
    hoursReserved: {
        startTime: {
            type: String,
            required: true,
        },
        endTime: {
            type: String,
            required: true,
        },
    },
    purpose: {
        type: String,
        required: true,
    },
    collaborators: [{
        type: mongoose.Schema.Types.String,
        ref: 'User',  // This will reference the 'User' model
    }],
});


module.exports = mongoose.model("Bookings", bookingsSchema);