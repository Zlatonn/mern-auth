import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  // Import navigate
  const navigate = useNavigate();

  // Import global data from AppContext
  const { userData, backendUrl, setUserData, setIsLoggedin } = useContext(AppContext);

  // To send verification OTP
  const sendVerificationOtp = async () => {
    try {
      // Allow axios send request with credentials (cookies)
      axios.defaults.withCredentials = true;

      // Send request
      const { data } = await axios.post(backendUrl + "/api/auth/send-verify-otp");

      // If send OTP to email complete then navigate to email-verify page
      if (data.success) {
        navigate("/email-verify");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // To logout
  const logout = async () => {
    try {
      // Send request
      const { data } = await axios.post(backendUrl + "/api/auth/logout");

      /**  If logout success then 
      - set isLoggedin state to true 
      - clear user data 
      - navigate to home page */
      data.success && setIsLoggedin(true);
      data.success && setUserData("");
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0">
      <img src={assets.logo} alt="" className="w-28 sm:w-32" />

      {userData ? (
        <div className="w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group">
          {userData.name[0].toUpperCase()}
          <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10">
            <ul className="list-none m-0 p-2 bg-gray-100 text-sm">
              {!userData.isAccountVerified && (
                <li onClick={sendVerificationOtp} className="py-1 px-2 hover:bg-gray-200 cursor-pointer">
                  Verify email
                </li>
              )}
              <li onClick={logout} className="py-1 px-2 hover:bg-gray-200 cursor-pointer pr-10">
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all"
          onClick={() => navigate("/login")}
        >
          Login
          <img src={assets.arrow_icon} alt="" />
        </button>
      )}
    </div>
  );
};

export default Navbar;
