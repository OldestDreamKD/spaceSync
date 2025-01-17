const mongoose = require('mongoose');

// Marker Schema
const markerSchema = new mongoose.Schema({
    floorMapId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FloorMap',  // This will reference the 'FloorMap' model
        required: true
    },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    details: [{
        label: { type: String, required: true },
        description: { type: String, required: true }
    }]
});

module.exports = mongoose.model('Marker', markerSchema);
