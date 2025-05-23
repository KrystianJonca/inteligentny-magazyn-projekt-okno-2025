import './mainView.css'
import StorageItem from '../components/storageItem';
import SearchBar from '../components/searchBar';
import SearchedItem from '../components/searchedItem';
import StorageInfo from '../components/storageInfo';
import MoveItemPopup from '../components/moveItemPopup';

function mainView() {
    return(
        <div className="main-container">
            <StorageInfo/>
            <div className="top-panel">
                <img src="icons/project-logo.svg" alt='logo'/>
                <h1>Smart Warehouse Management</h1>
            </div>
	    <div className="main-content">
            <div className='leftPanel'>
                <StorageItem/>
                <StorageItem/>
                <StorageItem/>
                <StorageItem/>
                <StorageItem/>
                <StorageItem/>
            </div>
            <div className='rightPanel'>
                <SearchBar/>
                <SearchedItem/>
                <SearchedItem/>
                <SearchedItem/>
                <SearchedItem/>
                <SearchedItem/>
                <SearchedItem/>
            </div>
	    </div>
        </div>
    );
}
export default mainView
