import {login} from "../events/authorization";
import { useState } from 'react';

function LoginView(props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    return (
        <>
            <table>
                <tbody>
                    <tr>
                        <td>Username:</td>
                        <td><input id="username" type="text" onChange={(event) => setUsername(event.target.value)}/></td>
                    </tr>
                    <tr>
                        <td>Password:</td>
                        <td><input id="password" type="password" onChange={(event) => setPassword(event.target.value)}/></td>
                    </tr>
                </tbody>
            </table>
            <button onClick={() => {
               login(username, password);
            }}>Login</button>
	   <div>
	   	<a onClick={props.setRegisterPage}>Rejestracja</a>
       	   </div>
	</>
    );
}

export default LoginView;
