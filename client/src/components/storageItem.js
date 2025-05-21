import './StorageItem.css';

function StorageItem() {
    return (
            <div className='storageWrapper'>
                <div className="storage">
                    <img src='icons/crate.svg'/>
                    <h1>Magazyn Woronicza</h1>
                    <img src='icons/arrowUp.svg' onClick={(e)=> {
                        if (e.target.style.transform != "rotate(180deg)") {
                            e.target.style.transform = "rotate(180deg)";
                            e.target.parentNode.parentNode.querySelector(".storageDetails").style.height = "auto";
                            let height = e.target.parentNode.parentNode.querySelector(".storageDetails").offsetHeight;
                            e.target.parentNode.parentNode.style.height = `${height+50}px`;
                        } else {
                            e.target.style.transform = "rotate(0deg)";
                            e.target.parentNode.parentNode.querySelector(".storageDetails").style.height = "0";
                            e.target.parentNode.parentNode.style.height = `150px`;
                        }
                    }}/>
                </div>
                <div className='storageDetails'>
                    <br></br>
                    <div className='favouritedItem'>
                        <h2>Artykuły biurowe</h2>
                        <input type="text"/>
                        <img src='icons/arrowRight.svg'/>
                        <img style={{marginRight: "10px"}} src='icons/arrowLeft.svg'/>
                    </div>
                    <div className='favouritedItem'>
                        <h2>Artykuły biurowe</h2>
                        <input type="text"/>
                        <img src='icons/arrowRight.svg'/>
                        <img style={{marginRight: "10px"}} src='icons/arrowLeft.svg'/>
                    </div>
                    <div className='favouritedItem'>
                        <h2>Artykuły biurowe</h2>
                        <input type="text"/>
                        <img src='icons/arrowRight.svg'/>
                        <img style={{marginRight: "10px"}} src='icons/arrowLeft.svg'/>
                    </div>
                    <div className='favouritedItem'>
                        <h2>Artykuły biurowe</h2>
                        <input type="text"/>
                        <img src='icons/arrowRight.svg'/>
                        <img style={{marginRight: "10px"}} src='icons/arrowLeft.svg'/>
                    </div>
                    <br></br>
                    <table>
                        <tr>
                            <td><h2>+</h2></td>
                            <td><button onClick={()=> {
                                document.querySelector('.storageInfo').style.left = '361px';
                            }}>info</button></td>
                        </tr>
                    </table>
                </div>
            </div>
    );
}

export default StorageItem
