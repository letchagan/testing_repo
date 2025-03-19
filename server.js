require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ Connected to Open5GS MongoDB'))
    .catch(err => console.log('❌ MongoDB Connection Error:', err));

// Define Subscriber Schema
const SubscriberSchema = new mongoose.Schema({
    imsi: { type: String, unique: true },  // Ensure unique IMSI
    key: String,
    opc: String,
    apn: String,
    staticIp: String
}, { collection: 'subscriber' });

const Subscriber = mongoose.model('Subscriber', SubscriberSchema);

// API to Get All Subscribers
app.get('/subscribers', async (req, res) => {
    try {
        const subscribers = await Subscriber.find();
        res.json(subscribers);
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

// API to Add a Subscriber (Prevent Duplicate IMSI)
app.post('/subscribers', async (req, res) => {
    const { imsi, key, opc, apn, staticIp } = req.body;

    try {
        const existingSubscriber = await Subscriber.findOne({ imsi });

        if (existingSubscriber) {
            return res.status(400).json({ error: "IMSI already exists!" });
        }

        const newSubscriber = new Subscriber({ imsi, key, opc, apn, staticIp });
        await newSubscriber.save();

        res.json({ message: "✅ Subscriber Added", subscriber: newSubscriber });
    } catch (error) {
        res.status(500).json({ error: "Failed to Add Subscriber" });
    }
});

// API to Delete a Subscriber
app.delete('/subscribers/:imsi', async (req, res) => {
    try {
        const { imsi } = req.params;
        await Subscriber.deleteOne({ imsi });
        res.json({ message: "❌ Subscriber Removed" });
    } catch (error) {
        res.status(500).json({ error: "Failed to Remove Subscriber" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
