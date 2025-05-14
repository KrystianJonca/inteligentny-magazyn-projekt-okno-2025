import './searchedItem.css'

function SearchedItem() {
    return(
        <div className="searchedItemWrapper">
            <div className='searchedItem'>
                <h2 style={{marginLeft: "15px", width: "300px", fontWeight: 600}}>Drabiny</h2>
                <h2>120</h2>
                <img src='icons/arrowUp.svg' onClick={(e)=> {
                        if (e.target.style.transform != "rotate(180deg)") {
                            e.target.style.transform = "rotate(180deg)";
                            e.target.parentNode.parentNode.querySelector(".searchedItemDetails").style.height = "auto";
                            let height = e.target.parentNode.parentNode.querySelector(".searchedItemDetails").offsetHeight;
                            console.log(height);
                            e.target.parentNode.parentNode.style.height = `${height+30}px`;
                        } else {
                            e.target.style.transform = "rotate(0deg)";
                            e.target.parentNode.parentNode.querySelector(".searchedItemDetails").style.height = "0";
                            e.target.parentNode.parentNode.style.height = `84px`;
                        }
                    }}/>
            </div>
            <div className='searchedItemDetails'>
                <br></br>
                <div className='listedStorage'>
                    <img src='icons/crate.svg'/>
                    <h3 style={{width: '200px', marginLeft: '10px'}}>Magazyn Kopacz</h3>
                    <h3 style={{marginRight: '40px'}}>25</h3>
                    <img style={{height: '20px'}} src='icons/arrowLeft.svg'/>
                    <img style={{height: '20px', marginLeft: '10px'}} src='icons/arrowRight.svg'/>
                </div>
                <div className='listedStorage'>
                    <img src='icons/crate.svg'/>
                    <h3 style={{width: '200px', marginLeft: '10px'}}>Magazyn Kopacz</h3>
                    <h3 style={{marginRight: '40px'}}>25</h3>
                    <img style={{height: '20px'}} src='icons/arrowLeft.svg'/>
                    <img style={{height: '20px', marginLeft: '10px'}} src='icons/arrowRight.svg'/>
                </div>
                <div className='listedStorage'>
                    <img src='icons/crate.svg'/>
                    <h3 style={{width: '200px', marginLeft: '10px'}}>Magazyn Kopacz</h3>
                    <h3 style={{marginRight: '40px'}}>25</h3>
                    <img style={{height: '20px'}} src='icons/arrowLeft.svg'/>
                    <img style={{height: '20px', marginLeft: '10px'}} src='icons/arrowRight.svg'/>
                </div>
                <div className='listedStorage'>
                    <img src='icons/crate.svg'/>
                    <h3 style={{width: '200px', marginLeft: '10px'}}>Magazyn Kopacz</h3>
                    <h3 style={{marginRight: '40px'}}>25</h3>
                    <img style={{height: '20px'}} src='icons/arrowLeft.svg'/>
                    <img style={{height: '20px', marginLeft: '10px'}} src='icons/arrowRight.svg'/>
                </div>
            </div>
        </div>
    );
}
export default SearchedItem