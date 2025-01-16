const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Booking = require('../models/bookings');

router.post('/upload', async (req, res) => {
    const newBooking = new Booking(req.body);
    const response = await newBooking.save();
    res.status(201).json({ message: 'Bookings Succesfully Created' });
});

// Route to fetch all users and bookings
router.get('/', async (req, res) => {
    try {
        const username = [];
        const bookingsCustom = [];
        const user = await User.find();  // Fetch all users from the database
        user.forEach((user) => {
            username.push(user.username);
        });
        const bookings = await Booking.find();  // Fetch all bookings from the database
        bookings.forEach((bookings) => {
            bookingsCustom.push({
                _id: bookings._id,
                hoursReserved: bookings.hoursReserved,
                bookingDate: bookings.bookingDate,
                marker: bookings.markerId,
                username: bookings.username,
            });
        })
        const bookings2 = await Booking.find().populate('markerId');
        res.json({ message: 'Success', username, bookingsCustom });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching floor maps', error });
    }
});

router.get('/explicit', async (req, res) => {
    try {
        const bookingsCustom = [];
        const bookings = await Booking.find().populate({
            path: 'markerId',
            populate: {
                path: 'floorMapId',
                model: 'FloorMap'
            }
        });
        bookings.forEach((bookings) => {
            bookingsCustom.push({
                _id: bookings._id,
                hoursReserved: bookings.hoursReserved,
                bookingDate: bookings.bookingDate,
                marker: bookings.markerId.details[0],
                username: bookings.username,
                purpose: bookings.purpose,
                floorMap: bookings.markerId.floorMapId.name,
                collaborators: bookings.collaborators,
            });
        })
        console.log(bookingsCustom)
        res.json({ message: 'Success', bookingsCustom });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Bookings', error });
    }
});

router.put('/update', async (req, res) => {
    try {
        const bookedId = req.body._id;
        const newBookedDetails = req.body;
        const booked = await Booking.findOne({ "_id": bookedId });
        booked.hoursReserved = newBookedDetails.hoursReserved;
        booked.bookingDate = newBookedDetails.bookingDate;
        booked.purpose = newBookedDetails.purpose;
        booked.collaborators = newBookedDetails.collaborators;
        const response = await booked.save();
        res.status(201).json({ message: 'Bookings succesfully updated!' });
    } catch (error) {
        res.status(500).json({ message: 'Error updaing Bookings', error });
    }
});

router.delete('/delete', async (req, res) => {
    try {
        const bookedId = req.query._id;
        const response = await Booking.deleteOne({ _id: bookedId })
        if (response.deletedCount === 1) {
            res.status(201).json({ message: 'Booking deleted successfully!' });
        } else {
            res.status(404).json({ message: 'Booking not found!' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting Bookings', error });
    }
})

module.exports = router;  
