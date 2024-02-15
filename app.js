const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 7777;

// Set EJS as the view engine
app.set("view engine", "ejs");

// Specify the directory you want to read
const dirPath = path.resolve("./views");

function getDirectories(basePath, dirPath = basePath, folderName = '') {
  let directories = [];
  
  // Check if directory exists
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const file of files) {
      if (file.isDirectory()) {
        const filePath = path.join(dirPath, file.name);
        const relativePath = path.relative(basePath, filePath);
        const subfolderName = folderName ? `${folderName}/${file.name}` : file.name;
        directories.push({
          path: subfolderName,
          subdirectories: getDirectories(basePath, filePath, subfolderName)
        });
      }
    }
  }
  
 console.log('Directory Path:', dirPath);
  console.log('Folder Names:', directories);
  return directories;
}

app.get("/", function (req, res) {
  const directories = getDirectories(dirPath);
  const folders = directories.map((directory) => {
    const folderName = path.basename(directory.path.toString());
    const subfolders = directory.subdirectories.map((subdirectory) => { // map subdirectories to subfolders
      const subfolderName = path.basename(subdirectory.path.toString());
      return {
        title: `${subfolderName}`,
        homeUrl: `/${folderName}/${subfolderName}`,
        iconSrc: `./assets/ico/${subfolderName}.ico`,
      };
    });
    const folderInfo = {
      title: `${folderName}`,
      homeUrl: `/${folderName}`,
      iconSrc: `./assets/ico/${folderName}.ico`,
      subfolders: subfolders, // add subfolders property
    };
    console.log('title: ', folderInfo.title, 'homeUrl:', folderInfo.homeUrl, 'iconSrc:', folderInfo.iconSrc);
    return folderInfo;
  });

  res.render('index', { folders: folders });
});

app.get("/:folderName", function (req, res) {
  const directories = getDirectories(dirPath);
  const folders = directories.map((directory) => {
    const folderName = path.basename(directory.path.toString());
    const subdirectories = directory.subdirectories; // get subdirectories
    const subfolders = subdirectories.length > 0 ? subdirectories.map((subdirectory) => { // map subdirectories to subfolders
      const subfolderName = path.basename(subdirectory.path.toString());
      return {
        title: `${subfolderName}`,
        homeUrl: `/${folderName}/${subfolderName}`,
        iconSrc: `./assets/ico/${subfolderName}.ico`,
      };
    }) : [];
    const folderInfo = {
      title: `${folderName}`,
      homeUrl: `/${folderName}`,
      iconSrc: `./assets/ico/${folderName}.ico`,
      subfolders: subfolders, // add subfolders property
    };
    console.log('title: ', folderInfo.title, 'homeUrl:', folderInfo.homeUrl, 'iconSrc:', folderInfo.iconSrc, 'subFolder:', folderInfo.subfolders);
    return folderInfo;
  });

  const folder = folders.find(f => f.title === req.params.folderName);

  if (folder) {
    res.render('index', { folders: [folder] });
  } else {
    res.status(404).send('Folder not found');
  }
});
app.get("/:folderName/:subfolderName", function (req, res) {
  const directories = getDirectories(dirPath);
  const folders = directories.map((directory) => {
    const folderName = path.basename(directory.path.toString());
    const subdirectories = directory.subdirectories; // get subdirectories
    const subfolders = subdirectories.length > 0 ? subdirectories.map((subdirectory) => { // map subdirectories to subfolders
      const subfolderName = path.basename(subdirectory.path.toString());
      return {
        title: `${subfolderName}`,
        homeUrl: `/${folderName}/${subfolderName}`,
        iconSrc: `./assets/ico/${subfolderName}.ico`,
      };
    }) : [];
    const folderInfo = {
      title: `${folderName}`,
      homeUrl: `/${folderName}`,
      iconSrc: `./assets/ico/${folderName}.ico`,
      subfolders: subfolders, // add subfolders property
    };
    console.log('title: ', folderInfo.title, 'homeUrl:', folderInfo.homeUrl, 'iconSrc:', folderInfo.iconSrc, 'subFolder:', folderInfo.subfolders);
    return folderInfo;
  });

  const folder = folders.find(f => f.title === req.params.folderName);
  const subfolder = folder ? folder.subfolders.find(sf => sf.title === req.params.subfolderName) : null;

  if (subfolder) {
    res.render('index', { folders: [subfolder] });
  } else {
    res.status(404).send('Folder not found');
  }
});
// Start the server
app.listen(PORT, () => {
  console.log('express-port', PORT);
});
