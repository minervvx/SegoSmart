import React, { useEffect, useState } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import AOS from "aos";
import "aos/dist/aos.css";

export default function App() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPopup, setShowPopup] = useState(false); 
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL

  useEffect(() => {
    AOS.init({ duration: 400, once: true });
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

        if (admin.data.valid) return navigate("/Beranda");
        else localStorage.removeItem("admin");
      }
    }
    fetchingData();
  }, [navigate,apiUrl]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const initialValues = {
    username: "",
    password: "",
  };

  const validationSchema = Yup.object().shape({
    username: Yup.string().required("Username harus diisi"),
    password: Yup.string().required("Password harus diisi"),
  });

  const onSubmit = async (data) => {
    try {
      const login = await axios.post(`${apiUrl}/Admin/Login`, data);

      if (login.data.error) {
        setShowPopup(true); 
        return;
      }

      localStorage.setItem("admin", login.data.token);
      console.log(login.data.token);
      navigate("/Beranda");
    } catch (error) {
      console.error(error);
    }
  };

  const closePopup = () => {
    setShowPopup(false); 
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white-800 px-4 sm:px-0">
      <div className="bg-white rounded-lg p-6 sm:p-8 w-full max-w-xs sm:max-w-sm">
        <h1 className="text-2xl font-bold mb-2 text-left sm:text-left">
          Selamat datang
        </h1>
        <p className="text-sm text-[#A79277] mb-6 text-left sm:text-left">
          Selamat datang kembali, silakan masuk untuk melanjutkan
        </p>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          <Form>
            <div className="mb-4">
              <ErrorMessage
                name="username"
                component="span"
                className="text-red-500 text-xs italic"
              />
              <div className="flex items-center bg-[#D9D9D9] rounded-lg p-2">
                <i className="fas fa-user text-[#A79277] mr-2"></i>
                <Field
                  type="text"
                  name="username"
                  className="bg-[#D9D9D9] outline-none flex-1 text-sm transition duration-300 ease-in-out transform focus:ring-2 focus:ring-yellow-500"
                  placeholder="Username"
                />
              </div>
            </div>

            <div className="mb-4">
              <ErrorMessage
                name="password"
                component="span"
                className="text-red-500 text-xs italic"
              />
              <div className="flex items-center bg-[#D9D9D9] rounded-lg p-2">
                <i className="fas fa-lock text-[#A79277] mr-2"></i>
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="bg-[#D9D9D9] outline-none flex-1 text-sm transition duration-300 ease-in-out transform focus:ring-2 focus:ring-yellow-500"
                  placeholder="Password"
                />
                <i
                  className={`fas ${
                    showPassword ? "fa-eye" : "fa-eye-slash"
                  } text-[#A79277] cursor-pointer`}
                  onClick={togglePasswordVisibility}
                ></i>
              </div>
              {/* <div className="text-right mt-2">
                <Link
                  to="/lupapassword"
                  className="text-sm text-[#A79277] hover:text-yellow-800 transition duration-200"
                >
                  Lupa password?
                </Link>
              </div> */}
            </div>

            <button
              type="submit"
              className="bg-[#A79277] hover:bg-[#8c7b66] text-white rounded-lg w-full py-2 font-poppins font-bold transition duration-200 transform hover:scale-105"
            >
              Masuk
            </button>
          </Form>
        </Formik>
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 text-center w-72 sm:w-80 mx-4">
            <i
              className="fas fa-exclamation-circle text-red-500 h-50 w-50 mx-auto"
              style={{ fontSize: "3rem" }}
            ></i>
            <h2 className="text-lg font-semibold mt-4 text-red-500">
              Password salah, silakan coba lagi!
            </h2>
            <button
              className="mt-6 bg-[#D9D9D9] text-black font-semibold rounded-lg py-2 px-4 hover:bg-[#D1D1D1]"
              onClick={closePopup}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
