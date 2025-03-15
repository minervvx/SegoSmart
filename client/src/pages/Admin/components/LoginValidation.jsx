import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LoginValidation() {
  let navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    async function fetchingData() {
      const token = localStorage.getItem("admin");
      if (token) {
        const admin = await axios.get(
          `${apiUrl}/Admin/VerifyToken`,
          {
            headers: {
              Authorization: token,
            },
          }
        );

        if (!admin.data.valid) {
          localStorage.removeItem("admin");
          navigate("/Login");
        }
      } else {
        navigate("/Login");
      }
    }
    fetchingData();
  }, [navigate,apiUrl]);
  return <div></div>;
}

export default LoginValidation;
