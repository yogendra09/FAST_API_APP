import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom"; // Changed import to correctly use React Router's Link
import { useDispatch } from "react-redux";
import { asyncUserForgetPassword, asyncUserResetPassword } from "@/store/Actions/authAction"; // Added reset password action

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
  });
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [disableButton, setDisableButton] = useState(true);
  const dispatch = useDispatch();

  const validateFormData = (data) => {
    const errors = {};

    if (!data.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Email is invalid.";
    }

    if (isResetPassword) {
      if (!data.otp.trim()) {
        errors.otp = "OTP is required.";
      }
      if (!data.password.trim()) {
        errors.password = "Password is required.";
      }
    }

    setFormErrors(errors);
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isResetPassword) {
      dispatch(asyncUserForgetPassword(email));
      setIsResetPassword(true);
    } else {
      const errors = validateFormData(formData);
      if (Object.keys(errors).length === 0) {
        dispatch(asyncUserResetPassword({otp:Number(formData.otp),new_password:formData.password}));
        setIsResetPassword(false);
        setFormData({ email: "", password: "", otp: "" });
      }
    }
  };

  useEffect(() => {
    // Enable the button only if all required fields are filled and valid
    const isFormValid =
      email.trim() !== "" &&
      Object.keys(validateFormData({ email })).length === 0;

    setDisableButton(!isFormValid);
  }, [email]);

  useEffect(() => {
    if (isResetPassword) {
      const isFormValid =
        formData.otp.trim() !== "" &&
        formData.password.trim() !== "" &&
        Object.keys(validateFormData(formData)).length === 0;
  
      setDisableButton(!isFormValid);
    }
  }, [formData.otp, formData.password, formData.email, isResetPassword]); // Include otp, password, and email dependencies
  

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isResetPassword ? "Reset Password" : "Forgot Password"}</CardTitle>
          <CardDescription>
            {isResetPassword
              ? "Enter the OTP and new password to reset your password."
              : "Enter your email address, and we'll send you a reset link."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isResetPassword && (
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 flex justify-between"
                >
                  Email Address *
                  {formErrors["email"] && (
                    <span className="text-red-500">{formErrors["email"]}</span>
                  )}
                </label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFormData({ ...formData, email: e.target.value });
                  }}
                  placeholder="you@example.com"
                  className="mt-1"
                />
              </div>
            )}

            {isResetPassword && (
              <>
                <div>
                  <label
                    htmlFor="otp"
                    className="text-sm font-medium text-gray-700 flex justify-between"
                  >
                    OTP *
                    {formErrors["otp"] && (
                      <span className="text-red-500">{formErrors["otp"]}</span>
                    )}
                  </label>
                  <Input
                    type="number"
                    id="otp"
                    value={formData.otp}
                    onChange={(e) =>
                      setFormData({ ...formData, otp: e.target.value })
                    }
                    placeholder="Enter OTP"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700 flex justify-between"
                  >
                    New Password *
                    {formErrors["password"] && (
                      <span className="text-red-500">{formErrors["password"]}</span>
                    )}
                  </label>
                  <Input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Enter new password"
                    className="mt-1"
                  />
                </div>
              </>
            )}

            <Button type="submit" disabled={disableButton} className="w-full">
              {isResetPassword ? "Reset Password" : "Send Reset Link"}
            </Button>

            <div className="mt-4 text-center">
              <Link to="/signin" className="text-sm text-blue-500 hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
