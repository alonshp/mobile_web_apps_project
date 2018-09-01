let registerBtn = document.getElementById("register");
let homePageBtn = document.getElementById("home-page");

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

homePageBtn.addEventListener("click", () => {
    window.location = '/static/homePage.html';
});