import { authorizeRequest } from "./authorization";

async function getInventoryByItemID(id) {
    if (id == undefined) {
        return {};
    }
    let headers = authorizeRequest();
    const response = await fetch(`http://localhost:8000/inventory/item/${id}`, {
        method: "GET",
        mode: "cors",
        headers: headers
    });
    if (response.status == 401) {
        sessionStorage.removeItem("swm_token");
        document.location.reload();
        return;
    }
    const json = await response.json();
    return json;
}

export {getInventoryByItemID}