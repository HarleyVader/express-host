const express = require("express");
const fs = require("fs");
const path = require("path");
const { Level } = require("level");


const PORT = 7777;
// Define the directory path 
const views = "./views";

const app = express();
// Set the view engine to EJS
app.set("view engine", "ejs");

// Create or open the existing LevelDB database
const db = new Level('vidViews', { valueEncoding: 'json' });
// Create a database
db.open();

//addTodb
async function addTodb(dirPath = views) {
    try {
        const files = fs.readdirSync(dirPath);

        for (let file of files) {
            const filePath = path.join(dirPath, file);

            if (fs.statSync(filePath).isDirectory()) {
                if (!excludedir.includes(file)) {
                    await addTodb(filePath); // Recursive call for subdirectory
                    if (!await db.get(filePath, () => false)) {
                        await db.put(filePath, 0);
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('Error in addTodb:', error);
    }
}
async function getFromdb() {
 let list = [];
    for await (const [key, value] of db.iterator({})) {
        list.push({ key, value });
    }
     return list;
}
// Increment the value of a folder in the database
async function incrementFolderValue(folderPath) {
    try {
        // Get the current value
        let value;
        try {
            value = await db.get(folderPath);
        } catch (error) {
            if (error.notFound) {
                value = 0; // Default value if the key does not exist
            } else {
                throw error; // Re-throw other errors
            }
        }
        
        // Increment the value
        value += 1;
        
        // Update the value in the database
        await db.put(folderPath, value);
        
        console.log(`Folder ${folderPath} accessed ${value} times.`);
    } catch (error) {
        console.error('Error in incrementFolderValue:', error);
    }
}


/*
// Define the routes
app.get("/sync", async (req, res) => {
  try {
    await processDirectory(dirname);
    console.log("Sync Complete!", dirname);
    res.redirect("/list");
  } catch (error) {
    console.error(`Error in GET /sync: ${error}`);
  }
});
*/
app.get("/:folderName", async (req, res) => {
    const folderPath = path.join(views, req.params.folderName);
    
    // Increment the value of the folder in the database
    await incrementFolderValue(folderPath);
    
    // ... rest of your route handler ...
});

/*
app.get("/:folderName/:subfolderName", (req, res) => {
 
});
*/
// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
async function main() {
    let folders = await addTodb();
    console.log("addedFolders: ", folders);
    let tree = await getFromdb();
    console.log("returnedFolders :", tree);
}

main().catch(console.error);