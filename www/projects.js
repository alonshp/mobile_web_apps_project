let input = document.querySelector("input");
let board = document.querySelector("ul");
let myGroupsTab = document.getElementById("my-groups");
let groupsTab = document.getElementById("groups");


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


myGroupsTab.addEventListener("click", () => {
  window.location = '/static/myGroups.html';
});

groupsTab.addEventListener("click", () => {
  window.location = '/static/groups.html';
});

fetch(`/projects/${groupID}`, { method: 'GET', credentials: 'include'}).then(function(r){ return r.json()}).then(function(ideas) {
    for(let [key,value] of Object.entries(ideas)) {
        createIdea(key, value);
    }
})

input.addEventListener("keypress", function(e){
    if(e.which === 13){
        const value = this.value
        fetch(`/projects/${groupID}`, { method: 'PUT', credentials: 'include', headers: {
            'content-type': "application/json"
        } ,body: JSON.stringify({
            project: document.getElementById('projectInput').value
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
        <i class="fas fa-trash trash"></i>
        <input value="${text}" disabled class="input"/>
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

        if (target.classList.contains('input')) {
          const id = target.parentElement.id;
          window.location = '/static/tasks.html?groupid=' + groupID + '&projectid=' + id;
          return;
        }

        // if (target.classList.contains('edit')) {
        //     const parent = target.parentElement;
        //     const id = parent.id;
        //     const input = parent.querySelector('input');
        //     input.removeAttribute('disabled');
        //     input.addEventListener('blur', onBlur);
        //     return;
        // }
    });
}

const doStuffOnServer = (id, method, body) => {
    fetch(`/projects/${id}`, {method, credentials: 'include', headers: {
        'content-type': "application/json"
    } ,body});
}

const onBlur = ({target}) => {
    target.setAttribute('disabled', 'disabled');
    target.removeEventListener('blur', onBlur);
    const id = target.parentElement.id;
    doStuffOnServer(id, 'post', JSON.stringify({text: target.value}));
}
