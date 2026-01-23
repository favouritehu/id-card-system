import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import basicAuth from 'express-basic-auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');
const MONGODB_URI = process.env.MONGODB_URI;

// Password Protection
const APP_PASSWORD = process.env.APP_PASSWORD || 'favouritefab@00';

// Check if we should use MongoDB (cloud) or JSON file (offline)
const useMongoDb = !!MONGODB_URI;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Enable trust proxy for reverse proxy support
app.enable('trust proxy');

// Basic Authentication - protects entire app
app.use(basicAuth({
    users: { 'admin': APP_PASSWORD },
    challenge: true,
    realm: 'ID Card System',
    unauthorizedResponse: 'Access denied. Please enter correct credentials.'
}));

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'dist')));

// ==================== MONGODB SETUP ====================
const DataSchema = new mongoose.Schema({
    company: {
        name: String,
        address: String,
        contact: String,
        email: String,
        website: String,
        logoUrl: String,
        accentColor: String
    },
    employees: [{
        id: String,
        name: String,
        department: String,
        employeeId: String,
        phone: String,
        email: String,
        emergencyContact: String,
        address: String,
        photoUrl: String,
        zoneColor: String
    }]
}, { collection: 'appdata' });

const DataModel = mongoose.model('AppData', DataSchema);

// Default data structure
const defaultData = {
    company: {
        name: "My Company",
        address: "",
        contact: "",
        email: "",
        website: "",
        logoUrl: null,
        accentColor: "#4f46e5"
    },
    employees: []
};

// Connect to MongoDB if URI is provided
let mongoConnected = false;

if (useMongoDb) {
    console.log('🔄 Attempting MongoDB connection...');
    console.log('   URI starts with:', MONGODB_URI?.substring(0, 30) + '...');

    mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
    })
        .then(() => {
            console.log('✅ Connected to MongoDB Atlas');
            mongoConnected = true;
        })
        .catch(err => {
            console.error('❌ MongoDB connection error:', err.message);
            console.log('⚠️ Falling back to JSON file mode');
        });
} else {
    console.log('ℹ️ No MONGODB_URI found, using JSON file mode');
}

// ==================== API ROUTES ====================
app.get('/api/data', async (req, res) => {
    try {
        if (useMongoDb) {
            // MongoDB Mode
            let data = await DataModel.findOne();
            if (!data) {
                data = new DataModel(defaultData);
                await data.save();
            }
            res.json({ company: data.company, employees: data.employees });
        } else {
            // Offline JSON Mode
            if (!fs.existsSync(DB_FILE)) {
                return res.json(defaultData);
            }
            const fileData = fs.readFileSync(DB_FILE, 'utf8');
            res.json(JSON.parse(fileData));
        }
    } catch (error) {
        console.error('Error reading data:', error);
        res.status(500).json({ error: 'Failed to read data' });
    }
});

app.post('/api/data', async (req, res) => {
    try {
        const data = req.body;
        if (!data) return res.status(400).json({ error: 'No data provided' });

        if (useMongoDb) {
            // MongoDB Mode - Update or create
            await DataModel.findOneAndUpdate(
                {},
                { company: data.company, employees: data.employees },
                { upsert: true, new: true }
            );
            res.json({ success: true });
        } else {
            // Offline JSON Mode
            fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
            res.json({ success: true });
        }
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// Handle React routing
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Mode: ${useMongoDb ? '☁️  MongoDB (Cloud)' : '💾 JSON File (Offline)'}`);
});
