import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  axios.defaults.withCredentials=true;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
const getAuthState =async ()=>{
    try{
        const {data} =await axios.get(backendUrl+ '/api/auth/is-auth')
        if(data.success){
            setIsLoggedIn(true);
            getUserData();
            
        }
    }
    catch(error){
        toast.error(error.message);
    }

}
  const getUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      const { data } = await axios.get(`${backendUrl}/api/user/data`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUserData(data.userData);
        setIsLoggedIn(true);
      } else {
        toast.error(data.message);
        setIsLoggedIn(false);
      }
    } catch (error) {
      toast.error(error.message);
         setIsLoggedIn(false);
    }
  };
  useEffect(()=>{
    getAuthState();
  },[])

  const value = {
    backendUrl,
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
    getUserData,
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContext;
