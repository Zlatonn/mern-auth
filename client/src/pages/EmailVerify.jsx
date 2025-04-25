import React, { useContext, useEffect, useRef } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../context/AppContext";

const EmailVerify = () => {
  // Import navigate
  const navigate = useNavigate();

  // Import global data from AppContext
  const { backendUrl, isLoggedin, userData, getUserData } = useContext(AppContext);

  // Refs OTP input
  const inputRefs = useRef([]);

  // To handle input OTP input
  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  // To handle key down OTP input
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // To handle paste OTP input
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  // To handler submit
  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault(); // Prevent browser reloadin page when submit

      // Get OTP array from refs && convert to string
      const otpArray = inputRefs.current.map((e) => e.value);
      const otp = otpArray.join("");

      // Allow axios send request with credentials (cookies)
      axios.defaults.withCredentials = true;

      // Send request
      const { data } = await axios.post(backendUrl + "/api/auth/verify-account", { otp });

      /**  If verify success then 
        - alert success toast
        - get user data 
        - navigate to home page */
      if (data.success) {
        toast.success(data.message);
        getUserData();
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Auto redirect to home when user manual input url /email-verity
  useEffect(() => {
    isLoggedin && userData && userData.isAccountVerified && navigate("/");
  }, [isLoggedin, userData, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        src={assets.logo}
        alt=""
        onClick={() => navigate("/")}
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />
      <form onSubmit={onSubmitHandler} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
        <h1 className="text-white text-2xl font-semibold text-center mb-4">Email Verify OTP</h1>
        <p className="text-center mb-6 text-indigo-300">Enter the 6-digits code sent to your email id.</p>
        <div className="flex justify-between mb-8" onPaste={handlePaste}>
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                key={index}
                ref={(e) => (inputRefs.current[index] = e)}
                type="text"
                maxLength="1"
                required
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 bg-[#333A5C] text-white text-center text-lg rounded-md"
              />
            ))}
        </div>
        <button className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full">Verify email</button>
      </form>
    </div>
  );
};

export default EmailVerify;
