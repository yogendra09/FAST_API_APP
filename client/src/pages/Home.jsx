import { Input } from "@/components/ui/input";
import axios from "../utils/axios";
import { useEffect, useState } from "react";
import StockTile from "@/components/StockTile";
import TradingInterface from "@/components/TradingInterface";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";



const Home = () => {
  const [stockList, setStockList] = useState([]);
  const [SearchStock, setSearchStock] = useState("");
  const [SelectedStock, setSelectedStock] = useState(null);
  const [filter, setFilter] = useState("EQ");
  const filterValues = ["EQ", "CE", "PE","FUT"];
  // Fetch stock list from API
  const fetchStockList = async () => {



    try {
      const response = await axios.get(`/stocklist?search=${SearchStock.toUpperCase() || "A"}&filter=${filter}`);
      console.log("Stock list:", response.data);
      setStockList(response.data);

    } catch (error) {
      console.error("Error fetching stock list:", error);
    }
  };

  useEffect(() => {
    fetchStockList();
  }, [SearchStock,filter]);

  return (
    <div className="flex h-screen w-full">
      {/* Left Section - 30% */}
      <div className="w-1/3  p-6 flex flex-col justify-start items-start">
        <div className="flex items-center gap-4 w-full ">
          <Input
            type="text"
            placeholder="Search..."
            className="w-full"
            value={SearchStock}
            onChange={(e) => setSearchStock(e.target.value)}
          />
          <div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {filterValues.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          </div>
        </div>
        <div className=" mt-4 w-full relative ">
          {stockList.map((stock) => {
            return <StockTile key={stock.id} stock={stock} setSelectedStock={setSelectedStock} filter={filter} />
          })}
        </div>
      </div>

      {/* Right Section - 70% (Blank) */}
      <div className="w-2/3">
        <div className="w-full h-full flex items-center justify-center relative">
          {SelectedStock && <TradingInterface SelectedStock={SelectedStock} filter={filter} />}
        </div>
      </div>
    </div>
  )
}

export default Home