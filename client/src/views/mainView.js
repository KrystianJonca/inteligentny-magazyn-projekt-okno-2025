import './mainView.css'
import StorageItem from '../components/storageItem';
import SearchBar from '../components/searchBar';
import SearchedItem from '../components/searchedItem';
import StorageInfo from '../components/storageInfo';
function mainView() {
    return(
        <div>
            <StorageInfo/>
            <div className="topPanel">
                <img src="icons/project-logo.svg" alt='logo'/>
                <h1>Smart Warehouse Management</h1>
            </div>
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
    );
}
export default mainView