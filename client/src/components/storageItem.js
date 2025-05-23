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
	          </div>} 
            </div>
    );
}

export default StorageItem
