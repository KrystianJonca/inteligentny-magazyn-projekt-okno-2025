import LoginView from "./loginView";
import MainView from './mainView';

function generalView() {
    const token = sessionStorage.getItem('swm_token');
    let child = token === null ? (<LoginView></LoginView>) : (<MainView></MainView>);
    return(
        <>
            {child}
        </>
    );
}
export default generalView