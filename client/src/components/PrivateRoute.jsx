import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { asyncCurrentUser } from "@/store/Actions/authAction";
import { useDispatch, useSelector } from "react-redux";

const PrivateRoute = () => {
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state) => state.authReducer);

    useEffect(() => {
        dispatch(asyncCurrentUser());
    }, [dispatch, isAuthenticated]);

    
    return isAuthenticated ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default PrivateRoute;