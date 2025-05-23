import { useEffect, useState } from 'react';
import './StorageItem.css';
import { getItemsInWarehouse } from '../events/warehouses';

function StorageItem(props) {
    let [items, updateItems] = useState([]);
    useEffect(() => {
        getItemsInWarehouse(props.warehouse.warehouse_id).then(updateItems);
    }, []);
    return (
            <div className='storageWrapper' onClick={()=> {
                if(props.adding) {
                    sessionStorage.setItem("storage_info_method", "POST");
                    sessionStorage.setItem("warehouse_id", undefined);
                    document.querySelector('.storageInfo').style.left = '361px';
                    document.querySelector("#warehouse_name").value = "";
                    document.querySelector("#warehouse_footage").value = "";
                    document.querySelector("#warehouse_manager").value = "";
                    document.querySelector("#warehouse_phone").value = "";
                    document.querySelector("#warehouse_phone_href").href = "";
                    document.querySelector("#warehouse_address").value = "";
                    document.querySelector("#warehouse_address_href").href = ``;
                } else {
                    sessionStorage.setItem("storage_info_method", "PATCH")
                    sessionStorage.setItem("warehouse_id", props.warehouse.warehouse_id);
                }
            }}>
                <div className="storage">
                    <img src='icons/crate.svg'/>
                    <h1>{props.warehouse.name}</h1>
                    <img src='icons/arrowUp.svg' onClick={(e)=> {
                        if (e.target.style.transform != "rotate(180deg)") {
                            e.target.style.transform = "rotate(180deg)";
                            e.target.parentNode.parentNode.querySelector(".storageDetails").style.height = "auto";
                            let height = e.target.parentNode.parentNode.querySelector(".storageDetails").offsetHeight;
                            e.target.parentNode.parentNode.style.height = `${height+50}px`;
                        } else {
                            e.target.style.transform = "rotate(0deg)";
                            e.target.parentNode.parentNode.querySelector(".storageDetails").style.height = "0";
                            e.target.parentNode.parentNode.style.height = `150px`;
                        }
                    }}/>
                </div>
                <div className='storageDetails'>
                    <br></br>
                    {items.map((item, index) => (
                        <div className='favouritedItem' key={index}>
                            <h2 style={{width: 400 + 'px', fontWeight: 500}}>{item.item.name}</h2>
                            <input type='text' defaultValue={item.quantity}/>
                            <img src='icons/arrowLeft.svg'/>
                            <img style={{marginRight: "10px"}} src='icons/arrowRight.svg'/>
                        </div>
                    ))}
                    <br></br>
                    <table>
                        <tbody>
                            <tr>
                                <td><h2>+</h2></td>
                                <td><button onClick={()=> {
                                    document.querySelector('.storageInfo').style.left = '361px';
                                    document.querySelector("#warehouse_name").value = props.warehouse.name;
                                    document.querySelector("#warehouse_footage").value = props.warehouse.square_footage + " m2";
                                    document.querySelector("#warehouse_manager").value = props.warehouse.manager_name;
                                    document.querySelector("#warehouse_phone").value = props.warehouse.phone;
                                    document.querySelector("#warehouse_phone_href").href = `tel:${props.warehouse.phone}`;
                                    document.querySelector("#warehouse_address").value = props.warehouse.address;
                                    document.querySelector("#warehouse_address_href").href = `https://www.google.com/maps?q=${props.warehouse.latitude},${props.warehouse.longitude}`;
                                }}>info</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
    );
}

export default StorageItem