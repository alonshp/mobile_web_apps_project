let loginBtn = document.getElementById("login");

loginBtn.addEventListener("click", () => fetch('/users/login', { method: 'POST', credentials: 'include', headers: {
        'content-type': "application/json"
    } ,body: JSON.stringify({
        user: document.getElementById('user-name').value,
        pass: document.getElementById('pass').value
    })}).then(res => res.json()).then(res => {
    if(res === 0) {
        window.location = '/static/myGroups.html';
    } else {
        alert("User name doesn't exists");
        window.location = '/static/register.html';
    }
}));
