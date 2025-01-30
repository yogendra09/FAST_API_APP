import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../utils/axios';
import { useDispatch } from 'react-redux';
import { asyncCurrentUser } from '@/store/Actions/authAction';

const Callback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const getAccessToken = async(requestToken)=>{
             const {data} = await axios.get(`/callback?request_token=${requestToken}`);
             console.log(data.access_token);
             return data.access_token;
    }

    const executeCallback = async () => {
        try {
            const params = new URLSearchParams(location.search);
            const requestToken = params.get('request_token');
            localStorage.setItem('kite_token', requestToken);
           const access_token = await getAccessToken(requestToken);
            const { data } = await axios.post(`/save_access_token?access_token=${access_token}`, { access_token: access_token });
            console.log(data);
            navigate('/');
        }
        catch (error) {
            console.error('Error executing callback:', error);
            navigate('/login');
        }
    };
    useEffect(() => {
        dispatch(asyncCurrentUser());
        executeCallback();
    }, []);

    return (
        <div>
            <h1>Callback Page</h1>
        </div>
    );
};

export default Callback;