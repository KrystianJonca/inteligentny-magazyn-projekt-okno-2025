import './searchBar.css'

function SearchBar() {
    return (
        <div className="searchBarWrapper">
            <img src='icons/search.svg'/>
            <input placeholder='Search' type='text'/>
        </div>
    );
}
export default SearchBar