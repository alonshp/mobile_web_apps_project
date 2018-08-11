let registerBtn = document.getElementById("register");
let loginBtn = document.getElementById("login");

registerBtn.addEventListener("click", () => fetch('/users/register', { method: 'POST', headers: {
        'content-type': "application/json"
    } ,body: JSON.stringify({
        name: document.getElementById('name').value,
        user: document.getElementById('user-name').value,
        pass: document.getElementById('pass').value,
        organization: document.getElementById('organization').value
    })}).then(res => res.json()).then(res => {
    if(res === 0) {
      window.location = '/static/login.html';
    } else if (res === 1) {
      alert("User name already exists");
    } else {
      alert("Organization not exists");
    }
}));

loginBtn.addEventListener("click", () => window.location = "/static/login.html");
