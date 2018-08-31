let input = document.querySelector("input");
let board = document.querySelector("ul");
let myGroupsTab = document.getElementById("my-groups");
let groupsTab = document.getElementById("groups");

myGroupsTab.addEventListener("click", () => {
  window.location = '/static/myGroups.html';
});

groupsTab.addEventListener("click", () => {
  window.location = '/static/groups.html';
});

fetch(`/groups`, { method: 'GET', credentials: 'include'}).then(function(r){ return r.json()}).then(function(groups) {
    for(let [key,value] of Object.entries(groups)) {
        createIdea(key, value.name);
    }
})

input.addEventListener("keypress", function(e){
    if(e.which === 13){
        const value = this.value
        fetch('/groups/', { method: 'PUT', credentials: 'include', headers: {
            'content-type': "application/json"
        } ,body: JSON.stringify({
            group: document.getElementById('groupsInput').value
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
        <i class="fas fa-user-plus add"></i>
        <i class="fas fa-trash trash"></i>
        <input value="${text}" disabled/>
    </li>
    `;

    board.innerHTML += markup;

    document.querySelector('ul').addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('add')) {
            const id = target.parentElement.id;
            doStuffOnServer(id, 'post');
            target.parentElement.remove();
            return;
        }

        if (target.classList.contains('trash')) {
            const id = target.parentElement.id;
            doStuffOnServer(id, 'delete');
            target.parentElement.remove();
            return;
        }
    });
}

const doStuffOnServer = (id, method, body) => {
    fetch(`/groups/${id}`, {method, credentials: 'include', headers: {
        'content-type': "application/json"
    } ,body});
}

const onBlur = ({target}) => {
    target.setAttribute('disabled', 'disabled');
    target.removeEventListener('blur', onBlur);
    const id = target.parentElement.id;
    doStuffOnServer(id, 'post', JSON.stringify({text: target.value}));
}
