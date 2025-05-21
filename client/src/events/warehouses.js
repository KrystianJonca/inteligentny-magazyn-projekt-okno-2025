import { authorizeRequest } from "./authorization"

async function getWarehouses() {
    let headers = {};
    authorizeRequest(headers);
    const response = await fetch("http://localhost:8000/warehouses/", {
        method: "GET",
        mode: "CORS",
        headers: headers,
    })
    const json = await response.json();
    console.log(json);
}

export {getWarehouses}