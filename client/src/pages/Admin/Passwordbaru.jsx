import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { CheckCircleIcon } from "@heroicons/react/solid";
import AOS from "aos";
import "aos/dist/aos.css";

AOS.init({ duration: 400, once: true });
export default function App() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSavePassword = () => {
        setShowPopup(true); 
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen mt-8 sm:mt-0" >
            <div className="bg-white rounded-lg p-6 sm:p-8 w-full max-w-xs sm:max-w-sm min-h-screen sm:min-h-0">
                <h1 className="text-2xl font-bold mb-2 text-center sm:text-center">
                    Password Baru
                </h1>
                <div className="mb-4">
                    <div className="flex items-center bg-[#D9D9D9] rounded-lg p-2">
                        <i className="fas fa-lock text-[#A79277] mr-2"></i>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="bg-[#D9D9D9] outline-none flex-1 text-sm"
                            placeholder="Masukkan password baru"
                        />
                        <i
                            className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'} text-[#A79277] cursor-pointer`}
                            onClick={togglePasswordVisibility}
                        ></i>
                    </div>
                </div>
                <button className="bg-[#A79277] hover:bg-[#8c7b66] text-white rounded-lg w-full py-2 font-poppins font-bold transition duration-200" onClick={handleSavePassword}>
                    Simpan
                </button>
            </div>

            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg p-6 text-center w-72 sm:w-80 mx-4">
                        <CheckCircleIcon className="h-16 w-16 text-[#A79277] mx-auto" />
                        <h2 className="text-lg font-semibold mt-4 text-[#A79277]">
                            Password baru berhasil disimpan
                        </h2>
                        <button className="mt-6 bg-[#D9D9D9] text-black font-semibold rounded-lg py-2 px-4 hover:bg-[#D1D1D1]">
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
