import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  // Import navigate
  const navigate = useNavigate();

  // Import global data from AppContext
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContext);

  // Create state
  const [state, setState] = useState("Sign Up");

  // Create form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // To handler submit
  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault(); // Prevent browser reloadin page when submit

      // If in sign up state will use register end point
      if (state === "Sign Up") {
        // Send request
        const { data } = await axios.post(backendUrl + "/api/auth/register", { name, email, password });

        /**  If register success then 
        - set isLoggedin state to true 
        - get user data 
        - navigate to home page */
        if (data.success) {
          setIsLoggedin(true);
          getUserData();
          navigate("/");
        } else {
          toast.error(data.message);
        }
        // If in other state will use login end point
      } else {
        // Send request
        const { data } = await axios.post(backendUrl + "/api/auth/login", { email, password });

        /**  If login success then 
        - set isLoggedin state to true 
        - get user data 
        - navigate to home page */
        if (data.success) {
          setIsLoggedin(true);
          getUserData();
          navigate("/");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        src={assets.logo}
        alt=""
        onClick={() => navigate("/")}
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">{state === "Sign Up" ? "Create Account" : "Login"}</h2>

        <p className="text-center text-sm mb-6">{state === "Sign Up" ? "Create your account" : "Login your account!"}</p>

        <form onSubmit={onSubmitHandler}>
          {state === "Sign Up" && (
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.person_icon} alt="" />
              <input
                type="text"
                placeholder="Full Name"
                required
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="bg-transparent outline-none"
              />
            </div>
          )}

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="" />
            <input
              type="email"
              placeholder="Email Id"
              required
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="bg-transparent outline-none"
            />
          </div>

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="" />
            <input
              type="password"
              placeholder="Password"
              required
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="bg-transparent outline-none"
            />
          </div>

          {state === "Login" && (
            <p onClick={() => navigate("/reset-password")} className="mb-4 text-indigo-500 cursor-pointer">
              Forgot Password?
            </p>
          )}

          <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium">
            {state}
          </button>
        </form>

        {state === "Sign Up" ? (
          <p className="text-gray-400 text-center text-xs mt-4">
            Already have an account?{" "}
            <span onClick={() => setState("Login")} className="text-blue-400 cursor-pointer underline">
              Login here
            </span>
          </p>
        ) : (
          <p className="text-gray-400 text-center text-xs mt-4">
            Don't have an account?{" "}
            <span onClick={() => setState("Sign Up")} className="text-blue-400 cursor-pointer underline">
              Sign up
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
