let express = require('express');
let bodyParser = require('body-parser');
let fs = require('fs');
let cookieParser = require('cookie-parser');
let app = express();

app.use(cookieParser());

let ideas = {};
let users = {};
let groups = {};
let organizations = {"a" : {groups: {"1" : {name: "aaa", projects: {"1": "abc"}}}}};
let projects = {};
let lastID = 0;
let lastGroupID = 0;
let lastProjectID = 0;
let connectUserName = null;

readData();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json({ type: 'application/json' }));

app.use('/', function (req, res, next) {
    let dest = req.originalUrl;
    if(dest.startsWith("/users/login") || dest.startsWith("/users/register") || dest.startsWith("/static/homePage") ||
        dest.startsWith("/static/organizationRegister") || dest.startsWith("/organizations/register") ||
        dest.startsWith("/static/login") || dest.startsWith("/static/register") || dest.startsWith("/static/style")) {
        next();
        return;
    }
    let userName = req.cookies.userName;

    if (!connectUserName || userName === undefined) {
        return res.redirect('/static/homePage.html');
    }
    next()
});

app.use('/static/', express.static('www'));


//  ------------ users ------------

// register
app.post('/users/register', function (req, res) {
    const name = req.body.name;
    const user = req.body.user;
    const pass = req.body.pass;
    const organizationName = req.body.organization;
    const userData = users[user];
    if (userData) {
        console.log("/users/register: user name exists or organization not exists");
        return res.send('1');
    } else if (!organizations[organizationName]) {
      console.log("/users/register: organization not exists");
      return res.send('2');
    }
    users[user] = {name: name, user: user, pass: pass, ideas: {}, nextIdeaId: 0, organization: organizationName, groups: {}};
    writeData();
    console.log("/users/register: " + user + " registered");
    res.send('0');
});

// login
app.post('/users/login', function (req, res) {
    const user = req.body.user;
    const pass = req.body.pass;
    const userData = users[user];

    if (userData && userData.pass === pass) {
        connectUserName = user;
        ideas = userData.ideas;
        lastID = userData.nextIdeaId;
        console.log("/users/login: " + user + " logged in");
        res.cookie('userName', user, {maxAge: (1000 * 60 * 30)});
        return res.send('0');
    } else {
        connectUserName = null;
        ideas = {};
        lastID = 0;
        console.log("/users/login: user name not exists");
        return res.send('1');
    }
});

//  ------------ organizations ------------

// register
app.post('/organizations/register', function (req, res) {
    const name = req.body.name;
    const organizationData = organizations[name];
    if (organizationData) {
      console.log("/organizations/register: organization name already exists");
      return res.send('1');
    }
    organizations[name] = {groups: {}, projects: {}};
    writeData();

    console.log("/organizations/register: " + name + "organization registered");
    res.send('0');
});

//  ------------ my groups ------------

// get groups of user
app.get('/mygroups', function (req, res) {
    const username = req.cookies.userName;
    res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
    console.log("/mygroups: get " + username + " groups");
    res.json(users[username]["groups"]);
});

// add group to user
app.put('/mygroups', function(req, res) {
    const username = req.cookies.userName;
    res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
    const groupName = req.body.group;
    const id = ++lastGroupID;
    groups[id] = groupName;
    users[username]["groups"][id] = groups[id]
    writeData();

    console.log("/mygroups: " + username + "add group");
    res.json({id: id + ''});
});

// delete group from user groups
app.delete('/mygroups/:id', function(req, res) {
    const username = req.cookies.userName;
    res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
    const id = req.params.id;
    const isDeleted = delete users[username]["groups"][id]
    writeData();
    if (isDeleted) {
      console.log("/mygroups: " + username + "deleted a group");
    }
    res.send((isDeleted ? 0 : 1).toString());
});

//  ------------ groups ------------

// get organization groups
app.get('/groups', function (req, res) {
    const username = req.cookies.userName;
    res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
    let groupsWithoutUserGroups = {}
    for (let groupId in groups) {
      if (!users[username]["groups"][groupId]) {
        groupsWithoutUserGroups[groupId] = groups[groupId]
      }
    }
    console.log("/groups: get groups");
    res.json(groupsWithoutUserGroups);
});

