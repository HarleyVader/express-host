const express = require("express");
const fs = require("fs");
const path = require("path");
const { Level } = require("level");

const PORT = 7777;
const views = "./views";
const db = new Level('vidViews', { valueEncoding: 'json' });
const excludedir = ["assets", "src", "node_modules", "vidViews"];
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
                await addTodb(filePath, addedDirs); 
                let key = filePath.replace(/^views\//, ''); 
                key = key.startsWith('/') ? key : '/' + key; 
                try {
                    const value = await db.get(key);
                    if (value === null || value === undefined) {
                        await db.put(key, 0);
                        addedDirs.push(key); 
                    }
                } catch (error) {
                    if (error.notFound) {
                        await db.put(key, 0);
                        addedDirs.push(key); 
                    } else {
                        throw error;
                    }}}}   
    } catch (error) {
        console.error('Error in addTodb:', error);
    }
    return addedDirs;
}
async function getDirFromdb() {
    let list = [];
    for await (const [key, value] of db.iterator({})) {
        const [folderName, subfolderName] = key.split('/').filter(Boolean);
        let folder = list.find(folder => folder.folderName === folderName);
        if (!folder) {
            folder = { folderName, subfolders: [] };
            list.push(folder);
        }
        if (subfolderName) {
            folder.subfolders.push({
                subfolderName,
                link: `/${folderName}/${subfolderName}`,
                views: value
            });
        }
    }
    return list;
}
async function addValueTodb(key, increment = 1) {
    let value;
    try {
        value = await db.get(key);
    } catch (error) {
        if (error.notFound) {
            throw new Error(`Key ${key} not found in database`);
        } else {
            throw error;
        }}
    value += increment;
    await db.put(key, value);
    return value;
}
const app = express();
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.get("/sync", async (req, res) => {
    await addTodb();
    res.redirect("/list");
});
app.get("/list", async (req, res) => {
    const folders = await getDirFromdb();

    folders.forEach(folder => {
        if (folder.subfolders) {
            folder.subfolders = folder.subfolders.map(subfolder => {
                return {
                    ...subfolder,
                    link: `/${folder.folderName}/${subfolder.subfolderName}`
                };});}
                });
    res.render('list', { folders: folders });
});
app.get("/:folderName/:subfolderName?", async (req, res) => {
  const { folderName, subfolderName } = req.params;
  const folders = await getDirFromdb();
  let folder = folders.find(f => f.folderName === folderName);
  if (!folder) {
    res.status(404).render('404', {folders: folders});
  } else {
    let viewCount = (await getDirFromdb(folderName))[0]?.views || 0;
    let subfolderPath = null;

    // Check if subfolderName is provided and index.ejs exists in the subfolder
    if (subfolderName && fs.existsSync(path.join(views, folderName, subfolderName, 'index.ejs'))) {
      subfolderPath = path.join(folderName, subfolderName, 'index.ejs'); // path to the subfolder's index.ejs
    }

    res.render('index', { folders: folders, viewCount: viewCount, subfolderPath: subfolderPath });
  }
});

app.post('/incrementViewCount', async (req, res) => {
    const key = req.body.key;
    const value = req.body.value;

    const addViewCount = await addValueTodb(key);
    const getViewCount = await getDirFromdb(key, value);
    console.log(addViewCount, getViewCount); 

    res.json({ folderName: key, getViewCount: getViewCount });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
