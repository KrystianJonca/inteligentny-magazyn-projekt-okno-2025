import './storageInfo.css'

function StorageInfo() {
    return(
        <div className="storageInfo">
            <h1 onClick={()=> {
                document.querySelector('.storageInfo').style.left = '-800px';
            }}>+</h1>
            <div className='generalInfo'>
                <div>
                    <img src='icons/label.svg'/>
                    <h2 id='warehouse_name'>Magazyn Zabórek</h2>
                </div>
                <div>
                    <img src='icons/ruler.svg'/>
                    <h2 id='warehouse_footage'>1200m2</h2>
                </div>
                <div>
                    <img src='icons/person.svg'/>
                    <h2 id='warehouse_manager'>Tadeusz Bąkowski</h2>
                </div>
                <div>
                    <img src='icons/telephone.svg'/>
                    <h2 id='warehouse_phone'>Magazyn Zabórek</h2>
                </div>
            </div>
            <div style={{height: "360px", border: "2px solid #90e5d8", width: 0, display: "inline-block", marginTop: "103px"}}></div>
            <div className='locationInfo'>
                <img src='icons/dummy.svg'/>
                <br></br>
                <img style={{marginTop: "20px"}} src='icons/location.svg'/>
                <h2 id='warehouse_address'>ul. Mariańskiego 12<br/>02-332 Zaborówek
                </h2>
            </div>
        </div>
    );
}

export default StorageInfo