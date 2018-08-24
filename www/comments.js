let input = document.querySelector("input");
let board = document.querySelector("ul");

fetch('/comments/', { method: 'GET', credentials: 'include'}).then(function(r){ return r.json()}).then(function(comments) {
    for(let [key,value] of Object.entries(Comments)) {
        createIdea(key, value);
    }
})

input.addEventListener("keypress", function(e){
    if(e.which === 13){
        const value = this.value 
        fetch('/comments/', { method: 'PUT', credentials: 'include', headers: {
            'content-type': "application/json"
        } ,body: JSON.stringify({
            text: document.getElementById('commentInput').value
        })})
            .then(function (r) { return r.json()})
            .then(function (id) {
                createIdea(id, value)
            })
        this.value = '';
    }
})

function createIdea(id, text) {

    const markup = `
    <li id="${id}">
        <i class="far fa-edit edit"></i>
        <i class="fas fa-trash trash"></i>
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

