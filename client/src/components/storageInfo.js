import './storageInfo.css'
import { createWarehouse, deleteWarehouse, patchWarehouse } from '../events/warehouses';

function StorageInfo() {
    const saveButton = async () => {
        const method = sessionStorage.getItem("storage_info_method");
        let data = {
            "name": "string",
            "square_footage": 0,
            "address": "string",
            "manager_name": "string",
            "phone": "string",
            "latitude": 0,
            "longitude": 0
        };
        data.name = document.querySelector("#warehouse_name").value;
        data.square_footage = document.querySelector("#warehouse_footage").value.replace("m2", "");
        data.address = document.querySelector("#warehouse_address").value;
        data.manager_name = document.querySelector("#warehouse_manager").value;
        data.phone = document.querySelector("#warehouse_phone").value;
        if (method == "PATCH") {
            let warehouse_id = sessionStorage.getItem("warehouse_id");
            let status = await patchWarehouse(warehouse_id, data)
            if (status == 200) {
                document.location.reload();
            }
        } else {
            let status = await createWarehouse(data)
            if (status == 200) {
                document.location.reload();
            }
        }
    };

    const deleteButton = async () => {
        const id = sessionStorage.getItem("warehouse_id");
        let status = deleteWarehouse(id);
        if (status == 204) {
            document.location.reload();
        }
    };
    return(
        <div className="storageInfo">
            <table>
                <tbody>
                    <tr>
                        <td><button onClick={saveButton}>Save</button><button onClick={deleteButton} style={{marginLeft: "10px"}}>Delete</button></td>
                        <td>
                            <h1 onClick={()=> {
                                    document.querySelector('.storageInfo').style.left = '-800px';
                                }}>+
                            </h1>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div className='generalInfo'>
                <div>
                    <img src='icons/label.svg'/>
                    <input id='warehouse_name'/>
                </div>
                <div>
                    <img src='icons/ruler.svg'/>
                    <input id='warehouse_footage'/>
                </div>
                <div>
                    <img src='icons/person.svg'/>
                    <input id='warehouse_manager'/>
                </div>
                <div>
                    <a id='warehouse_phone_href' href=''><img src='icons/telephone.svg'/></a>
                    <input id='warehouse_phone'/>
                </div>
            </div>
            <div style={{height: "360px", border: "2px solid #90e5d8", width: 0, display: "inline-block", marginTop: "103px"}}></div>
            <div className='locationInfo'>
                <img src='icons/dummy.svg'/>
                <br></br>
                <a id='warehouse_address_href' target='_blank' href=''><img style={{marginTop: "20px"}} src='icons/location.svg'/></a>
                <br></br>
                <input id='warehouse_address' style={{width: "300px", textAlign: "center"}}/>
            </div>
        </div>
    );
}

export default StorageInfo