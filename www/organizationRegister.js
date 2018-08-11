let registerBtn = document.getElementById("register");

registerBtn.addEventListener("click", () => fetch('/organizations/register', { method: 'POST', headers: {
        'content-type': "application/json"
    } ,body: JSON.stringify({
        name: document.getElementById('name').value,
    })}).then(res => res.json()).then(res => {
    if(res === 0) {
      alert("Organization registered!");
      window.location = '/static/homePage.html';
    } else {
      alert("Organization with this name already exists");
    }
}));
