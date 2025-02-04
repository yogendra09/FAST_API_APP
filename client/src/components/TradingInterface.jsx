import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { Switch } from "@/components/ui/switch"
import axios from "@/utils/axios";

const TradingInterface = ({ SelectedStock ,filter}) => {
    const [mode, setMode] = useState('buy'); // 'buy' or 'sell'
    // const [orderType, setOrderType] = useState('longterm');
    const [limitType, setLimitType] = useState('MARKET');
    const [orderQty, setorderQty] = useState(1);
    const [stockMode, setStockMode] = useState("nse"); // Default value is "nse"
    const [orderPrice, setorderPrice] = useState(SelectedStock?.last_price);
    const [variety, setVariety] = useState("regular");
    const [product, setProduct] = useState("CNC");
    const [isNFO, setisNFO] = useState(false)




    const getThemeColor = () => mode === 'buy' ? 'bg-blue-500' : 'bg-orange-500';
    const getButtonColor = () => mode === 'buy' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-orange-500 hover:bg-orange-600';

    const placeOrder = async () => {
        try {

            const URL = "/place_order";

            const requestBody = {
                tradingsymbol: SelectedStock.tradingsymbol,
                exchange: stockMode.toUpperCase(),
                transaction_type: mode.toUpperCase(),
                quantity: orderQty,
                price: Number(orderPrice),
                order_type: limitType.toUpperCase(),
                variety: variety,
                product: product,
            };

            console.log(requestBody);

            // const response = await axios.post(URL, requestBody, {
            //     headers: {
            //         'Authorization': `token ${import.meta.env.VITE_API_KEY}:${localStorage.getItem('kite_token')}`,
            //     }

            // });
            // console.log('Order placed successfully', response.data);
        } catch (error) {
            console.error('Error placing order', error.response ? error.response.data : error.message);
        }
    };

    useEffect(() => {
        console.log(filter);  
        if(filter=="CE" || filter=="PE" || filter=="FUT"){
            setProduct("MIS")
            setisNFO(true)
            setStockMode("nfo")
        }else{
            setProduct("CNC")
            setisNFO(false)
            setStockMode("nse")
        }
    }, [filter]);

    return (
        <Card className="w-full max-w-xl">
            <div className={`${getThemeColor()} p-4 text-white`}>
                <div className="flex justify-between items-center">
                    <div className="text-xl font-bold">
                        {mode === 'buy' ? 'Buy' : 'Sell'} {SelectedStock?.tradingsymbol}
                    </div>
                    <div className="flex items-center gap-4">
                        <RadioGroup value={stockMode} onValueChange={setStockMode} className="flex items-center gap-4">
                            {
                                !isNFO ?
                            <>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="bse" id="bse" className="" />
                                <label htmlFor="bse" className="flex items-center gap-2 cursor-pointer">
                                    <span className="opacity-80">BSE</span>
                                    <span>₹{mode === "buy" ? SelectedStock?.last_price : SelectedStock?.last_price}</span>
                                </label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="nse" id="nse" className="" />
                                <label htmlFor="nse" className="flex items-center gap-2 cursor-pointer">
                                    <span className="opacity-80">NSE</span>
                                    <span>₹{mode === "buy" ? SelectedStock?.last_price : SelectedStock?.last_price}</span>
                                </label>
                            </div>
                            </>
                            :
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="nfo" id="nfo" className="" />
                                <label htmlFor="nfo" className="flex items-center gap-2 cursor-pointer">
                                    <span className="opacity-80">NFO</span>
                                    <span>₹{mode === "buy" ? SelectedStock?.last_price : SelectedStock?.last_price}</span>
                                </label>
                            </div>
                            }
                        </RadioGroup>
                    </div>
                    <div>
                        <Switch checked={mode == 'sell'} onCheckedChange={(checked) => setMode(checked ? "sell" : "buy")} />
                    </div>
                </div>
            </div>

            <CardContent className="p-4">
                <Tabs defaultValue="regular" className="mb-4" onValueChange={(value) => setVariety(value)}>
                    <TabsList className="grid grid-cols-6" >
                        <TabsTrigger value="quick">Quick</TabsTrigger>
                        <TabsTrigger value="regular">Regular</TabsTrigger>
                        <TabsTrigger value="amo">AMO</TabsTrigger>

                    </TabsList>
                </Tabs>

                <div className="flex justify-between items-center mb-4">
                    <RadioGroup value={product} className="flex gap-8" onValueChange={(value) => setProduct(value)}>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="MIS" id="intraday" />
                            <label htmlFor="intraday" className="text-sm">
                                Intraday <span className="text-gray-400">MIS</span>
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="CNC" id="longterm" />
                            <label htmlFor="longterm" className="text-sm">
                                Longterm <span className="text-gray-400">CNC</span>
                            </label>
                        </div>
                    </RadioGroup>
                    <Button variant="ghost" className="text-blue-500">
                        Advanced <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-sm text-gray-500 mb-1 block">Qty.</label>
                        <Input type="number" value={orderQty} onChange={(e) => setorderQty(e.target.value)} min={1} />
                    </div>
                    <div>
                        <label className="text-sm text-gray-500 mb-1 block">Price</label>
                        <Input disabled={limitType === 'MARKET' ? true : false} type="number" value={mode === 'buy' ? orderPrice : orderPrice} onChange={(e) => setorderPrice(e.target.value)} min={mode === 'buy' ? SelectedStock?.last_price : SelectedStock?.last_price} />
                    </div>
                </div>

                <RadioGroup value={limitType} className="flex gap-4 mb-4" onValueChange={(value) => setLimitType(value)}>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="MARKET" id="market" />
                        <label htmlFor="market">Market</label>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="LIMIT" id="limit" />
                        <label htmlFor="limit">Limit</label>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="SL" id="sl" />
                        <label htmlFor="sl">SL</label>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="SL-M" id="sl-m" />
                        <label htmlFor="sl-m">SL-M</label>
                    </div>
                </RadioGroup>

                {/* <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Stoploss</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Target</span>
                        </label>
                    </div>
                    <Button variant="ghost" className="text-blue-500 text-sm">
                        Learn more
                    </Button>
                </div> */}

                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <span>Amount ₹{mode === 'buy' ? SelectedStock.last_price : SelectedStock.last_price}</span>
                        <span className="text-gray-500">
                            Charges ₹{mode === 'buy' ? '0.23' : '2.41'}
                        </span>
                        <RefreshCw className="h-4 w-4 text-blue-500" />
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button
                        className={`${getButtonColor()} text-white flex-1`}
                        onClick={placeOrder}
                    >
                        {mode === 'buy' ? 'Buy' : 'Sell'}
                    </Button>
                    <Button variant="outline" className="flex-1">
                        Cancel
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default TradingInterface;