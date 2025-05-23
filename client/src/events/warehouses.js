import { authorizeRequest } from "./authorization"

async function getWarehouses() {
    let headers = authorizeRequest();
    const response = await fetch("http://localhost:8000/warehouses/", {
        method: "GET",
        mode: "cors",
        headers: headers,
    })
    if (response.status == 401) {
        sessionStorage.removeItem("swm_token");
        document.location.reload();
        return;
    };
    const json = await response.json();
    return json;
}

async function getItemsInWarehouse(id) {
    if (id == undefined) {
        return [];
    }
    let headers = authorizeRequest();
    const response = await fetch(`http://localhost:8000/inventory/warehouse/${id}`, {
        method: "GET",
        mode: "cors",
        headers: headers,
    });
    if (response.status == 401) {
        sessionStorage.removeItem("swm_token");
        document.location.reload();
        return;
    }
    let json = await response.json();
    return json;
}

async function patchWarehouse(id, data) {
    if (id == undefined) {
        return 404;
    }
    let headers = authorizeRequest();
    const response = await fetch(`http://localhost:8000/warehouses/${id}`, {
        method: "PATCH",
        mode: "cors",
        headers: headers,
        body: JSON.stringify(data)
    });
    return response.status;
}

async function createWarehouse(data) {
    let headers = authorizeRequest();
    const response = await fetch(`http://localhost:8000/warehouses/`, {
        method: "POST",
        mode: "cors",
        headers: headers,
        body: JSON.stringify(data)
    });
    return response.status;
}

async function deleteWarehouse(id) {
    if (id == undefined) {
        return 404;
    }
    let headers = authorizeRequest();
    const response = await fetch(`http://localhost:8000/warehouses/${id}`, {
        method: "DELETE",
        mode: "cors",
        headers: headers
    })
    return response.status;
}

export {getWarehouses, getItemsInWarehouse, patchWarehouse, createWarehouse, deleteWarehouse}