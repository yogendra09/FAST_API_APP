import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Eye, EyeClosed } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { asyncUserLogin } from "@/store/Actions/authAction";

const Signin = () => {
    const [FormData, setFormData] = useState({
        email: '',
        password: ''
    });
    const {isAuthenticated} = useSelector(state => state.authReducer);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [FormErrors, setFormErrors] = useState({});
    const [disableButton, setDisableButton] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated,dispatch]);

    const validateFormData = (data) => {
        const errors = {};

        if (!data.password.trim()) {
            errors.password = "Password is required.";
        }

        if (!data.email.trim()) {
            errors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.email = "Email is invalid.";
        }

        setFormErrors(errors);
        return errors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errors = validateFormData(FormData);
        console.log(FormData);

        if (Object.keys(errors).length === 0) {
            resetForm();
            console.log("Feedback submitted successfully");
        } else {
            console.log("Validation errors:", errors);
        }

        dispatch(asyncUserLogin(FormData));
    };

    const changeHandler = (e) => {
        setFormData({ ...FormData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setFormData({
            password: "",
            email: "",
        });
        setDisableButton(true);
    };

    useEffect(() => {
        // Enable the button only if all fields are filled and valid
        const isFormValid =
            FormData.email.trim() !== "" &&
            FormData.password.trim() !== "" &&
            Object.keys(validateFormData(FormData)).length === 0;

        setDisableButton(!isFormValid);
    }, [FormData]);

    return (
        <div className="flex mt-10 lg:h-[80vh] items-center justify-center">
            <Card className="w-full max-w-md shadow-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">Sign In</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="relative py-3">
                            <label className="text-sm flex gap-2 absolute -top-4 left-0">
                                Email *
                                {FormErrors['email'] && (
                                    <p className="text-red-500">{FormErrors['email']}</p>
                                )}
                            </label>
                            <Input
                                name="email"
                                value={FormData.email}
                                onChange={changeHandler}
                                type="text"
                                placeholder="Enter Email"
                                className="outline-none"
                            />
                        </div>

                        <div className="relative py-3">
                            <label className="text-sm flex gap-2 absolute -top-4 left-0">
                                Password *
                                {FormErrors['password'] && (
                                    <p className="text-red-500">{FormErrors['password']}</p>
                                )}
                            </label>
                            <div className="flex items-center relative">
                                <Input
                                    name="password"
                                    value={FormData.password}
                                    onChange={changeHandler}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter Password"
                                    className="outline-none"
                                />
                                <span
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 cursor-pointer"
                                >
                                    {showPassword ? <Eye /> : <EyeClosed />}
                                </span>
                            </div>
                        </div>
                        <Button
                            disabled={disableButton}
                            type="submit"
                            className="w-full bg-gray-900 text-white hover:bg-gray-600"
                        >
                            Sign In
                        </Button>
                        <div className="flex justify-between">
                            <p className="text-sm text-gray-500">
                                Don't have an account?{" "}
                                <Link to="/signup" className="text-blue-500 hover:underline">
                                    Sign Up
                                </Link>
                            </p>
                            <p className="text-sm text-gray-500">
                                <Link to="/forgot-password" className="hover:text-blue-500">
                                    Forget Password?
                                </Link>
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Signin;
