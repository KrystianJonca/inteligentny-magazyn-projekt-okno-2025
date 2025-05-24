async function login(username, password) {
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);
    params.append("grant_type", "password");

    const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
	    "Access-Control-Allow-Origin": "http://localhost"
        },
        body: params.toString(),
    })
    if (response.status == 401) {
        document.location.reload();
        return;
    }
    const data = await response.json();
    sessionStorage.setItem("swm_token", data.access_token);
    document.location.reload();
}

function authorizeRequest() {
    let headers = {};
    const token = sessionStorage.getItem("swm_token");
    headers.Authorization = `Bearer ${token}`;
    headers["Content-Type"] = "application/json";
    return headers;
}

async function register(username, password){
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);

    const response = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
    })
    if( response.status >= 400){
    	console.log("ERROR");
    }
    
}

export {login, register, authorizeRequest};
