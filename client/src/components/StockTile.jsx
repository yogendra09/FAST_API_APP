import { Button } from "@/components/ui/button"; // Assuming you're using ShadCN's Button component
import { FaTrash, FaChartLine, FaEllipsisH } from "react-icons/fa"; // Using React icons

export default function StockTile({ stock, setSelectedStock }) {
    return (
        <div onClick={() => setSelectedStock(stock)} className="w-full flex items-center justify-between  border  p-4">
            {/* Stock Name and Event */}
            <div className="flex flex-col">
                <span className="text-green-500 font-semibold text-sm">{stock.name}</span>
                <span className="text-xs text-blue-500">{stock.segment}</span>
            </div>

            <div className=" flex gap-4 items-end">
                <span className="text-gray-600">{stock.last_price}</span>
                <span className="text-green-500">{stock.instrument_type}</span>
                <span className="text-green-500 flex items-center">
                    <FaChartLine size={14} className="mr-1" /> {stock.segment}
                </span>
            </div>

            {/* <div className="flex space-x-2">
                <Button variant="primary" className="bg-blue-500 text-white">
                    B
                </Button>
                <Button variant="secondary" className="bg-orange-500 text-white">
                    S
                </Button>
                <button className="text-gray-600 hover:text-gray-800">
                    <FaChartLine size={20} />
                </button>
                <button className="text-gray-600 hover:text-gray-800">
                    <FaTrash size={20} />
                </button>
                <button className="text-gray-600 hover:text-gray-800">
                    <FaEllipsisH size={20} />
                </button>
            </div> */}
        </div>
    );
}
