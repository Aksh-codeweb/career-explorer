/*********************************
 * SAFE AUTH.JS (NO SDK LOOP)
 *********************************/

console.log("Auth.js loading safely...");

// Just check token — no Cognito SDK usage
document.addEventListener("DOMContentLoaded", () => {

    const idToken = localStorage.getItem("idToken");

    if (!idToken) {
        console.log("No token found → redirect login");
        window.location.href = "login.html";
        return;
    }

    try {
        const payload = JSON.parse(atob(idToken.split(".")[1]));

        const usernameSpan = document.getElementById("username");
        const authButtons = document.getElementById("auth-buttons");
        const userMenu = document.getElementById("user-menu");

        if (usernameSpan) usernameSpan.textContent = payload.email || "User";
        if (authButtons) authButtons.style.display = "none";
        if (userMenu) userMenu.style.display = "flex";

        console.log("User authenticated:", payload.email);

    } catch (e) {
        console.log("Invalid token");
        localStorage.clear();
        window.location.href = "login.html";
    }
});
