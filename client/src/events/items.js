import { authorizeRequest } from "./authorization";

async function searchItems(query) {
    let headers = authorizeRequest();
    const response = await fetch(`http://localhost:8000/items/?search=${query}`, {
        method: "GET",
        mode: "cors",
        headers: headers
    });
    let json = await response.json();
    return json;
}

export {searchItems}