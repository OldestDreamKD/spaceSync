const express = require('express');
const router = express.Router();  
const FloorMap = require('../models/floorMap');  // Import the FloorMap model

router.post('/upload', async (req, res) => {
    console.log(req.body);  
const newFloorMapData = {
    name: req.body.floorMapName,
    url: req.body.fileUrl,
}
    const floorMap = new FloorMap(newFloorMapData);
    const response = await floorMap.save();
    console.log("Map saved:", response);
    res.status(201).json({ message: 'Floor maps saving route is working!' });
});

// Route to fetch all floor maps
router.get('/', async (req, res) => {
    try {
        const floorMaps = await FloorMap.find();  // Fetch all floor maps from the database
        console.log(floorMaps);  // Log the fetched floor maps
        res.json(floorMaps);  // Return the floor maps as a JSON response
    } catch (error) {
        res.status(500).json({ message: 'Error fetching floor maps', error });
    }
});  

module.exports = router;  
