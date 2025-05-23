import './StorageItem.css';
import MoveItemPopup from './moveItemPopup.js';
import StorageItemDetails from './storageItemDetails.js';
import {useState} from 'react';

function StorageItem() {

    const items = [{name: "Artyukuly biurowe"}, {name: "Artyukuly biurowe"}, {name: "Artyukuly biurowe"}, {name: "Artyukuly biurowe"}]
    const [showDetails, setShowDetails] = useState(false);
    const switchShowDetails = () => {
    	if(showDetails){
		setShowDetails(false);
	} else {
		setShowDetails(true);
	}
    }
	
    const showInfo = () => {
    	console.log("SHOW INFO");
    }

    const addItem = () => {
    	console.log("ADD ITEM");
    }
    return (
            <div className="storageWrapper">
                <div className="storage">
                    <img src='icons/crate.svg'/>
                    <h1>Magazyn Woronicza</h1>
                    <img src='icons/arrowUp.svg' onClick={(e)=> {
                        if (e.target.style.transform != "rotate(180deg)") {
                            e.target.style.transform = "rotate(180deg)";
                       } else {
                            e.target.style.transform = "rotate(0deg)";
                       }
			switchShowDetails()
                    }}/>
                </div>
	    {showDetails &&
	        <div className='storageDetails'>
		    {items.map((item) =>
		    	<StorageItemDetails name={item.name}/>
		    )
		    }
		    <button onClick={showInfo}>INFO</button>
		    <div className="storage-details-add-item" onClick={addItem}>+</div>
	          </div>} 
            </div>
    );
}

export default StorageItem
