# Project Title

This project is a Node.js application that uses Express.js for routing and MongoDB for data storage. It provides an interface to manage and view folders and their subfolders.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have Node.js and MongoDB installed on your machine.

### Installing

1. Clone the repository
2. Install the dependencies using `npm install`
3. Start the MongoDB service
4. Run the application using `node app.js`

## Usage

The application provides the following endpoints:

- `GET /sync`: Synchronizes the file system with the database.
- `GET /list`: Lists all the folders in the database.
- `GET /:folder`: Displays the specified folder and its subfolders.
- `GET /:folderName/:subfolderName?`: Displays the specified subfolder and its sub-subfolders.
- `GET /getViewCount/:folderName`: Returns the view count of the specified folder.
- `POST /incrementViewCount/:folderName`: Increments the view count of the specified folder.

## Built With

- [Node.js](https://nodejs.org/) - The runtime environment
- [Express.js](https://expressjs.com/) - The web framework
- [MongoDB](https://www.mongodb.com/) - The database


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

- Thanks to @DreamingRainbow for the inspiration & teachings on Node.js and Express.js