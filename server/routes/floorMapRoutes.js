const express = require('express');
const router = express.Router();
const Marker = require('../models/marker');
const FloorMap = require('../models/floorMap');
const Booking = require('../models/bookings');

router.post('/upload', async (req, res) => {
    // console.log(req.body);
    const newFloorMapData = {
        name: req.body.floorMapName,
        url: req.body.fileUrl,
    }
    const floorMap = new FloorMap(newFloorMapData);
    const response = await floorMap.save();
    // console.log("Map saved:", response);
    res.status(201).json({ message: 'Floor maps saving route is working!' });
});

// Route to fetch all floor maps
router.get('/', async (req, res) => {
    try {
        const floorMaps = await FloorMap.find();  // Fetch all floor maps from the database
        res.json(floorMaps);  // Return the floor maps as a JSON response
    } catch (error) {
        res.status(500).json({ message: 'Error fetching floor maps', error });
    }
});

router.delete('/delete', async (req, res) => {
    try {
        const mapId = req.query._id; // URL of the FloorMap
        console.log(`FloorMap URL: ${mapId}`);

        // Step 1: Find the FloorMap by URL
        const floorMapDelete = await FloorMap.findOne({ url: mapId });
        if (!floorMapDelete) {
            return res.status(404).json({ message: "FloorMap not found" });
        }
        console.log("FloorMap found:", floorMapDelete);

        const floorMapId = floorMapDelete._id;

        // Step 2: Find all Markers associated with this FloorMap
        const markers = await Marker.find({ floorMapId });
        if (!markers || markers.length === 0) {
            console.log("No Markers found for this FloorMap");
        } else {
            console.log("Markers found:", markers);

            // Step 3: Collect all Marker IDs
            const markerIds = markers.map(marker => marker._id);

            // Step 4: Delete all Bookings associated with these Markers
            const bookingsDelete = await Booking.deleteMany({ markerId: { $in: markerIds } });
            console.log("Bookings deleted:", bookingsDelete);

            // Step 5: Delete the Markers themselves
            const markersDelete = await Marker.deleteMany({ _id: { $in: markerIds } });
            console.log("Markers deleted:", markersDelete);
        }

        // Step 6: Delete the FloorMap
        const floorMapDeleted = await FloorMap.deleteOne({ _id: floorMapId });
        console.log("FloorMap deleted:", floorMapDeleted);

        res.status(200).json({
            message: "FloorMap, associated Markers, and Bookings deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting FloorMap and associated data:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
})

module.exports = router;  
