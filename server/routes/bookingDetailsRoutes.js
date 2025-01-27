const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Booking = require('../models/bookings');
const Marker = require('../models/marker');

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
        const pastBookings = [];
        const user = await User.find();  // Fetch all users from the database
        user.forEach((user) => {
            username.push(user.username);
        });
        const bookings = await Booking.find().populate({
            path: 'markerId',
            populate: {
                path: 'floorMapId',
                model: 'FloorMap'
            }
        });

        bookings.forEach((booking) => {
            const endTime = booking.hoursReserved.endTime;
            const bookingDate = new Date(booking.bookingDate.split('/').reverse().join('-'));
            const currentDate = new Date();
            const currentTime = currentDate.getHours() + ':' + currentDate.getMinutes();

            if (bookingDate <= currentDate && (endTime <= currentTime)) {

                pastBookings.push({
                    _id: booking._id,
                });
            } else {
                bookingsCustom.push({
                    _id: booking._id,
                    hoursReserved: booking.hoursReserved,
                    bookingDate: booking.bookingDate,
                    marker: booking.markerId,
                    username: booking.username,
                });
            }
        })

        pastBookings.forEach(async (bookings) => {
            const response = await Booking.deleteOne({ _id: bookings._id });
            //console.log(response);

        })

        // console.log(username);
        // console.log(bookingsCustom);
        res.json({ message: 'Success', username, bookingsCustom });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching floor maps', error });
    }
});

router.get('/explicit', async (req, res) => {
    try {
        const bookingsCustom = [];
        const pastBookings = [];
        const bookings = await Booking.find().populate({
            path: 'markerId',
            populate: {
                path: 'floorMapId',
                model: 'FloorMap'
            }
        });

        bookings.forEach((booking) => {
            const endTime = booking.hoursReserved.endTime;
            const bookingDate = new Date(booking.bookingDate.split('/').reverse().join('-'));
            const currentDate = new Date();
            const currentTime = currentDate.getHours() + ':' + currentDate.getMinutes();

            if (bookingDate <= currentDate && (endTime <= currentTime)) {
                pastBookings.push({ _id: booking._id });
            } else {
                bookingsCustom.push({
                    _id: booking._id,
                    hoursReserved: booking.hoursReserved,
                    bookingDate: booking.bookingDate,
                    marker: booking.markerId.details[0],
                    username: booking.username,
                    purpose: booking.purpose,
                    floorMap: booking.markerId.floorMapId.name,
                    collaborators: booking.collaborators,
                });
            }
        })

        pastBookings.forEach(async (bookings) => {
            const response = await Booking.deleteOne({ _id: bookings._id });
            //console.log(response);

        })

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
        await booked.save();
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
