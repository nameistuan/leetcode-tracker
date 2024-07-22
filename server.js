const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Route to update data.json
app.post('/update-data', (req, res) => {
    const newData = req.body;
    const dataPath = path.join(__dirname, 'public', 'data.json');

    fs.writeFile(dataPath, JSON.stringify(newData, null, 2), err => {
        if (err) {
            console.error('Error writing data.json:', err);
            res.status(500).send('Error updating data');
        } else {
            res.status(200).send('Data updated successfully');
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
 