let loginBtn = document.getElementById("login");
let newOrganizationBtn = document.getElementById("organization-register");
let registerBtn = document.getElementById("register");


loginBtn.addEventListener("click", () => {
    window.location = '/static/login.html';
});

newOrganizationBtn.addEventListener("click", () => {
    window.location = '/static/organizationRegister.html';
});

registerBtn.addEventListener("click", () => {
    window.location = '/static/register.html';
});
