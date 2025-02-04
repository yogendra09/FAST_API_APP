import { FaChartLine } from 'react-icons/fa';
import axios from '../utils/axios';
import { useEffect, useState } from 'react'

const OrderList = () => {
  const [orderList, setOrderList] = useState([])

  const getAllOrders = async () => {

    const { data } = await axios.get('/kite/orders')

    if(data.status == 'error') {
      return alert("Error fetching orders");
     
    }
    setOrderList(data.data);

  }

  useEffect(() => {
    getAllOrders()
  }, [])
  return (
    <div className='p-4 '>
      {
        orderList?.length > 0 &&
        orderList?.map((stock,index) => {
          return (
        <>
            <div key={index} className="w-1/4 flex items-center justify-between  border  p-4 ">
              <div className="flex flex-col">
                <span className="text-green-500 font-semibold text-sm">{stock.tradingsymbol}</span>
                <span className="text-xs text-blue-500">{stock.segment}</span>
              </div>

              <div className=" flex gap-4 items-end">
                <span className={stock.transaction_type === "BUY" ? "text-blue-500" : "text-red-500"}>{stock.transaction_type}</span>
                <span className="text-green-500">{stock.quantity}</span>
                <span className="text-green-500 flex items-center">
                  <FaChartLine size={14} className="mr-1" /> {stock.exchange}
                </span>
              </div>
            </div>
        </>
          )
        })
      }
    </div>
  )
}

export default OrderList