import { Link, NavLink, useNavigate } from "react-router-dom"
import { ModeToggle } from "./ModeToggle"
import { useDispatch, useSelector } from "react-redux"
import { asyncUserLogout } from "@/store/Actions/authAction";
import axios from "../utils/axios";


const NavBar = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.authReducer);
  const navigate = useNavigate();
  const handleKiteLogin = async () => {

    const { data } = await axios.get('/login');
    console.log(data.login_url);

    if (data.login_url) {
      window.location.href = data.login_url; // Redirect user
    }


  }

  return (
    <div className="flex justify-between items-center p-4 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
      <ul className="flex gap-4">
        <NavLink to='/'>Home</NavLink>


      </ul>

      <div className="flex items-center gap-4 ">
        <button onClick={handleKiteLogin}>
          Trading Account Login
        </button>

        {
          isAuthenticated ?
            <>
              <button onClick={() => {
                dispatch(asyncUserLogout());
              }}>logout</button>
            </>
            :
            <>
              <NavLink to='/signin'>signin</NavLink>
              <NavLink to='/signup'>signup</NavLink>
            </>
        }


        <ModeToggle />
      </div>

    </div>
  )
}

export default NavBar