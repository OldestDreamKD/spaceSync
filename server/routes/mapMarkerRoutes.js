const express = require('express');
const router = express.Router();
const Marker = require('../models/marker');
const FloorMap = require('../models/floorMap');
const Booking = require('../models/bookings');

router.post('/upload', async (req, res) => {
    try {
        const marker = req.body;
        const floorMap = await FloorMap.findOne({ url: marker.mapId });
        const newmarker = new Marker({
            floorMapId: floorMap._id,
            lat: marker.lat,
            lng: marker.lng,
            details: marker.details,
        });
        const response = await newmarker.save();
        res.status(201).json({ message: 'Markers succesfully saved!' });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching floor maps', error });
    }
});

router.get('/', async (req, res) => {
    try {
        const mapUrl = req.query.mapId;
        const floorMap = await FloorMap.findOne({ url: mapUrl });
        const markerId = floorMap._id;
        const floorMarkers = await Marker.find({ floorMapId: markerId });
        res.json(floorMarkers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching floor maps', error });
    }
});

router.get('/markerDetails', async (req, res) => {
    try {
        const markerId = req.query.markerId;
        const marker = await Marker.findById({ "_id": markerId });
        res.json(marker);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching markers', error });
    }
});

router.put('/update', async (req, res) => {
    try {
        const markerId = req.body._id;
        const newMarkerDetails = req.body.details;
        const marker = await Marker.findOne({ "_id": markerId });
        marker.details = newMarkerDetails;
        const response = await marker.save();
        res.status(201).json({ message: 'Markers succesfully updated!' });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching markers', error });
    }
});

router.delete('/delete', async (req, res) => {
    try {
        const markerId = req.query._id;
        const markerDelete = await Marker.deleteOne({ _id: markerId });
        const bookingDelete = await Booking.deleteMany({ markerId: markerId })
        if (markerDelete.acknowledged === true && bookingDelete.acknowledged === true) {
            res.status(201).json({ message: 'Marker and Bookings deleted successfully!' });
        } else {
            res.status(404).json({ message: 'Marker not found!' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting markers', error });
    }
});

module.exports = router;  