import React, { useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/solid';
import { useNavigate } from 'react-router-dom';  
import AOS from "aos";
import "aos/dist/aos.css";

AOS.init({ duration: 400, once: true });
function LupaPassword() {
    const [showPopup, setShowPopup] = useState(false);
    const [showResendPopup, setShowResendPopup] = useState(false);

    const navigate = useNavigate();  

    const handleSendEmail = () => {
        setShowPopup(true);
    };

    const handleResendEmail = () => {
        setShowResendPopup(true); 
    };

    const closePopup = () => {
        setShowPopup(false);
        setShowResendPopup(false);
    };

    const handleBackClick = () => {
        navigate('/login'); 
    };

    return (
        <div className="flex items-center justify-center min-h-screen relative">
            <div
                onClick={handleBackClick}
                className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center cursor-pointer bg-[rgba(167,146,119,0.2)] rounded-full"
            >
                <i className="fas fa-chevron-left"></i> 
            </div>

            <div className="w-full max-w-md p-6 bg-white rounded-lg">
                <h1 className="text-2xl font-bold text-center mb-4">
                    Lupa Password
                </h1>
                <p className="text-center text-[#A79277] mb-2">
                    Masukkan email akun Anda, kami akan mengirimkan link reset password
                </p>
                <p className="text-center text-[#A79277] mb-6">
                    Belum menerima Email?{' '}
                    <span
                        className="text-red-500 cursor-pointer"
                        onClick={handleResendEmail}
                    >
                        Klik disini
                    </span>
                </p>
                <div className="flex items-center bg-[#D9D9D9] rounded-lg mb-4 p-2">
                    <i className="fas fa-envelope text-[#A79277] mr-2"></i>
                    <input
                        type="email"
                        className="bg-[#D9D9D9] outline-none flex-1 text-sm border-0"
                        placeholder="Email"
                    />
                </div>

                {/* Tombol Kirim Email dengan animasi zoom */}
                <button className="bg-[#A79277] hover:bg-[#8c7b66] text-white rounded-lg w-full py-2 font-poppins font-bold transition duration-200 transform hover:scale-105">
                    Kirim Email
                </button>

                {/* Popup konfirmasi pertama kali mengirim email */}
                {showPopup && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white rounded-lg p-6 text-center w-72 sm:w-80 mx-4">
                            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
                            <h2 className="text-lg font-semibold mt-4">Link password telah terkirim ke email Anda</h2>
                            <button
                                className="mt-6 bg-[#D9D9D9] text-black font-semibold rounded-lg py-2 px-4 hover:bg-[#D1D1D1]"
                                onClick={closePopup}
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}

                {/* Popup konfirmasi pengiriman ulang email */}
                {showResendPopup && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white rounded-lg p-6 text-center w-72 sm:w-80 mx-4">
                            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
                            <h2 className="text-lg font-semibold mt-4">Berhasil mengirim ulang link reset password</h2>
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
        </div>
    );
}

export default LupaPassword;
