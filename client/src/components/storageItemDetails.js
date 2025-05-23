import MoveItemPopup from './moveItemPopup';
import { useState } from 'react';

function StorageItemDetails(props) {
	const [showPopup, setShowPopup] = useState(false);
	return (
		<div className='favouritedItemWrapper'>
		<div className='favouritedItem'>
                        <h2>{props.name}</h2>
                        <input type="text"/>
                        <img src='icons/arrowRight.svg'/>
                        <img style={{marginRight: "10px"}} src='icons/arrowLeft.svg'/>
                    </div>)
		{showPopup && <MoveItemPopup/>}
	</div>);
}


export default StorageItemDetails;
