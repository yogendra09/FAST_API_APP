import { Route, Routes } from "react-router-dom"
import Signin from "./pages/Signin"
import Signup from "./pages/Signup"
import NavBar from "./components/NavBar"
import PrivateRoute from "./components/PrivateRoute"
import ForgetPassword from "./pages/ForgetPassword"
import Home from "./pages/Home"
import Callback from "./pages/Callback"
import OrderList from "./pages/OrderList"


const App = () => {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="" element={<PrivateRoute />} >
          <Route path="/" element={<Home />} />
          <Route path="/orderlist" element={<OrderList />} />
        </Route>
        <Route path="/broker-login" element={<Callback />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
      </Routes>
    </>
  )
}

export default App