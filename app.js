const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 7777;

// Now you can call your debug logs independently
const debug = {
  logFolderNames: (folderNames) => {
    folderNames.forEach((folderName) => {
      console.log(`Directory Path: ${path.join(folderName)}`);
    });
  },
  logServerPort: () => {
    console.log(`Server is running on port: ${PORT}`);
  },
  logHtml: (title, content, homeUrl, iconSrc) => {
    console.log(`Title: ${title}`);
    console.log(`Content: ${content}`);
    console.log(`Home URL: ${homeUrl}`);
    console.log(`Icon Source: ${iconSrc}`);
  },
    logHtmltwo: (title, content, homeUrl, iconSrc) => {
    console.log(`Title2: ${title}`);
    console.log(`Content2: ${content}`);
    console.log(`Home URL2: ${homeUrl}`);
    console.log(`Icon Source2: ${iconSrc}`);
  },
  // Add more debug methods as needed
};

// Set EJS as the view engine
app.set("view engine", "ejs");

// Specify the directory you want to read
const dirPath = path.resolve("./views");

// Get all the folder names
let folderNames = fs.readdirSync(dirPath).filter((file) => {
  return fs.statSync(path.join(dirPath, file)).isDirectory();
});
debug.logFolderNames(folderNames);

app.get("/", function (req, res) {
  const dirPath = "./views"; // Specify your directory path here

  fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send("An error occurred while reading the directory.");
      return;
    }
    const folders = files
      .filter((file) => file.isDirectory())
      .map((folder) => {
        const folderInfo = {
          title: `${folder.name}`,
          content: `Welcome to the ${folder.name} page!`,
          homeUrl: `/${folder.name}`,
          iconSrc: `./assets/ico/${folder.name}.ico`,
        };
        debug.logHtml(folderInfo.title, folderInfo.content, folderInfo.homeUrl, folderInfo.iconSrc);
        return folderInfo;
      });

    res.render('index', { folders: folders });
    
  });
});

app.get("/:folderName", function (req, res) {
  const dirPath = "./views"; // Specify your directory path here

  fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send("An error occurred while reading the directory.");
      return;
    }
    const folders = files
      .filter((file) => file.isDirectory())
      .map((folder) => {
        const folderInfo = {
          title: `${folder.name}`,
          content: `Welcome to the ${folder.name} page!`,
          homeUrl: `/${folder.name}`,
          iconSrc: `./assets/ico/${folder.name}.ico`,
        };
        debug.logHtml(folderInfo.title, folderInfo.content, folderInfo.homeUrl, folderInfo.iconSrc);
        return folderInfo;
      });

    const folder = folders.find(f => f.title === req.params.folderName);

    if (folder) {
        debug.logHtmltwo(folder.title, folder.content, folder.homeUrl, folder.iconSrc);
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
