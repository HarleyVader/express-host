const express = require("express");
const fs = require("fs");
const path = require("path");
const debug = require('./assets/js/debug.js');


const app = express();
const PORT = 7777;
// Start the debug logs

debug.start();
// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('assets'));
// Specify the directory you want to read
const dirPath = path.resolve("./views");
// Get all the folder names
let folderNames = fs.readdirSync(dirPath).filter((file) => {
  return fs.statSync(path.join(dirPath, file)).isDirectory();
});

// Log the folder names
debug.logFolderNames(folderNames);

// Define the route for the home page
app.get("/", function (req, res) {
  const dirPath = "./views"; // Specify your directory path here

  // Read the directory
  fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send("An error occurred while reading the directory.");
      return;
    }

    // Filter the directories and map them to folderInfo objects
    const folders = files
      .filter((file) => file.isDirectory())
      .map((folder) => {
        const folderInfo = {
          title: `${folder.name}`,
          content: `Welcome to the ${folder.name} page!`,
          homeUrl: `/${folder.name}`,
          iconSrc: `./assets/ico/${folder.name}.ico`,
        };

        // Log the HTML details
        debug.logHtml(folderInfo.title, folderInfo.content, folderInfo.homeUrl, folderInfo.iconSrc);

        return folderInfo;
      });

    // Render the index view with the folders
    res.render('index', { folders: folders });
  });
});

// Define the route for each folder
app.get("/:folderName", function (req, res) {
  const dirPath = "./views"; // Specify your directory path here

  // Read the directory
  fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send("An error occurred while reading the directory.");
      return;
    }

    // Filter the directories and map them to folderInfo objects
    const folders = files
      .filter((file) => file.isDirectory())
      .map((folder) => {
        const folderInfo = {
          title: `${folder.name}`,
          content: `Welcome to the ${folder.name} page!`,
          homeUrl: `/${folder.name}`,
          iconSrc: `./assets/ico/${folder.name}.ico`,
        };

        // Log the HTML details
        debug.logHtml(folderInfo.title, folderInfo.content, folderInfo.homeUrl, folderInfo.iconSrc);

        return folderInfo;
      });

    // Find the folder that matches the requested folder name
    const folder = folders.find(f => f.title === req.params.folderName);

    if (folder) {
        // Log the HTML details for the second function
        debug.logHtmltwo(folder.title, folder.content, folder.homeUrl, folder.iconSrc);

        // Render the index view with the found folder
        res.render('index', { folders: [folder] });
    } else {
        res.status(404).send('Folder not found');
    }
  });
});

// Start the server
app.listen(PORT, () => {
  debug.logServerPort();
});
// Stop the debug logs
debug.stop();