import { authorizeRequest } from "./authorization"

async function getWarehouses() {
    let headers = authorizeRequest();
    const response = await fetch("http://localhost:8000/warehouses/", {
        method: "GET",
        mode: "cors",
        headers: headers,
    })
    const json = await response.json();
    return json;
}

async function getItemsInWarehouse(id) {
    let headers = authorizeRequest();
    const response = await fetch(`http://localhost:8000/inventory/warehouse/${id}`, {
        method: "GET",
        mode: "cors",
        headers: headers,
    })
    let json = await response.json();
    console.log(json);
    return json;
}

export {getWarehouses, getItemsInWarehouse}