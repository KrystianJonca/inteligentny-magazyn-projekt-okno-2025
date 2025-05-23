import './mainView.css'
import StorageItem from '../components/storageItem';
import SearchBar from '../components/searchBar';
import SearchedItem from '../components/searchedItem';
import StorageInfo from '../components/storageInfo';
import { getWarehouses } from '../events/warehouses';
import { useState, useEffect } from 'react';
import { searchItems } from '../events/items';
function MainView() {
    const [warehouses, updateWarehouses] = useState([]);
    const [searchedItems, updateSearchedItems] = useState([]);
    useEffect(() => {
        getWarehouses().then(updateWarehouses);
    }, []);

    const handleSearch = async (event) => {
        event.preventDefault();
        const query = event.target.querySelector("input").value;
        const results = await searchItems(query);
        updateSearchedItems(results.items);
    };
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
                <form onSubmit={handleSearch}>
                    <SearchBar/>
                </form>
                {searchedItems.map((item, index) => (
                    <SearchedItem key={index} item={item} />
                ))}
            </div>
        </div>
    );
}
export default MainView