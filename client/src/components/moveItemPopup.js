import "./moveItemPopup.css";
import React from "react";


class MoveItemPopup extends React.Component
{

	constructor(props){
		
		super(props);
		this.state = {
			popupSize: 0,
			positionLeft: 0,
			positionTop: 0
		};
		this.setPopupSizeAndPosition = this.setPopupSizeAndPosition.bind(this);
//		window.onresize = (event) => this.setPopupSizeAndPosition();

	}

	componentDidMount(){
		this.setPopupSizeAndPosition();
	}

	
	onWindowResize(event){
		this.setPopupSizeAndPosition();
	}

	setPopupSizeAndPosition(){
		let size = 500;
		if(window.innerWidth < 1280){
			size = 400;
		}
		let left = (window.innerWidth - size) / 2;
		let top = (window.innerHeight - size) / 2;
		this.setState({popupSize: size, positionLeft: left, positionTop: top});
	}
	

	render(){
		console.info("Rendering MoveItemPopup with props: %s", this.props.width);
		const right = - (this.props.width + 45);
		console.log("Right: ", right);
		return <div className="popup" style={{"height": this.props.height + "px", "width": this.props.width + "px", "right": right + "px"}}>
			Popup
			</div>;
	}
}


export default MoveItemPopup;
