// Import required packages
const http = require('http'); //HTTP Server
const path = require('path'); // File Path
const fs = require('fs'); // Read File
const { MongoClient } = require('mongodb'); // MongoDB Connect

// Variable Declaration
let responseData;
let dbName = "AnimeDB";
let dbCollection = "AnimeCollection"

// Establish connection with MongoDB URI
async function main() {
    const uri = `mongodb+srv://kamalsiddharthteki:sambarIDLI@clusterks.ppgepgp.mongodb.net/AnimeDB/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri);
    try {
        await client.connect();
        responseData = await getAllDataFromMongo(client)
    } finally {
        await client.close();
    }
}

main().catch(console.error);

// Create Server
const server = http.createServer(async (req, res) => {
    console.log(req.url);

    // Response Homepage
    if (req.url === '/') {
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, content) => {
            if (err) throw err;
            res.setHeader("Access-Control-Allow-Origin", "*"); // Response Headers
            res.writeHead(200, { 'Content-Type': 'text/html' }); // Read file
            res.end(content);
        });
    } 
    // Fetch images from dump folder
    else if (req.url.startsWith('/dump/')) {
        const imagePath = path.join(__dirname, 'public', req.url);
        const imageStream = fs.createReadStream(imagePath);

        res.setHeader("Access-Control-Allow-Origin", "*"); // response Headers

        // Image formats conditions
        if (req.url.match(/.*\.jpg$/i)) {
            res.writeHead(200, { 'Content-Type': 'image/jpeg' }); // jpeg format
        } else if (req.url.match(/.*\.webp$/i)) {
            res.writeHead(200, { 'Content-Type': 'image/webp' }); // webp format
        } else if (req.url.match(/.*\.png$/i)) {
            res.writeHead(200, { 'Content-Type': 'image/png' }); // png format
        } else if (req.url.match(/.*\.jpg$/i)) {
            res.writeHead(200, { 'Content-Type': 'image/jpg' }); // jpg format
        }

        imageStream.pipe(res); // Send image data response

        imageStream.on('error', () => {
            res.writeHead(404, { 'Content-type': 'text/html' });
            res.end("<h1> 404 Error Not Found </h1>");
        });
    }
    // Data Fetch - MongoDB
    else if (req.url === '/api') {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(responseData[0]))

    } else {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(" <h1> 404 Error Not Found </h1>")
    }
});

//MongoDB - Connection with ClusterKS
async function getAllDataFromMongo(client) { // Fetch data
    const cursor = client.db(dbName).collection(dbCollection) //MongoDB Object
        .find();
    const results = await cursor.toArray();
    if (results.length > 0) {
        console.log('results', results)
        return results;
    } else {
        console.log(`No results`);
    }
}
server.listen(6969, () => console.log(" Great, Server is runnning successfully"));