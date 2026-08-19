/* ===========================================================
   AI Chat Studio
   Login Page
=========================================================== */

// ==========================================================
// Backend URL
// ==========================================================

const API_URL = "http://127.0.0.1:8000";

// ==========================================================
// DOM Elements
// ==========================================================

const loginForm = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const message = document.getElementById("message");
console.log("Login Form:", loginForm);
console.log("Email:", email);
console.log("Password:", password);
console.log("Message:", message);
console.log("Page Loaded");

// ==========================================================
// Login Function
// ==========================================================

loginForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    message.style.color = "white";
    message.innerHTML = "Logging in...";

    try {

        const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        email: email.value,
        password: password.value
    })
});

        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));

        if (!response.ok) {

            message.style.color = "#ff4d4d";

            message.innerHTML = data.detail || "Login Failed";

            return;

        }

        // Save JWT Token

        localStorage.setItem("token", data.access_token);

        message.style.color = "#4ade80";

        message.innerHTML = "Login Successful...";

        // Redirect after 1 second

        setTimeout(() => {

            window.location.href = "index.html";

        }, 1000);

    }

    catch (error) {

        console.error(error);

        message.style.color = "#ff4d4d";

        message.innerHTML = "Cannot connect to backend.";

    }

});