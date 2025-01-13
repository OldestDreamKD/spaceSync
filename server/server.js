const express = require("express");
const mongoose = require('mongoose');
const session = require("express-session");
const database = require("./config/db");
require('dotenv').config();
const bodyparser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");
const FloorMapRoutes = require('./routes/floorMapRoutes');
const MapMarkerRoutes = require('./routes/mapMarkerRoutes');

database();

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from this origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed methods
    credentials: true, // Allow cookies and other credentials
  })
);

app.use("/api/auth", authRoutes);
app.use('/api/floormaps', FloorMapRoutes);
app.use('/api/marker', MapMarkerRoutes); // Connect the new routes

const PORT = process.env.PORT || 2001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
