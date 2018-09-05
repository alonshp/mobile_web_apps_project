let fetch = require('node-fetch');
let ddos = require('ddos-express');
let express = require('express');
let bodyParser = require('body-parser');
let fs = require('fs');
let cookieParser = require('cookie-parser');

let app = express();

app.use(ddos());
app.use(cookieParser());

let appData = {};

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

    if (userName === undefined) {
        return res.redirect('/static/homePage.html');
    }
    next()
});

app.use('/static/', express.static('www'));


//  ------------ users ------------

// register
app.post('/users/register', function (req, res) {
    
    try {
        const name = req.body.name;
        const user = req.body.user;
        const pass = req.body.pass;
        const organizationName = req.body.organization;
        const userData = appData['users'][user];
        if (userData) {
            console.log("/users/register: user name already exists");
            return res.send('1');
        } else if (!appData['organizations'][organizationName]) {
        console.log("/users/register: organization not exists");
        return res.send('2');
        }
        appData['users'][user] = {name: name, user: user, pass: pass, organization: organizationName, groups: {}};
        writeData();
        console.log("/users/register: " + user + " registered");
        res.send('0');
    } catch(err) {
        res.end(err.message);
    }
});

// login
app.post('/users/login', function (req, res) {
    try {
        const user = req.body.user;
        const pass = req.body.pass;
        const userData = appData['users'][user];
    
        if (userData && userData.pass === pass) {
            tasks = userData.tasks;
            lastID = userData.nextIdeaId;
            console.log("/users/login: " + user + " logged in");
            res.cookie('userName', user, {maxAge: (1000 * 60 * 30)});
            return res.send('0');
        } else {
            console.log("/users/login: wrong user name or password");
            return res.send('1');
        }
    } catch(err) {
        res.end(err.message);
    }
    
});

//  ------------ organizations ------------

// register
app.post('/organizations/register', function (req, res) {
    try {
        const name = req.body.name;
        const organizationData = appData['organizations'][name];
        if (organizationData) {
          console.log("/organizations/register: organization name already exists");
          return res.send('1');
        }
        appData['organizations'][name] = {groups: {}};
        writeData();
    
        console.log("/organizations/register: " + name + "organization registered");
        res.send('0');
    } catch(err) {
        res.end(err.message);
    }
});

//  ------------ my groups ------------

// get groups of user
app.get('/mygroups', function (req, res) {
    try {
        const username = req.cookies.userName;
        res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
        console.log("/mygroups: get " + username + " groups");
        res.json(appData['users'][username]["groups"]);
    } catch(err) {
        res.end(err.message);
    }
});

// add group to user
app.put('/mygroups', function(req, res) {
    try {
        const username = req.cookies.userName;
        res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
        const groupName = req.body.group;
        const id = appData['lastGroupID'];
        const organizationOfUser = appData['users'][username]['organization']
        appData['lastGroupID'] = id + 1;
        appData['users'][username]["groups"][id] = {'name' : groupName, 'projects' : {}}
        appData['organizations'][organizationOfUser]['groups'][id] = appData['users'][username]["groups"][id]
        writeData();
    
        console.log("/mygroups: " + username + "add group");
        res.json({id: id + ''});
    } catch(err) {
        res.end(err.message);
    }
});

// delete group from user groups
app.delete('/mygroups/:id', function(req, res) {
    try {
        const username = req.cookies.userName;
        res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
        const id = req.params.id;
        const isDeleted = delete appData['users'][username]["groups"][id]
        writeData();
        if (isDeleted) {
          console.log("/mygroups: " + username + "deleted a group");
        }
        res.send((isDeleted ? 0 : 1).toString());
    } catch(err) {
        res.end(err.message);
    }
});

//  ------------ groups ------------

// get organization groups
app.get('/groups', function (req, res) {
    try {
        const username = req.cookies.userName;
        const organizationOfUser = appData['users'][username]['organization']
        res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
        let groupsWithoutUserGroups = {}
        for (let groupId in appData['organizations'][organizationOfUser]['groups']) {
          if (!appData['users'][username]["groups"][groupId]) {
            groupsWithoutUserGroups[groupId] = appData['organizations'][organizationOfUser]['groups'][groupId]
          }
        }
        console.log("/groups: get groups");
        res.json(groupsWithoutUserGroups);
    } catch(err) {
        res.end(err.message);
    }
});

