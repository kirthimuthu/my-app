const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON request bodies

// Create uploads directory if not exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Admin2022@',
  database: 'file_upload_db',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  const { originalname, filename, mimetype, size } = req.file;

  // Insert file metadata into the database
  const query = 'INSERT INTO files (originalname, filename, mimetype, size) VALUES (?, ?, ?, ?)';
  db.query(query, [originalname, filename, mimetype, size], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Failed to store file data');
    }

    res.json({ fileId: result.insertId });
  });
});

// File download endpoint
app.get('/download/:fileId', (req, res) => {
  const { fileId } = req.params;

  db.query('SELECT * FROM files WHERE id = ?', [fileId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Failed to retrieve file');
    }
    if (results.length === 0) {
      return res.status(404).send('File not found');
    }

    const file = results[0];
    const filePath = path.join(__dirname, 'uploads', file.filename);

    if (fs.existsSync(filePath)) {
      res.download(filePath, file.originalname);
    } else {
      res.status(404).send('File not found');
    }
  });
});

// Start server
const port = 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
