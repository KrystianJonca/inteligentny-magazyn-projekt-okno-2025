import { authorizeRequest } from "./authorization"

async function getWarehouses() {
    let headers = {
        "Content-Type": "application/json",
    }
    authorizeRequest(headers);
    const response = await fetch("http://localhost:8000/warehouses/", {
        method: "GET",
        mode: "cors",
        headers: headers,
    })
    const json = await response.json();
    console.log(json);
}

export {getWarehouses}