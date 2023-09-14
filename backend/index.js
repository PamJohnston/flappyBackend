//https://stackoverflow.com/questions/5823722/how-to-serve-an-image-using-nodejs

var path = require('path');
var express = require('express');
var app = express();

// The database
//const MongoClient = require('mongodb').MongoClient;
const { MongoClient } = require("mongodb");
//const uri = "mongodb://test:password@127.0.0.1:27017/mydb";
// Unsecured database
const uri = "mongodb://127.0.0.1:27017";

var options = {
    index: "home.html"
  };

var dir = path.join(__dirname, '../frontend');



app.get('/api', function(req, res){
    res.send("Yes we have an API now")
});

app.use("/api/todolist", function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://127.0.0.1:3000"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();
  });
  

app.post('/api/score', function(req, res){
    var n = req.query.name
    var s_string = req.query.score
    var c = req.query.comment

    s = Number(s_string)

    console.log("Storing score name: "+n+ "; and score: " + s + "; and comment:" + c )
    console.log("Mongo URI is "+uri)

    // Database stuff
    // Create a new MongoClient
    const client = new MongoClient(uri);
    async function run() {
    try {
        console.log('Start the database stuff');
        //Write databse Insert/Update/Query code here..
        var dbo = client.db("scores");
        var myobj = { name: n, score: s, comment: c};
        await dbo.collection("scores_collection").insertOne(myobj, function(err, res) {
            if (err) {
                console.log(err); 
                throw err;
            }
        }); 
        console.log('End the database stuff');

    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
    }
    run().catch(console.dir);
    res.send("stored " +n)
});

app.get('/api/score', function(req, res){
    console.log("getting the scores")
    console.log("Mongo URI is "+uri)
    var response = "";
    const client = new MongoClient(uri);
    async function run() {
        try {
            const dbo = client.db("scores");
            const query = {};
            const options = {'_id': 0};
            //const options = {
            //    sort: { score: 1  },
            //    projection: { name: 1, score: 1 },
            //};
            // sort in descending (-1) order by length
            const sort = { score: -1 };
        
            const cursor = dbo.collection("scores_collection").find(query, {'_id': 0},).sort(sort, {'_id': 0},);
            if ((await cursor.countDocuments) === 0) {
                console.log("No documents found!");
                response = ""
            }
            // prepare the response as an array
            const response = await cursor.toArray();
            res.send(response)
        } finally {
            await client.close();
        }
    }
    run().catch(console.dir);
});
app.delete('/api/score', function(req, res){
    console.log("deleting the current scoreboard")
    console.log("Mongo URI is "+uri)
    const client = new MongoClient(uri);
    async function run() {
        try {
            console.log("starting up the database")
            const dbo = client.db("scores");
            const query = {};
           
            console.log("deleting the collection")
            await dbo.collection("scores_collection").deleteMany(query, function(err, result) {
                if (err) throw err;
            });
 
        } finally {
            await client.close();
        }
    }
    run().catch(console.dir);
    res.send("Deleted list")
});

app.use(express.static(dir, options));

// 404 page
app.use(function ( req, res, next) {
    res.send('This page does not exist!')
});

app.listen(8000, function () {
    console.log('Listening on http://localhost:8000/');
});