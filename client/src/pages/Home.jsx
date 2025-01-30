import { Input } from "@/components/ui/input";
import axios from "../utils/axios";
import { useEffect, useState } from "react";
import StockTile from "@/components/StockTile";
import TradingInterface from "@/components/TradingInterface";



const Home = () => {
  const [stockList, setStockList] = useState([]);
  const [SearchStock, setSearchStock] = useState("");
  const [SelectedStock, setSelectedStock] = useState(null);

  // Fetch stock list from API
  const fetchStockList = async () => {
    try {
      const response = await axios.get(`/stocklist?search=${SearchStock.toUpperCase()|| "A"}`);
      console.log("Stock list:", response.data);
      setStockList(response.data);
      
    } catch (error) {
      console.error("Error fetching stock list:", error);
    }
  };

  useEffect(() => {
    fetchStockList();
  }, [SearchStock]);

  return (
    <div className="flex h-screen w-full">
      {/* Left Section - 30% */}
      <div className="w-1/3  p-6 flex flex-col justify-start items-start">
        <Input
          type="text"
          placeholder="Search..."
          className="w-full"
          value={SearchStock}
          onChange={(e) => setSearchStock(e.target.value)}
        />
        <div className=" mt-4 w-full relative ">
          {stockList.map((stock) => {
            return <StockTile key={stock.id} stock={stock} setSelectedStock={setSelectedStock} />
})}
        </div>
      </div>

      {/* Right Section - 70% (Blank) */}
      <div className="w-2/3">
      <div className="w-full h-full flex items-center justify-center relative">
     { SelectedStock &&  <TradingInterface SelectedStock={SelectedStock} />}
      </div>
      </div>
    </div>
  )
}

export default Home