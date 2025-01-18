const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Booking = require('../models/bookings');

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

router.get('/user', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.query.userName }, 'email username');
        console.log(user);
        res.json({ message: 'User retrieved successfully!', user });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Users', error });
    }
})

router.delete('/userDelete', async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ username: req.query.userName });
        const bookings = await Booking.deleteMany({ username: req.query.userName });
        console.log(user);
        console.log(bookings);
        res.status(200).json({ message: 'User and related bookings deleted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting User', error });
    }
})

module.exports = router;  