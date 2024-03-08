const { name } = require("ejs");
const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const MongoClient = require('mongodb').MongoClient;
const PORT = 7777;
const views = "views";
let db;
async function addTodb(folderPath = views) {
    const files = await fs.readdir(folderPath);
    const foldersToInsert = [];
    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const stats = await fs.stat(filePath);
        if (stats.isDirectory()) {
            const folder = {
                name: file,
                count: 0,
                folderPath: filePath.replace(new RegExp(`^${views}/`), ''), // Remove 'views/' prefix
                subfolders: [] // Initialize subfolders as an empty array
            };
            const existingFolder = await db.collection(views).findOne({ folderPath: folder.folderPath });
            if (!existingFolder) {
                // Only insert the folder if it doesn't already exist in the collection
                const result = await db.collection(views).insertOne(folder);
                folder._id = result.insertedId;
                foldersToInsert.push(folder);
            }
            const subfolders = await addTodb(filePath);
            for (const subfolder of subfolders) {
                // Add the _id of each subfolder document to the subfolders array of the parent folder document
                folder.subfolders.push(subfolder._id);
                // Update the parent folder in the database
                await db.collection(views).updateOne({ _id: folder._id }, { $set: { subfolders: folder.subfolders } });
            }
        }
    }
    return foldersToInsert;
}
async function startApp() {
    try {
      const client = await MongoClient.connect('mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.1.5', { useUnifiedTopology: false });
      db = client.db(views);
      const app = express();
      app.set("view engine", "ejs");
      app.get("/sync", async (req, res) => {
        await addTodb();
        res.redirect("/list");
      });
      app.get("/list", async (req, res) => {
        let folders = await db.collection(views).find().toArray();
        let folderMap = {};
        folders.forEach(folder => {
            folder.subfolders = [];
            folder.folderPath = folder.folderPath.replace(`/^${views}\//`, '');
            folderMap[folder.folderPath] = folder;
        });
        folders.forEach(folder => {
            const parentPath = path.dirname(folder.folderPath);
            if (folderMap[parentPath]) {
                folderMap[parentPath].subfolders.push(folder);
            }
        });
        const rootFolders = folders.filter(folder => !folderMap[path.dirname(folder.folderPath)]);
        res.render('layout', { 
            folders: rootFolders, 
            title: 'List'
        });
    });
     
    app.get('/favicon.ico', (req, res) => res.sendStatus(204));
    app.get("/:folderName/:subfolderName", async (req, res) => {
        const { folderName, subfolderName } = req.params;
        const folderPath = path.join(folderName, subfolderName);
        const folder = await db.collection(views).findOne({ folderPath });
        if (folder) {
            res.render('layout', { 
                folders: folder.subfolders, 
                title: folder.name,
                folder: folder,
                contentPartial: path.join(folder.folderPath, 'index')
            });            
        } else {
            res.render('layout', { 
                folders: [], 
                title: 'Root',
                contentPartial: 'index'
            });
        }
    });
    
    
    app.get("/getViewCount/:folderName", async (req, res) => {
        console.log('Handling GET request for /getViewCount/:folderName');
        const folderName = req.params.folderName;
        const folder = await db.collection(views).findOne({ name: folderName });
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
      process.on('SIGINT', async () => {
        console.log('Closing database connection and exiting...');
        await db.close();
        process.exit();
      });
    } catch (err) {
      console.error('An error occurred:', err);
    }
}
startApp().catch(err => console.error('An error occurred:', err));