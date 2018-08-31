let express = require('express');
let bodyParser = require('body-parser');
let fs = require('fs');
let app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json({ type: 'application/json' }));


let appData = {}

readData()

// load data
app.get('/data/persist', function (req, res) {
    console.log("/persistent: get app data");
    res.json(appData);
});

// save data
app.post('/data/persist', function(req, res) {
    console.log("/persistent: save app data");

    const data = req.body.appData;
    appData = data;
    writeData(data);

    res.send('0');
});

// clean data
app.post('/data/clean', function(req, res) {
    console.log("/persistent: clean data");
    const data = {
      "users":{},
      "organizations":{},
      "lastGroupID":0,
      "lastProjectID":0,
      "lastTaskID":0,
      "lastCommentID":0
    }
    appData = data;
    writeData(data);

    res.send('0');
});
//  ------------ persistence ------------

function readData() {
    fs.readFile('database.json', function(err, data) {
       if(err) {
           return console.log(err);
       } else {
           appData = JSON.parse(data);
       }
    });
}

function writeData(data) {
    fs.writeFile('database.json', JSON.stringify(data), function(err) {
        if(err) {
            return console.log(err)
        }
    });
}

const persistent = app.listen(8082, function () {
    let host = persistent.address().address
    let port = persistent.address().port
 })