// add new group to organization groups
app.put('/groups', function(req, res) {
    try {
        const username = req.cookies.userName;
        const organizationOfUser = appData['users'][username]['organization']
        res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
        const groupName = req.body.group;
        const id = appData['lastGroupID'];
        appData['lastGroupID'] = id + 1;
        appData['organizations'][organizationOfUser]['groups'][id] = {'name' : groupName, 'projects' : {}}
        writeData();
        console.log("/groups: add group");
        res.json({id: id + ''});
    } catch(err) {
        res.end(err.message);
    }
});

// add user to organization group
app.post('/groups/:id', function(req, res) {
    try {
        const username = req.cookies.userName;
        const organizationOfUser = appData['users'][username]['organization']
        res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
        const id = req.params.id;
        appData['users'][username]["groups"][id] = appData['organizations'][organizationOfUser]['groups'][id]
        writeData();
        console.log("/groups: add " + username + " to group");
        res.json({id: id + ''});
    } catch(err) {
        res.end(err.message);
    }
});

// delete group from organization groups
app.delete('/groups/:id', function(req, res) {
    try {
        const username = req.cookies.userName;
        const organizationOfUser = appData['users'][username]['organization']
        res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
        const id = req.params.id;
        const isDeleted = delete appData['organizations'][organizationOfUser]['groups'][id]
        writeData();
        if (isDeleted){
          console.log("/groups: group deleted");
        }
        res.send((isDeleted ? 0 : 1).toString());
    } catch(err) {
        res.end(err.message);
    }
});

//  ------------ projects ------------

// get group projects
app.get('/projects/:groupid', function (req, res) {
    try {
        const username = req.cookies.userName;
        const organizationOfUser = appData['users'][username]['organization']
        res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
        const groupid = req.params.groupid;
    
        console.log("/projects: get group projects");
        res.json(appData['organizations'][organizationOfUser]["groups"][groupid]["projects"]);
    } catch(err) {
        res.end(err.message);
    }
});

// add project to group
app.put('/projects/:groupid', function(req, res) {
    try {
        const username = req.cookies.userName;
        const organizationOfUser = appData['users'][username]['organization']
        res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
        const groupid = req.params.groupid;
        const projectName = req.body.project;
        const id = appData['lastProjectID'];
        appData['lastProjectID'] = id + 1;
        appData['organizations'][organizationOfUser]["groups"][groupid]["projects"][id] = {'name' : projectName, 'tasks' : {}}
    
        writeData();
        console.log("/projects: add project to group");
        res.json({id: id + ''});
    } catch(err) {
        res.end(err.message);
    }
});

// delete project from group projects
app.delete('/projects/:groupid/:projectid', function(req, res) {
    try {
        const username = req.cookies.userName;
        const organizationOfUser = appData['users'][username]['organization']
        res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
        const groupid = req.params.groupid;
        const projectid = req.params.projectid;
        const isDeleted = delete appData['organizations'][organizationOfUser]["groups"][groupid]["projects"][projectid]
        writeData();
        if (isDeleted) {
          console.log("/projects: delete project from group");
        }
        res.send((isDeleted ? 0 : 1).toString());
    } catch(err) {
        res.end(err.message);
    }
});

//  ------------ tasks ------------

// get project tasks
app.get('/tasks/:groupid/:projectid', function (req, res) {
    try {
        const username = req.cookies.userName;
        const organizationOfUser = appData['users'][username]['organization']
        const groupid = req.params.groupid;
        const projectid = req.params.projectid;
        res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
        console.log("/tasks: get tasks");
        res.json(appData['organizations'][organizationOfUser]["groups"][groupid]["projects"][projectid]['tasks']);
    } catch(err) {
        res.end(err.message);
    }
});

