const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const MongoClient = require("mongodb").MongoClient;
const PORT = 7777;
const views = "views";
let db;

async function addTodb(folderPath = views, urlPath = '') {
    const files = await fs.readdir(folderPath);
    const foldersToInsert = [];
    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const url = path.join(urlPath, file);
        const stats = await fs.stat(filePath);
        if (stats.isDirectory()) {
            const folder = {
                folderName: file,
                url: url, // use the file name as the url
                count: 0,
                folderPath: filePath, // include the full path from views to the subfolder
                subfolders: [],
            };
            const existingFolder = await db
                .collection(views)
                .findOne({ folderPath: folder.folderPath });
            if (!existingFolder) {
                const result = await db.collection(views).insertOne(folder);
                folder._id = result.insertedId;
                foldersToInsert.push(folder);
            }
            const subfolders = await addTodb(filePath, url);
            for (const subfolder of subfolders) {
                folder.subfolders.push(subfolder._id);
                await db
                    .collection(views)
                    .updateOne(
                        { _id: folder._id },
                        { $set: { subfolders: folder.subfolders } }
                    );
            }
        }
    }
    return foldersToInsert;
}

async function startApp() {
    try {
        const client = await MongoClient.connect(
            "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.1.5",
            { useUnifiedTopology: true }
        );
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
			folders.forEach((folder) => {
				folder.subfolders = folder.subfolders.map(id => folders.find(f => f._id === id)).filter(Boolean);
				folderMap[folder.folderPath] = folder;
			});
			const rootFolders = folders.filter(
				(folder) => !folderMap[path.dirname(folder.folderPath)]
			);
			res.render("layout", {
				folders: rootFolders,
				title: "List",
				folder: null, // or pass an appropriate value
				contentPartial: null, // or pass an appropriate value
				url: "" // pass empty url to layout
			});
		});
		
        app.get("/favicon.ico", (req, res) => res.sendStatus(204));
		app.get('/:folder', async function(req, res) {
			let folderName = req.params.folder;
			let folders = await db.collection(views).find().toArray();
			let folder = folders.find(f => f.url === folderName);
		
			if (!folder) {
				res.status(404).send('Folder not found');
				return;
			}
		
			let contentPartial;
			if (folder.subfolders && folder.subfolders.length > 0) {
				contentPartial = 'subfolder-index';
			} else {
				contentPartial = 'index';
			}
		
			res.render('layout', { 
				title: folder.folderName, 
				folder: folder, 
				folders: folders, 
				contentPartial: contentPartial 
			});
		});
		app.get("/:folderName/:subfolderName?", async (req, res) => {
			const { folderName, subfolderName } = req.params;
			try {
				const folder = await db.collection(views).findOne({ folderName: folderName, subfolderName: subfolderName });
				console.log(folder); // Add this line to print the folder object to the console
				if (folder) {
					let folders = await db.collection(views).find().toArray();
					folder.subfolders = folder.subfolders.map(id => folders.find(f => f._id.equals(id)));
					let contentPartial;
					if (folder.subfolders && folder.subfolders.length > 0) {
						contentPartial = 'index';
					} else {
						contentPartial = null;
					}
					res.render("layout", {
						folders: folder.subfolders,
						title: folder.folderName,
						folder: folder,
						contentPartial: contentPartial,
						url: folder.url // pass url from db to layout
					});
				} else {
					res.render("layout", {
						folders: [],
						title: "Root",
						contentPartial: "index",
						folder: {subfolders: []},
						url: "" // pass empty url to layout
					});
				}
			} catch (error) {
				res.status(500).send("Server Error");
			}
		}); 
		
		app.get("/getViewCount/:folderName", async (req, res) => {
			console.log("Handling GET request for /getViewCount/:folderName");
			const folderName = req.params.folderName;
			const folder = await db.collection(views).findOne({ folderName: folderName });
			res.json({ viewCount: folder.count });
		});
		
		app.post("/incrementViewCount/:folderName", async (req, res) => {
			console.log("Handling POST request for /incrementViewCount/:folderName");
			const folderName = req.params.folderName;
			await db
				.collection("views")
				.updateOne({ folderName: folderName }, { $inc: { count: 1 } });
			res.sendStatus(200);
		});
		
		app.use((err, req, res, next) => {
			console.error("An error occurred:", err.stack);
			res.status(500).send("Something broke!");
			next(err);
		});
		

        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });

        process.on("SIGINT", async () => {
            console.log("Closing database connection and exiting...");
            await db.close();
            process.exit();
        });
    } catch (err) {
        console.error("An error occurred:", err);
        process.exit(1);
    }
}

startApp().catch((err) => {
    console.error("An error occurred:", err);
    process.exit(1);
});
