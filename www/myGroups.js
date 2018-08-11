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


fetch(`/mygroups`, { method: 'GET', credentials: 'include'}).then(function(r){ return r.json()}).then(function(userGroups) {
    for(let [key,value] of Object.entries(userGroups)) {
        createIdea(key, value);
    }
})

input.addEventListener("keypress", function(e){
    if(e.which === 13){
        const value = this.value
        fetch(`/mygroups`, { method: 'PUT', credentials: 'include', headers: {
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
        <i class="fas fa-user-minus trash"></i>
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
          window.location = '/static/projects.html?groupid=' + id;
          return;
        }
    });
}

const doStuffOnServer = (id, method, body) => {
    fetch(`/mygroups/${id}`, {method, credentials: 'include', headers: {
        'content-type': "application/json"
    } ,body});
}

const onBlur = ({target}) => {
    target.setAttribute('disabled', 'disabled');
    target.removeEventListener('blur', onBlur);
    const id = target.parentElement.id;
    doStuffOnServer(id, 'post', JSON.stringify({text: target.value}));
}
