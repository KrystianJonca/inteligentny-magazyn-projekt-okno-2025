import LoginView from "./loginView";
import MainView from './mainView';
import RegisterView from './registerView';
import React  from 'react';




class GeneralView extends React.Component {


	
	constructor(props){
		super(props);
		this.setRegisterPage = () => {
			this.setState({view: "register"});
		}
		this.setLoginPage = () => {
			this.setState({view: "login"});
		};
 		this.state = {view: "main"};
 	        const token = sessionStorage.getItem('swm_token');
		if( !token){
			this.state.view = 'login';
		}
		
    	
	}

	render(){
		console.log(this.state.view);
		return (
			<>
				{this.state.view === "register" && <RegisterView setLoginPage={this.setLoginPage}/>}
				{this.state.view === "login" && <LoginView setRegisterPage={this.setRegisterPage}/>}
				{this.state.view === "main" && <MainView/>}
			</>

		);
	}
   
}

export default GeneralView;
