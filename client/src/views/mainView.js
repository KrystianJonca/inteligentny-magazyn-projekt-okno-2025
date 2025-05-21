import './mainView.css'
import StorageItem from '../components/storageItem';
import SearchBar from '../components/searchBar';
import SearchedItem from '../components/searchedItem';
import StorageInfo from '../components/storageInfo';
import { getWarehouses } from '../events/warehouses';
import { useState, useEffect } from 'react';
function MainView() {
    const [warehouses, updateWarehouses] = useState([]);
    useEffect(() => {
        getWarehouses().then(updateWarehouses);
    }, []);
    console.log(warehouses);
    return(
        <div>
            <StorageInfo/>
            <div className="topPanel">
                <img src="icons/project-logo.svg" alt='logo'/>
                <h1>Smart Warehouse Management</h1>
            </div>
            <div className='leftPanel'>
                {warehouses.map((warehouse, index) => (
                    <StorageItem key={index} warehouse={warehouse} />
                ))}
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
export default MainView