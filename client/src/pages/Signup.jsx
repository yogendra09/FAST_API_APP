import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { asyncUserRegister } from "@/store/Actions/authAction";

const Signup = () => {
    const [FormData, setFormData] = useState({
        name: "",
        age: "",
        email: "",
        phone: "",
        password: "",
        confirm_password: "",
    });
    const [FormErrors, setFormErrors] = useState({});
    const [disableButton, setdisableButton] = useState(true);
    const {isAuthenticated} = useSelector(state => state.authReducer);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated,dispatch]);

    const validateFormData = (data) => {
        const errors = {};
        if (!data.name.trim()) errors.name = "Name is required.";
        if (!data.age.trim()) {
            errors.age = "Age is required.";
        } else if (Number(data.age) < 0) {
            errors.age = "Enter a valid age.";
        }
        if (!data.email.trim()) {
            errors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.email = "Email is invalid.";
        }
        if (!data.phone.trim()) {
            errors.phone = "Phone number is required.";
        } else if (!/^\d{10}$/.test(data.phone)) {
            errors.phone = "Phone number must be 10 digits.";
        }
        if (!data.password.trim()) errors.password = "Password is required.";
        if (!data.confirm_password.trim()) {
            errors.confirm_password = "Confirm password is required.";
        } else if (data.password !== data.confirm_password) {
            errors.confirm_password = "Passwords do not match.";
        }
        setFormErrors(errors);
        return errors;
    };

    const changeHandler = (e) => {
        const { name, value } = e.target;

        // Update FormData
        const updatedFormData = { ...FormData, [name]: value };
        setFormData(updatedFormData);

        // Check if all fields are filled
        const allFieldsFilled = Object.values(updatedFormData).every(
            (fieldValue) => fieldValue.trim() !== ""
        );
        setdisableButton(!allFieldsFilled);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errors = validateFormData(FormData);

        if (Object.keys(errors).length === 0) {
            resetForm();
            alert("Feedback submitted successfully");
        } else {
            console.log("Validation errors:", errors);
        }

        dispatch(asyncUserRegister(FormData));
    };

    const resetForm = () => {
        setFormData({
            name: "",
            age: "",
            email: "",
            phone: "",
            password: "",
            confirm_password: "",
        });
    };

    return (
        <div className="flex mt-10 lg:h-[80vh] items-center justify-center">
            <Card className="w-full max-w-md shadow-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">Sign up</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {[
                            { label: "Name", name: "name" },
                            { label: "Phone Number", name: "phone", type: "number" },
                            { label: "Age", name: "age", type: "number" },
                            { label: "Email", name: "email", type: "text" },
                            { label: "Password", name: "password", type: "text" },
                            { label: "Confirm Password", name: "confirm_password", type: "password" },
                        ].map(({ label, name, type = "text" }) => (
                            <div key={name} className="relative py-3">
                                <label className="text-sm flex gap-2 absolute -top-4 left-0">
                                    {label} *
                                    {FormErrors[name] && (
                                        <p className="text-red-500">{FormErrors[name]}</p>
                                    )}
                                </label>
                                <Input
                                    name={name}
                                    value={FormData[name]}
                                    onChange={changeHandler}
                                    type={type}
                                    placeholder={`Enter ${label.toLowerCase()}`}
                                    className="outline-none"
                                />
                            </div>
                        ))}
                        <Button
                            disabled={disableButton}
                            type="submit"
                            className="w-full bg-gray-900 text-white hover:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            Sign Up
                        </Button>
                        <div>
                            <p className="text-sm text-gray-500">
                                Already have an account?{" "}
                                <Link to="/signin" className="text-blue-500 hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Signup;
