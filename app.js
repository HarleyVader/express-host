const { name } = require("ejs");
const express = require("express");
const fs = require("fs");
const path = require("path");
const MongoClient = require('mongodb').MongoClient;
const PORT = 7777;
const views = "views";
let db;
async function addTodb(folderPath = views) {
    const files = fs.readdirSync(folderPath);
    const foldersToInsert = [];
    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            const folder = {
                name: file,
                count: 0,
                folderPath: filePath
            };
            const existingFolder = await db.collection('views').findOne({ name: folder.name });
            if (!existingFolder) {
                foldersToInsert.push(folder);
            }
            const subfolders = await addTodb(filePath);
            foldersToInsert.push(...subfolders);
        }
    }
    return foldersToInsert;
}
async function processFolders() {
    const foldersToInsert = await addTodb();
    if (foldersToInsert.length > 0) {
        await db.collection('views').insertMany(foldersToInsert);
    }
}
async function startApp() {
    try {
      const client = await MongoClient.connect('mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.1.5', { useUnifiedTopology: false });
      db = client.db('views');
      const app = express();
      app.set("view engine", "ejs");
      app.get("/sync", async (req, res) => {
        await processFolders();
        res.redirect("/list");
      });
      app.get("/list", async (req, res) => {
        let folders = await db.collection('views').find().toArray();
        let folderMap = {};
        folders.forEach(folder => {
            folder.subfolders = [];
            folder.folderPath = folder.folderPath.replace(/^views\//, ''); // Remove 'views/' prefix
            folderMap[folder.folderPath] = folder;
        });
        folders.forEach(folder => {
            const parentPath = path.dirname(folder.folderPath);
            if (folderMap[parentPath]) {
                folderMap[parentPath].subfolders.push(folder);
            }
        });
        const rootFolders = folders.filter(folder => !folderMap[path.dirname(folder.folderPath)]);
        res.render('index', { folders: rootFolders, title: 'List' });
    });
    
    
    app.get('/favicon.ico', (req, res) => res.sendStatus(204));


    app.get("/getViewCount/:folderName", async (req, res) => {
        console.log('Handling GET request for /getViewCount/:folderName');
        const folderName = req.params.folderName;
        const folder = await db.collection('views').findOne({ name: folderName });
        res.json({ viewCount: folder.count });
    });
    
    app.post('/incrementViewCount/:folderName', async (req, res) => {
        console.log('Handling POST request for /incrementViewCount/:folderName');
        const folderName = req.params.folderName;
        await db.collection('views').updateOne(
          { name: folderName },
          { $inc: { count: 1 } }
        );
        res.sendStatus(200);
    });
    
      app.use((err, req, res, next) => {
        console.error('An error occurred:', err.stack);
        res.status(500).send('Something broke!');
      });
      app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
      });
      process.on('SIGINT', () => {
        console.log('Closing database connection and exiting...');
        db.close();
        process.exit();
      });
    } catch (err) {
      console.error('An error occurred:', err);
    }
  }
  startApp().catch(err => console.error('An error occurred:', err));
