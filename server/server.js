const express = require("express");
const database = require("./config/db");
require('dotenv').config();
const bodyparser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");
const FloorMapRoutes = require('./routes/floorMapRoutes');
const MapMarkerRoutes = require('./routes/mapMarkerRoutes');
const BookingDetailsRoutes = require('./routes/bookingDetailsRoutes');
const AdminRoutes = require('./routes/adminRoutes');
const path = require('path');

database();

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["http://localhost:3000", "https://workspacemapper.onrender.com"], // Allow both local and production requests
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.static(path.join(__dirname, 'client', 'build')));

// For all other routes, send back the React app's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  console.log('Serving static files from:', path.join(__dirname, 'client/build'));

});

app.use("/api/auth", authRoutes);
app.use('/api/floormaps', FloorMapRoutes);
app.use('/api/booking', BookingDetailsRoutes);
app.use('/api/admin', AdminRoutes);
app.use('/api/marker', MapMarkerRoutes); // Connect the new routes

const PORT = process.env.PORT || 2001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
