import { useEffect, useState } from 'react';
import './searchedItem.css'
import { getInventoryByItemID } from '../events/inventory';

function SearchedItem(props) {
    let [inventory, updateInventory] = useState([]);
    useEffect(()=> {
        getInventoryByItemID(props.item.item_id).then(updateInventory)
    }, [props.item.item_id]);
    return(
        <div className="searchedItemWrapper">
            <div className='searchedItem'>
                <h2 style={{marginLeft: "15px", width: "300px", fontWeight: 600}}>{props.item.name}</h2>
                <h2>{props.item.total_inventory}</h2>
                <img src='icons/arrowUp.svg' onClick={(e)=> {
                        if (e.target.style.transform != "rotate(180deg)") {
                            e.target.style.transform = "rotate(180deg)";
                            e.target.parentNode.parentNode.querySelector(".searchedItemDetails").style.height = "auto";
                            let height = e.target.parentNode.parentNode.querySelector(".searchedItemDetails").offsetHeight;
                            e.target.parentNode.parentNode.style.height = `${height+30}px`;
                        } else {
                            e.target.style.transform = "rotate(0deg)";
                            e.target.parentNode.parentNode.querySelector(".searchedItemDetails").style.height = "0";
                            e.target.parentNode.parentNode.style.height = `84px`;
                        }
                    }}/>
            </div>
            <div className='searchedItemDetails'>
                <br></br>
                {inventory.map((inv, index) => (
                    <div className='listedStorage' key={index}>
                        <img src='icons/crate.svg'/>
                        <h3 style={{width: '200px', marginLeft: '10px', marginRight: "20px"}}>{inv.warehouse.name}</h3>
                        <h3 style={{marginRight: '20px'}}>{inv.quantity}</h3>
                        <img style={{height: '20px'}} src='icons/arrowLeft.svg'/>
                        <img style={{height: '20px', marginLeft: '10px'}} src='icons/arrowRight.svg'/>
                    </div>
                ))}
                
            </div>
        </div>
    );
}
export default SearchedItem