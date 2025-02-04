import { useEffect, useState } from 'react';
import axios from '../utils/axios'

const Profile = () => {

  const [holdingList, setholdingList] = useState([])

  const fetHoldings = async()=>{
    const { data} = await axios.get("/kite/holdings");
    setholdingList(data.data);
  }

  useEffect(() => {
    fetHoldings();
  }, [])
    
  return (
    <div>
        {
          holdingList.length > 0 &&
          holdingList.map(holding => (
            <div key={holding.instrument_token}>
              <p>{holding.tradingsymbol}</p>
            </div>
          ))
        }

    </div>
  )
}

export default Profile