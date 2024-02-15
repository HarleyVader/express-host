const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 7777;

// Now you can call your debug logs independently
const debug = {
    logFolderNames: () => {
        console.log(`Directory Path: ${folderNames}`);
    },
    logServerPort: () => {
        console.log(`Server is running on port: ${PORT}`);
    },
    logHtml: (title, content) => {
        console.log(`Title: ${title}`);
        console.log(`Content: ${content}`);
    }
    // Add more debug methods as needed
};

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Specify the directory you want to read
const dirPath = path.resolve("./views");

// Get all the folder names
let folderNames = fs.readdirSync(dirPath).filter(file => {
    return fs.statSync(path.join(dirPath, file)).isDirectory();
});
debug.logFolderNames();

app.get('/', (req, res) => {
    // Render a default view or redirect to a specific folder
    res.render('index', { title: 'Home', content: 'Welcome to the home page!' });
});

// Define a route handler for the home page
app.get('/:folderName', (req, res) => {
    const { folderName } = req.params;
    // Check if the folderName exists in the folderNames array
    if (folderNames.includes(folderName)) {
        const title = folderName;
        const content = `Welcome to the ${folderName} page!`;
        res.render('index', { title, content });
        debug.logHtml(title, content);
    } else {
        res.status(404).send('Folder not found');
    }
});
// Start the server
app.listen(PORT, () => {
    debug.logServerPort();
});





