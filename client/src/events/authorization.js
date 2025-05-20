async function login(username, password) {
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);
    params.append("grant_type", "password");

    const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
    })
    const data = await response.json();
    sessionStorage.setItem("swm_token", data.access_token);
    document.location.reload();
}

function authorizeRequest(headers) {
    const token = sessionStorage.getItem("swm_token");
    headers.Authorization = `Bearer ${token}`;
}

export {login, authorizeRequest};