const mongoose = require('mongoose');

const floorMapSchema = new mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FloorMap', floorMapSchema);
