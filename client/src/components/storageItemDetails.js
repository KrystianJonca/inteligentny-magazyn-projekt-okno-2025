import MoveItemPopup from './moveItemPopup';
import { useState } from 'react';

function StorageItemDetails(props) {
	const [showPopup, setShowPopup] = useState(false);

	const switchShowPopup = () => {
		if(showPopup){
			setShowPopup(false);
		} else {
			setShowPopup(true);
		}
	}
	return (
		<div className='favourited-item-wrapper'>
		<div className='favouritedItem'>
                        <h2>{props.name}</h2>
                        <input type="text"/>
			<div onClick={switchShowPopup}>
                        	<img src='icons/arrowRight.svg'/>
                        	<img style={{marginRight: "10px"}} src='icons/arrowLeft.svg'/>
			</div>
                    </div>
		{showPopup && <MoveItemPopup width={200} height={300}/>}
	</div>);
}


export default StorageItemDetails;
