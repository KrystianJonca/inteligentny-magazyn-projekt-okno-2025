import { authorizeRequest } from "./authorization";

async function getInventoryByItemID(id) {
    let headers = authorizeRequest();
    const response = await fetch(`http://localhost:8000/inventory/item/${id}`, {
        method: "GET",
        mode: "cors",
        headers: headers
    });
    const json = await response.json();
    return json;
}

export {getInventoryByItemID}