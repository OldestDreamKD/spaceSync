const express = require('express');
const router = express.Router();
const Marker = require('../models/marker'); // Import the Marker model
const FloorMap = require('../models/floorMap');  // Import the FloorMap model

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

router.post('/', async (req, res) => {
    try {
        const mapUrl = req.body.mapId;
        const floorMap = await FloorMap.findOne({ url: mapUrl });
        const markerId = floorMap._id;
        const floorMarkers = await Marker.find({ floorMapId: markerId });
        res.json(floorMarkers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching floor maps', error });
    }
});

router.post('/delete', async (req, res) => {
    try {
        const markerId = req.body._id;
        console.log(markerId);
        const response = await Marker.deleteOne({ _id: markerId });
        console.log(response);
        if (response.deletedCount === 1) {
            res.status(201).json({ message: 'Marker deleted successfully!' });
        } else {
            res.status(404).json({ message: 'Marker not found!' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting markers', error });
    }
});

module.exports = router;  