// add new group to organization groups
app.put('/groups', function(req, res) {
    const username = req.cookies.userName;
    res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
    const groupName = req.body.group;
    const id = ++lastGroupID;
    groups[id] = groupName;
    writeData();
    console.log("/groups: add group");
    res.json({id: id + ''});
});

// add user to organization group
app.post('/groups/:id', function(req, res) {
    const username = req.cookies.userName;
    res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
    const id = req.params.id;
    users[username]["groups"][id] = groups[id];
    writeData();
    console.log("/groups: add " + username + " to group");
    res.json({id: id + ''});
});

// delete group from organization groups
app.delete('/groups/:id', function(req, res) {
    const username = req.cookies.userName;
    res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
    const id = req.params.id;
    const isDeleted = delete groups[id]
    writeData();
    if (isDeleted){
      console.log("/groups: group deleted");
    }
    res.send((isDeleted ? 0 : 1).toString());
});

//  ------------ projects ------------

// get group projects
app.get('/projects/:groupid', function (req, res) {
    const username = req.cookies.userName;
    res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
    // TODO: use group id
    const groupid = req.params.groupid;

    console.log("/projects: get group projects");
    res.json(organizations[users[username]["organization"]]["groups"]["1"]["projects"]);
});

// add project to group
app.put('/projects/:groupid', function(req, res) {
    const username = req.cookies.userName;
    res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
    // TODO: use group id
    const groupid = req.params.groupid;
    const projectName = req.body.project;
    const id = ++lastProjectID;
    organizations[users[username]["organization"]]["groups"]["1"]["projects"][id] = projectName

    // writeData();
    console.log("/projects: add project to group");
    res.json({id: id + ''});
});

// delete project from group projects
app.delete('/projects/:groupid', function(req, res) {
    const username = req.cookies.userName;
    res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
    const id = req.params.groupid;
    const isDeleted = delete organizations[users[username]["organization"]]["groups"]["1"]["projects"][id]
    writeData();
    if (isDeleted) {
      console.log("/projects: delete project from group");
    }
    res.send((isDeleted ? 0 : 1).toString());
});

//  ------------ tasks ------------

// get project tasks
app.get('/tasks/:groupid/:projectid', function (req, res) {
    const username = req.cookies.userName;
    res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
    console.log("/tasks: get tasks");
    res.json(ideas);
});

// add task to project
app.put('/tasks/:groupid/:projectid', function(req, res) {
    const username = req.cookies.userName;
    res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
    const text = req.body.text;
    const id = ++lastID;
    ideas[id] = text;
    writeData();
    console.log("/tasks: add tasks");
    res.json({id: id + ''});
});

// delete task from project tasks
app.delete('/tasks/:id/:groupid/:projectid', function(req, res) {
    const username = req.cookies.userName;
    res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
    const id = req.params.id;
    const isDeleted = delete ideas[id]
    writeData();
    if (isDeleted) {
      console.log("/tasks: task deleted");
    }
    res.send((isDeleted ? 0 : 1).toString());
});

// edit task
app.post('/tasks/:id/:groupid/:projectid', function (req, res) {
    const username = req.cookies.userName;
    res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
    const id = req.params.id;
    const text = req.body.text;
    ideas[id] = text;
    writeData();
    console.log("/tasks: edit task");
    res.send('0');
});


//  ------------ persistence ------------

function readData() {
    fs.readFile('database.json', function(err, data) {
       if(err) {
           return console.log(err);
       } else {
           users = JSON.parse(data);
       }
    });
}

function writeData() {

    if(connectUserName) {
        users[connectUserName].ideas = ideas;
        users[connectUserName].nextIdeaId = lastID;
    }
    const currentData = JSON.stringify(users);
    fs.writeFile('database.json', currentData, function(err) {
        if(err) {
            return console.log(err)
        }
    });
}

const server = app.listen(8081, function () {
    let host = server.address().address
    let port = server.address().port
 })
