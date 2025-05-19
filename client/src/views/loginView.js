import {login} from "../events/authorization"

function loginView() {
    return(
        <>
            <table>
                <tbody>
                    <td>Username:</td>
                    <td><input id="username" type="text" /></td>
                </tbody>
                <tbody>
                    <td>Password:</td>
                    <td><input id="password" type="password" /></td>
                </tbody>
            </table>
            <button onClick={()=> {
                const username = document.querySelector("#username").value;
                const password = document.querySelector("#password").value;
                login(username, password);
            }}>Login</button>
        </>
    )
}

export default loginView