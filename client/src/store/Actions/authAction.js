import axios from "@/utils/axios";
import { addUser, removeUser } from "../Reducers/authReducer";

export const asyncCurrentUser = () => async (dispatch) => {
    try {
      const { data } = await axios.post("/currentuser");
      console.log(data);    
        dispatch(addUser(data));  
        // dispatch(removeUser());
        // localStorage.removeItem("token");       
    } catch (error) {
      console.log(error?.response?.data?.message || error);
    }
  };


  export const asyncUserRegister = (newUser) => async (dispatch) => { 
    try {
      const { data } = await axios.post("/signup", newUser); 
      localStorage.setItem("token", data.access_token);
      dispatch(asyncCurrentUser());
    } catch (error) {
      console.log(error?.response?.data?.message || error);
    }
  };
  
export const asyncUserLogin = (user) => async (dispatch) => {
    try {
      const  {data}  = await axios.post(`/token?email=${user.email}&password=${user.password}`);    
      console.log(data)
      localStorage.setItem('token',data.access_token);
      dispatch(asyncCurrentUser());      
    } catch (error) {
      console.log(error?.response?.data?.message || error);
    }
  };

  export const asyncUserLogout = () => async (dispatch) => {
    try {
      const  {data}  = await axios.post(`/logout`);    
      console.log(data)
      localStorage.removeItem('token');
      dispatch(removeUser());  
    } catch (error) {
      console.log(error?.response?.data?.message || error);
    }
  };

  export const asyncUserForgetPassword = (email) => async () => {
    try {
      const  {data}  = await axios.post(`/forget-password?email=${email}`);  
      localStorage.setItem('reset_token',data.access_token);  

    } catch (error) {
      console.log(error?.response?.data?.message || error);
    }
  };

  export const asyncUserResetPassword = (payload) => async () => {
    try {
      console.log(payload);
      const  {data}  = await axios.post(`/reset-password?token=${localStorage.getItem('reset_token')}&otp=${payload.otp}&new_password=${payload.new_password}`,payload,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem('reset_token')}`,
        },
      });    
      console.log(data)
      localStorage.removeItem('reset_token');
    } catch (error) {
      console.log(error?.response?.data?.message || error);
    }
  };

  export const asyncKiteLogin = async function (token) {
    try {
      const  {data}  = await axios.get(`/login`);    
      console.log(data)
      // localStorage.setItem('kite_token',data.access_token);
    } catch (error) {
      console.log(error?.response?.data?.message || error);
    }
  };

