let input = document.querySelector("input");
let board = document.querySelector("ul");
let myGroupsTab = document.getElementById("my-groups");
let groupsTab = document.getElementById("groups");
let projectsTab = document.getElementById("projects")
let tasksTab = document.getElementById("tasks")

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

let groupID = getParameterByName("groupid")
let projectID = getParameterByName("projectid")
let taskID = getParameterByName("taskid")

myGroupsTab.addEventListener("click", () => {
  window.location = '/static/myGroups.html';
});

groupsTab.addEventListener("click", () => {
  window.location = '/static/groups.html';
});

projectsTab.addEventListener("click", () => {
  window.location = '/static/projects.html?groupid=' + groupID;
});

tasksTab.addEventListener("click", () => {
  window.location = '/static/tasks.html?groupid=' + groupID + '&projectid=' + projectID;
});

fetch(`/comments/${groupID}/${projectID}/${taskID}`, { method: 'GET', credentials: 'include'}).then(function(r){ return r.json()}).then(function(comments) {
    for(let [key,value] of Object.entries(comments)) {
        createIdea(key, value.text, value.name);
    }
})

input.addEventListener("keypress", function(e){
    if(e.which === 13){
        const value = this.value
        fetch(`/comments/${groupID}/${projectID}/${taskID}`, { method: 'PUT', credentials: 'include', headers: {
            'content-type': "application/json"
        } ,body: JSON.stringify({
            text: document.getElementById('commentInput').value
        })})
            .then(function (r) { return r.json()})
            .then(function (id) {
                location.reload();
            })
        this.value = '';
    }
})

function createIdea(id, text, name) {

    const markup = `
    <li id="${id}">
        <p>${name}</p>
        <input value="${text}" disabled/>
    </li>
    `;

    board.innerHTML += markup;

    document.querySelector('ul').addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('trash')) {
            const id = target.parentElement.id;
            doStuffOnServer(id, 'delete');
            target.parentElement.remove();
            return;
        }

        if (target.classList.contains('edit')) {
            const parent = target.parentElement;
            const id = parent.id;
            const input = parent.querySelector('input');
            input.removeAttribute('disabled');
            input.addEventListener('blur', onBlur);
            return;
        }
    });
}

const doStuffOnServer = (id, method, body) => {
    fetch(`/comments/${id}`, {method, credentials: 'include', headers: {
        'content-type': "application/json"
    } ,body});
}

const onBlur = ({target}) => {
    target.setAttribute('disabled', 'disabled');
    target.removeEventListener('blur', onBlur);
    const id = target.parentElement.id;
    doStuffOnServer(id, 'post', JSON.stringify({text: target.value}));
}
