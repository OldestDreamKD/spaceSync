const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Booking = require('../models/bookings');
const Marker = require('../models/marker');

router.post('/upload', async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        // console.log(newBooking);
        const response = await newBooking.save();
        // console.log(response);
        res.status(201).json({ message: 'Bookings Successfully Created' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating booking', error });
    }
});

// Route to fetch all users and bookings
async function getBookings() {
    const bookingsCustom = [];
    const pastBookings = [];

    const bookings = await Booking.find().populate({
        path: 'markerId',
        populate: {
            path: 'floorMapId',
            model: 'FloorMap'
        }
    });

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Remove time part

    bookings.forEach((booking) => {
        const [endHour, endMinute] = booking.hoursReserved.endTime.split(":").map(Number);
        const bookingDate = new Date(booking.bookingDate.split('/').reverse().join('-'));
        bookingDate.setHours(0, 0, 0, 0); // Remove time part

        const currentTimeMinutes = new Date().getHours() * 60 + new Date().getMinutes();
        const endTimeMinutes = endHour * 60 + endMinute;

        if (bookingDate < currentDate || (bookingDate.getTime() === currentDate.getTime() && endTimeMinutes < currentTimeMinutes)) {
            console.log("Moving to past bookings:", booking);
            pastBookings.push(booking._id);
        } else {
            console.log("Keeping booking:", booking);
            bookingsCustom.push({
                _id: booking._id,
                hoursReserved: booking.hoursReserved,
                bookingDate: booking.bookingDate,
                marker: booking.markerId,
                username: booking.username,
                purpose: booking.purpose,
                floorMap: booking.markerId.floorMapId.name,
                collaborators: booking.collaborators,
            });
        }
    });

    for (const bookingId of pastBookings) {
        try {
            const response = await Booking.deleteOne({ _id: bookingId });
            console.log("Deleted booking response:", response);
        } catch (error) {
            console.error("Error deleting booking:", error);
        }
    }

    return bookingsCustom;
}

router.get('/', async (req, res) => {
    try {
        const users = await User.find({}, { username: 1, _id: 0 });
        const username = users.map(user => user.username);
        const bookingsCustom = await getBookings();
        res.json({ message: 'Success', username, bookingsCustom });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching floor maps', error });
    }
});

router.get('/explicit', async (req, res) => {
    try {
        const bookingsCustom = await getBookings();
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
