import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json({ limit: '50mb' })); // High limit for base64 images

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'dist')));

// API Routes
app.get('/api/data', (req, res) => {
    if (!fs.existsSync(DB_FILE)) {
        // Return default structure if file doesn't exist
        return res.json({
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
        });
    }

    fs.readFile(DB_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read database' });
        }
        try {
            res.json(JSON.parse(data));
        } catch (e) {
            res.status(500).json({ error: 'Invalid database format' });
        }
    });
});

app.post('/api/data', (req, res) => {
    const data = req.body;
    if (!data) return res.status(400).json({ error: 'No data provided' });

    fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to save data' });
        }
        res.json({ success: true });
    });
});

// Handle React routing, return all requests to React app
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Network access: http://<your-ip-address>:${PORT}`);
});
