const API_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000"
    : "/api";

const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    message.innerHTML = "";
    message.style.color = "white";

    // Basic Validation
    if (!username || !email || !password) {
        message.style.color = "#ff4d4d";
        message.innerHTML = "Please fill in all fields.";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            message.style.color = "#00ff99";
            message.innerHTML = "Registration successful! Redirecting to login...";

            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);

        } else {
            message.style.color = "#ff4d4d";
            message.innerHTML = data.detail || "Registration failed.";
        }

    } catch (error) {
        console.error(error);
        message.style.color = "#ff4d4d";
        message.innerHTML = "Cannot connect to the server.";
    }
});