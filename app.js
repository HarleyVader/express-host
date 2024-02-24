const express = require("express");
const fs = require("fs");
const path = require("path");
const MongoClient = require('mongodb').MongoClient;
const PORT = 7777;
const views = "./";
const excludedir = ["assets", "node_modules", "vidViews", ".git"];
let db;

// Connect to MongoDB
MongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true }, (err, client) => {
  if (err) throw err;
  db = client.db('vidViews');
});

const filter = (value, dirPath = views) => {
    const fullPath = path.resolve(dirPath) + '/' + value;
    if (excludedir.includes(value) || !fs.existsSync(fullPath)) {
        return false; 
    }
    if (fs.statSync(fullPath).isDirectory()) {
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
                // Skip the root directory but include its subdirectories
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

const app = express();
app.set("view engine", "ejs");

app.get("/sync", async (req, res) => {
    await addTodb();
    res.redirect("/list");
});

app.get("/list", async (req, res) => {
    let folders = await db.collection('views').find().toArray();
    res.render('list', { folders: folders });
});

app.get("/:folderName/:subfolderName?", async (req, res) => {
    const { folderName, subfolderName } = req.params;
    let folderPath = `/${folderName}/${subfolderName || ''}`;
    let fullPath = path.join(views, folderPath);

    const includeFile = fs.existsSync(path.join(fullPath, 'index.ejs'));

    const folders = await db.collection('views').find().toArray();
    
    console.log("folderName: ", folderName, "subfolderName: ", subfolderName, "folderPath: ", folderPath, "includeFile: ", includeFile );
    res.render('index', { folders, folderPath, includeFile });
});

app.post('/incrementViewCount', async (req, res) => {
    const key = req.body.key;
    const value = req.body.value;

    const result = await db.collection('views').findOneAndUpdate(
        { key },
        { $inc: { count: 1 } },
        { returnOriginal: false }
    );
    console.log(result.value.count);

    res.json({ folderName: key, getViewCount: result.value.count });
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
