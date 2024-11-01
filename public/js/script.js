// Initialize Socket.IO and JWT Token
const socket = io();
let userToken = localStorage.getItem("token");

// Logout button element
const logoutButton = document.getElementById("logout-button");

// Login Form Submission
document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();
        if (response.ok) {
            localStorage.setItem("token", result.token); // Store JWT token
            initializeMap(); // initialize map on successful login
            toggleForms(false); // hide login/register forms
            logoutButton.style.display = "block"; // show the logout button
        } else {
            document.getElementById("login-error").textContent = result.error;
        }
    } catch (error) {
        console.error("Login failed:", error);
    }
});

// registration Form Submission
document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("register-username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    try {
        const response = await fetch("/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });

        const result = await response.json();
        if (response.ok) {
            toggleForms(true); // switch to login form after successful registration
        } else {
            document.getElementById("register-error").textContent = result.error;
        }
    } catch (error) {
        console.error("Registration failed:", error);
    }
});

// logout Function
logoutButton.addEventListener("click", () => {
    fetch("/logout", {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
    }).then(() => {
        localStorage.removeItem("token"); 
        location.reload(); 
        logoutButton.style.display = "none";
    });
});

// Start Geolocation Tracking if Logged In
function startTracking() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                socket.emit("send-location", { latitude, longitude, token: userToken });
            },
            (error) => {
                console.error("Geolocation error:", error);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    }
}

// initialize Map and Markers
let map;
const markers = {};

function initializeMap() {
    map = L.map("map").setView([0, 0], 16);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "OpenStreetMap",
    }).addTo(map);

    startTracking(); // begin tracking after map setup
}

// handle Location Updates
socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

// handle User Disconnection
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});

function toggleForms(isLogin) {
    document.getElementById("login-form").style.display = isLogin ? "block" : "none";
    document.getElementById("register-form").style.display = isLogin ? "none" : "block";
}

// Check Authentication Status and Initialize Components
if (userToken) {
    toggleForms(false); // Hide login/register forms if authenticated
    initializeMap(); // Initialize map if user is logged in
    logoutButton.style.display = "block"; // Show the logout button if logged in
} else {
    toggleForms(true); // Show login form if no token is found
}
