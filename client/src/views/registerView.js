import { useState } from 'react';
import { register } from '../events/authorization';


function RegisterView(props) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");


	return ( 
		<div>
			<form>
				<div>
					<input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)}/>
				</div>
				<div>
					<input type="password" onChange={(e) => setPassword(e.target.value)}/>
				</div>
				<button onClick={() => register(username, password)}>REGISTER</button>
				<div>
					<a onClick={props.setLoginPage}>LOGOWANIE</a>
				</div>
			</form>
		</div> 
	); 
}



export default RegisterView;
