let input = document.querySelector("input");
let board = document.querySelector("ul");
let myGroupsTab = document.getElementById("my-groups");
let groupsTab = document.getElementById("groups");
let projectsTab = document.getElementById("projects")


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

myGroupsTab.addEventListener("click", () => {
  window.location = '/static/myGroups.html';
});

groupsTab.addEventListener("click", () => {
  window.location = '/static/groups.html';
});

projectsTab.addEventListener("click", () => {
  window.location = '/static/projects.html?groupid=' + groupID;
});

fetch(`/tasks/${groupID}/${projectID}`, { method: 'GET', credentials: 'include'}).then(function(r){ return r.json()}).then(function(ideas) {
    for(let [key,value] of Object.entries(ideas)) {
        createIdea(key, value.text);
    }
})

input.addEventListener("keypress", function(e){
    if(e.which === 13){
        const value = this.value
        fetch(`/tasks/${groupID}/${projectID}`, { method: 'PUT', credentials: 'include', headers: {
            'content-type': "application/json"
        } ,body: JSON.stringify({
            text: document.getElementById('ideaInput').value
        })})
            .then(function (r) { return r.json()})
            .then(function (id) {
                location.reload();
            })
        this.value = '';
    }
})

function createIdea(id, text) {

    const markup = `
    <li id="${id}">
        <i class="far fa-edit edit"></i>
        <i class="fas fa-trash trash"></i>
        <input class="input" value="${text}" disabled/>
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

        if (target.classList.contains('input')) {
          const id = target.parentElement.id;
          window.location = '/static/comments.html?groupid=' + groupID + '&projectid=' + projectID + "&taskid=" + id;
          return;
        }
    });
}

const doStuffOnServer = (id, method, body) => {
    fetch(`/tasks/${id}/${groupID}/${projectID}`, {method, credentials: 'include', headers: {
        'content-type': "application/json"
    } ,body});
}

const onBlur = ({target}) => {
    target.setAttribute('disabled', 'disabled');
    target.removeEventListener('blur', onBlur);
    const id = target.parentElement.id;
    doStuffOnServer(id, 'post', JSON.stringify({text: target.value}));
}
