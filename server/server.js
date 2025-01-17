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
const fs = require('fs');


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
app.use(express.static(path.join(__dirname, '../client/build')));

// For all other routes, send back the React app's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
  console.log('Serving static files from:', (path.join(__dirname, '../client/build/index.html')));
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
  console.log('Serving static files from:', (path.join(__dirname, '../client/build/index.html')));

});

function listAllFiles(dirPath, filesList = []) {
  const files = fs.readdirSync(dirPath); // Synchronous to ensure proper execution in sequence

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      // If it's a directory, recursively add its contents
      listAllFiles(fullPath, filesList);
    } else {
      // If it's a file, push it to the list
      filesList.push(fullPath);
    }
  });

  return filesList;
}

const directoryPath = __dirname; // Start from the current directory

try {
  const allFiles = listAllFiles(directoryPath);
  console.log('All files and directories:', allFiles);

  // Optionally write the list to a file for easier viewing
  fs.writeFileSync(path.join(__dirname, 'allFilesList.log'), allFiles.join('\n'), 'utf8');
  console.log('File list written to allFilesList.log');
} catch (err) {
  console.error('Error reading directory:', err);
}

app.use("/api/auth", authRoutes);
app.use('/api/floormaps', FloorMapRoutes);
app.use('/api/booking', BookingDetailsRoutes);
app.use('/api/admin', AdminRoutes);
app.use('/api/marker', MapMarkerRoutes); // Connect the new routes

const PORT = process.env.PORT || 2001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
