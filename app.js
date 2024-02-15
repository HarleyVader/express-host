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
    console.log(`Title: ${title}`);
    console.log(`Content: ${content}`);
    console.log(`Home URL: ${homeUrl}`);
    console.log(`Icon Source: ${iconSrc}`);
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

let folders = []; 

app.get("/", function (req, res) {
  const dirPath = "./views"; // Specify your directory path here

  fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send("An error occurred while reading the directory.");
      return;
    }
    folders = files
      .filter((file) => file.isDirectory())
      .map((folder) => {
        return {
          title: `${folder.name}`,
          content: `Welcome to the ${folder.name} page!`,
          homeUrl: `/${folder.name}`,
          iconSrc: `./assets/ico/${folder.name}.ico`,
        };
      });

    folders.forEach((folder) => {
      debug.logHtml(
        folder.title,
        folder.content,
        folder.homeUrl,
        folder.iconSrc
      );
    });

    fs.writeFile("folders.json", JSON.stringify(folders, null, 2), (err) => {
      if (err) {
        console.error(err);
        res
          .status(500)
          .send("An error occurred while writing to the JSON file.");
        return;
      }

      res.send("Successfully wrote folder names to folders.json!");
    });
  });
});
app.get("/:folderName", (req, res) => {
  const { folderName } = req.params;

  // Read and parse the JSON file
  fs.readFile('folders.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("An error occurred while reading the JSON file.");
      return;
    }

    const folders = JSON.parse(data);
    const folder = folders.find(f => f.title === folderName);

    if (folder) {
      debug.logHtmltwo(
        folder.title,
        folder.content,
        folder.homeUrl,
        folder.iconSrc
      )
    res.render("index", {  folders: [folder]});
    } else {
      res.status(404).send("Folder not found");
    }
  });
});

// Start the server
app.listen(PORT, () => {
  debug.logServerPort();
});
