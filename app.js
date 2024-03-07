const express = require("express");
const fs = require("fs");
const path = require("path");
const MongoClient = require('mongodb').MongoClient;
const PORT = 7777;
const views = "./views";
const excludedir = ["assets", "node_modules", "vidViews", ".git", "favicon.ico"];
let db;
const filter = (value, dirPath = views) => {
    const fullPath = path.resolve(dirPath) + '/' + value;
    if (excludedir.includes(value)) {
        return false; 
    }
    const stats = fs.lstatSync(fullPath);
    if (stats.isDirectory()) {
        return true;
    }
    return false;
}
async function addTodb(dirPath = views, addedDirs = []) {
    try {
        const files = fs.readdirSync(dirPath).filter(file => filter(file, dirPath));
        for (let file of files) {
            const filePath = path.join(dirPath, file);
            if (fs.statSync(filePath).isDirectory()) {
                if (dirPath !== views) {
                    let key = filePath.replace(/^views\//, ''); 
                    key = key.startsWith('/') ? key : '/' + key; 
                    const value = await db.collection('views').findOne({ key });
                    if (!value) {
                        await db.collection('views').insertOne({ key, count: 0 });
                        addedDirs.push(key); 
                    }
                }
                await addTodb(filePath, addedDirs);
            }
        }
    } catch (error) {
        console.error('Error in addTodb:', error);
    }
    return addedDirs;
}
async function startApp() {
  const client = await MongoClient.connect('mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.1.5', { useUnifiedTopology: true });
  db = client.db('vidViews');
  const app = express();
  app.set("view engine", "ejs");
  app.get("/", async (req, res) => {
        let folders = await db.collection('views').find().toArray();
        folders = folders.map(folder => ({
            folderName: folder.key,
            views: folder.count,
            subfolders: []
        }));
        res.render('index', { folders: folders });
    });
  app.get("/sync", async (req, res) => {
      await addTodb();
      res.redirect("/list");
  });
  app.get("/list", async (req, res) => {
        let folders = await db.collection('views').find().toArray();
        folders = folders.map(folder => {
            const folderPath = path.join(views, folder.key);
            const hasIndex = fs.existsSync(path.join(folderPath, 'index.ejs'));
            return {
                folderName: folder.key,
                views: folder.count,
                subfolders: [],
                hasIndex: hasIndex
            };
        });
        res.render('list', { folders: folders });
    });
   /*
    app.get("/:folderName", async (req, res) => {
        const folderName = req.params.folderName;
        const folder = await db.collection('views').findOne({ key: folderName });
        if (folder) {
        const subfolders = folder.subfolders.map(subfolderName => {
            const subfolder = db.collection('views').findOne({ key: `${folderName}/${subfolderName}` });
            return {
            subfolderName: subfolderName,
            views: subfolder ? subfolder.count : 0
            };
        });
        res.render('list', { folders: [{ ...folder, subfolders: subfolders }] });   
        } else {
        res.status(404).send('Folder not found');
        }
    });
*/
    app.get("/:folderName/:subfolderName?", async (req, res) => {
        const { folderName, subfolderName } = req.params;
        let folderPath = `${folderName}/${subfolderName || ''}`;
        let fullPath = path.join(views, folderPath);
    
        if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isDirectory() && fs.existsSync(path.join(fullPath, 'index.ejs'))) {
            const folders = await db.collection('views').find().toArray();
            res.render(`${folderPath}/index`, { folders, folderPath, includeFile: true, fs: fs });
        } else {
            const folders = await db.collection('views').find().toArray();
            res.render('index', { folders, folderPath, includeFile: false, fs: fs });
        }
    });
    app.get("/getViewCount/:folderName", async (req, res) => {
        const folderName = req.params.folderName;
        const folder = await db.collection('views').findOne({ key: folderName });
        res.json({ viewCount: folder.count });
    });
  app.post('/incrementViewCount/:folderName', async (req, res) => {
    const folderName = req.params.folderName;
    await db.collection('views').updateOne(
      { key: folderName },
      { $inc: { count: 1 } }
    );
    res.sendStatus(200);
  });
  app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send('Something broke!');
  });
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
  process.on('SIGINT', () => {
    db.close();
    process.exit();
  });
}
startApp().catch(err => console.error(err));
