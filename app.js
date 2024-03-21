const data = [
  {
    id: "one",
    name: "one",
    subfolder: [
      { id: "one", name: "one" },
      { id: "two", name: "two" },
    ],
  },
  {
    id: "two",
    name: "two",
    subfolder: [
      { id: "one", name: "one" },
      { id: "two", name: "two" },
    ],
  },
];
//write an express app that will return the data above in json format - api routes
//write the routes to get one of the records & a route to get all the records - api routes
//write a route to add new data to the db - api routes
//write a route to update a record in the db - api routes
//write a route to delete a record from the db - api routes
//write a route to render the primary view - view route - index.ejs or render a "static index"
//create a public folder with an index.html file init & javascript files to fetch the API data
//use babel to turn mjs into comon js
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

app.use(bodyParser.json());

app.use(express.static("public"));

// Set EJS as the view engine
app.set("view engine", "ejs");

// Set the views directory
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  return res.render("layout", { data, title: "home" });
});
app.get("/:folderName/:subfolderName?", async (req, res) => {
  const folderName = req.params.folderName;
  const subfolderName = req.params.subfolderName;

  if (folderName !== undefined && subfolderName !== undefined && fs.existsSync(path.join(__dirname, "views", folderName, subfolderName, "index.ejs"))) {
    return res.render(folderName + "/" + subfolderName + "/" + "index", {
      data, title: folderName + "/" + subfolderName,
    });
  } else if (folderName !== undefined && fs.existsSync(path.join(__dirname, "views", folderName, "index.ejs"))) {
    return res.render(folderName + "/" + "index", {
      data, title: folderName,
    });
  } else {
    return res.render("layout", { message: "Not found!", data, title: folderName });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
