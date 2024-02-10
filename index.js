// Import required modules
const express = require('express');
const fs = require('fs');
const path = require('path');

// Initialize Express
const app = express();

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Serve static files from a specific folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    const filePath = path.join(__dirname, './views/content.txt');

    fs.readFile(filePath, 'utf8', function(err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Server Error');
        } else {
            // Make sure 'content' is included in the data object
            res.render('index', { title: 'Home', content: data });
        }
    });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log(`Server is running on http://localhost:${port}`);
});
