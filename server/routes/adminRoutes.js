const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Booking = require('../models/bookings');
const Marker = require('../models/marker');
const FloorMap = require('../models/floorMap');

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, 'email username');
        console.log(users);
        const allBookings = await Booking.aggregate([
            { $group: { _id: "$username", count: { $sum: 1 } } }
        ]);
        console.log(allBookings);
        const usersWithBookings = users.map((user) => {
            const booking = allBookings.find(b => b._id === user.username);
            return { user, bookingCount: booking ? booking.count : 0 };
        });
        console.log(usersWithBookings);
        res.json({ message: 'Users retrieved successfully!', usersWithBookings });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Users', error });
    }
})

module.exports = router;  