// add task to project
app.put('/tasks/:groupid/:projectid', function(req, res) {
    try {
        const username = req.cookies.userName;
        const organizationOfUser = appData['users'][username]['organization']
        const groupid = req.params.groupid;
        const projectid = req.params.projectid;
        res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
        const text = req.body.text;
        const id = appData['lastTaskID'];
        appData['lastTaskID'] = id + 1;
        appData['organizations'][organizationOfUser]["groups"][groupid]["projects"][projectid]['tasks'][id] = {'text': text , 'comments' : {}}
        writeData();
        console.log("/tasks: add tasks");
        res.json({id: id + ''});
    } catch(err) {
        res.end(err.message);
    }
});

// delete task from project tasks
app.delete('/tasks/:id/:groupid/:projectid', function(req, res) {
    try {
        const username = req.cookies.userName;
        const organizationOfUser = appData['users'][username]['organization']
        const groupid = req.params.groupid;
        const projectid = req.params.projectid;
        res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
        const id = req.params.id;
        const isDeleted = delete appData['organizations'][organizationOfUser]["groups"][groupid]["projects"][projectid]['tasks'][id]
        writeData();
        if (isDeleted) {
          console.log("/tasks: task deleted");
        }
        res.send((isDeleted ? 0 : 1).toString());
    } catch(err) {
        res.end(err.message);
    }
});

// edit task
app.post('/tasks/:id/:groupid/:projectid', function (req, res) {
    try {
        const username = req.cookies.userName;
        const organizationOfUser = appData['users'][username]['organization']
        const groupid = req.params.groupid;
        const projectid = req.params.projectid;
        res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
        const id = req.params.id;
        const text = req.body.text;
        appData['organizations'][organizationOfUser]["groups"][groupid]["projects"][projectid]['tasks'][id]['text'] = text;
        writeData();
        console.log("/tasks: edit task");
        res.send('0'); 
    } catch(err) {
        res.end(err.message);
    }
});

//  ------------ comments ------------

// get task comments
app.get('/comments/:groupid/:projectid/:taskid', function (req, res) {
    try {
        const username = req.cookies.userName;
        const organizationOfUser = appData['users'][username]['organization']
        const groupid = req.params.groupid;
        const projectid = req.params.projectid;
        const taskid = req.params.taskid;
        res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
        console.log("/tasks: get comments");
        res.json(appData['organizations'][organizationOfUser]["groups"][groupid]["projects"][projectid]['tasks'][taskid]['comments']);
    } catch(err) {
        res.end(err.message);
    }
});

// add comment to task
app.put('/comments/:groupid/:projectid/:taskid', function(req, res) {
    try {
        const username = req.cookies.userName;
        const organizationOfUser = appData['users'][username]['organization']
        const groupid = req.params.groupid;
        const projectid = req.params.projectid;
        const taskid = req.params.taskid;
        res.cookie('userName', username, {maxAge: (1000 * 60 * 30)});
        const text = req.body.text;
        const name = appData['users'][username]['name']
        const id = appData['lastCommentID'];
        appData['lastCommentID'] = id + 1;
        appData['organizations'][organizationOfUser]["groups"][groupid]["projects"][projectid]['tasks'][taskid]['comments'][id] = {'text':text , 'name':name}
        writeData();
        console.log("/tasks: add comment");
        res.json({id: id + ''});
    } catch(err) {
        res.end(err.message);
    }
});

//  ------------ persistence ------------

function readData() {
  fetch(`http://localhost:8082/data/persist`, { method: 'GET'}).then(function(r){ return r.json()}).then(function(data) {
    console.log("get data from persistent server");
    appData = data;
  });
}

function writeData() {
  fetch(`http://localhost:8082/data/persist`,
    { method: 'POST', headers: {'content-type': "application/json"} ,body: JSON.stringify({appData: appData})})
    .then(function(r) {return r.json()})
    .then(function(res) {
    if (res === 0) {
      console.log("data saved to persistent server");
    } else {
      console.log("error to save data to persistent server");
    }
  });
}

const server = app.listen(8081, function () {
    let host = server.address().address
    let port = server.address().port
 })
