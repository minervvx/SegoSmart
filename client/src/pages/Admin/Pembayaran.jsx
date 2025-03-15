import React, { useEffect, useRef, useState } from "react";
import {
  CashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/outline";
import { QrcodeIcon } from "@heroicons/react/outline";
import { useNavigate } from "react-router-dom";
import LoginValidation from "./components/LoginValidation";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

AOS.init({ duration: 400, once: true });
function App() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState("Tunai");
  const [jenispesanan, setJenispesanan] = useState("Offline");
  const [showAlert, setShowAlert] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showloading, setShowLoading] = useState(false);
  const [showScanSuccess, setShowScanSuccess] = useState(false);
  const [showScanError, setShowScanError] = useState(false);
  const [totalharga, setTotalHarga] = useState(0);
  const [totalDiskon, setTotalDiskon] = useState(0);
  const [keranjanglist, setkeranjanglist] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;

  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleSelect = (method) => {
    setSelectedMethod(method);
  };
  const handleJenispesanan = (method) => {
    setJenispesanan(method);
  };

  const handleAlert = () => {
    setShowAlert(true);
  };
  const handlePayment = async () => {
    setShowAlert(false);
    if (!keranjanglist || keranjanglist.length === 0) {
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 2000);
      return;
    }
    const riwayat = await axios.post(`${apiUrl}/riwayat/unggahriwayat`, {
      total_temp: totalharga,
      total_diskon: totalDiskon,
      total_harga: totalharga - totalDiskon,
      metode: selectedMethod,
      jenis_pesanan: jenispesanan,
    });
    if (riwayat.data.succes) {
      const items = keranjanglist.map((item) => {
        return axios.post(`${apiUrl}/ItemPesanan/unggahitemriwayat`, {
          id_riwayat: riwayat.data.id,
          id_menu: item.id_menu,
          jumlah: item.jumlah,
          sub_total: item.sub_total,
          diskon: item.diskon,
        });
      });

      await Promise.all(items);

      console.log("Done");
      const deleteKeranjang = await axios.post(`${apiUrl}/Keranjang/deleteAll`);

      if (deleteKeranjang.data.success) {
        setShowSuccessPopup(true);
      }
    }
  };

  const handleCloseBayar = () => {
    setShowSuccessPopup(false);
    navigate("/beranda");
  };

  const handleCloseScan = async () => {
    setShowCamera(false);
    console.log(analysisResult);
    const rating = await axios.post(`${apiUrl}/riwayat/unggahKepuasan`, {
      kepuasan: analysisResult,
    });
    console.log(rating.data);
    if (rating.data.success) {
      setShowScanSuccess(false);
      navigate("/beranda");
    }
  };

  const handleScanSatisfaction = () => {
    setShowSuccessPopup(false);
    setShowScanSuccess(false);
    setShowScanError(false);
    setShowCamera(true);
  };

  const handleStartScan = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = mediaStream;
    } catch (error) {
      console.error("Tidak dapat mengakses kamera:", error);
    }
  };
  const handleScan = async () => {
    handleStartScan();
    setTimeout(() => {
      captureImage();
      stopCamera();
      setShowCamera(false);
      setShowLoading(true);
    }, 3000);
  };

  const stopCamera = () => {
    const stream = videoRef.current.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg");
    uploadImageToServer(dataUrl);
  };

  const uploadImageToServer = async (dataUrl) => {
    try {
      const blob = await fetch(dataUrl).then((res) => res.blob());
      const formData = new FormData();
      formData.append("file", blob, "temp.jpg");
      const response = await axios.post(
        "http://127.0.0.1:5000/analyze",
        formData
      );
      if (response.data.satisfaction_rating) {
        setAnalysisResult(response.data.satisfaction_rating);
        setShowLoading(false);
        setShowScanSuccess(true);
      } else {
        setShowLoading(false);
        setShowScanError(true);
        console.error("respon eror:", response.statusText);
      }
    } catch (error) {
      console.error("Gagal mengunggah gambar:", error);
    }
  };

  const handleBackClick = () => {
    navigate("/keranjang");
  };

  useEffect(() => {
    async function fetchingData() {
      const cartList = await axios.get(`${apiUrl}/Keranjang/tampilKeranjang`);

      const promises = await cartList.data.map((item) => {
        return axios.get(`${apiUrl}/Menu/tampilMenu/Byid/${item.id_menu}`);
      });
      const respon = await Promise.all(promises);
      const daftarmenu = respon.map((respon) => respon.data);
      const keranjangmenu = cartList.data.map((item, index) => {
        return {
          ...item,
          menu: daftarmenu[index],
        };
      });
      const total = keranjangmenu.reduce((accumulator, item) => {
        return accumulator + item.sub_total;
      }, 0);
      const diskon = keranjangmenu.reduce((accumulator, item) => {
        return accumulator + (item.sub_total * item.diskon) / 100;
      }, 0);

      setTotalHarga(total);
      setTotalDiskon(diskon);
      setkeranjanglist(cartList.data);
    }
    fetchingData();
  }, [apiUrl]);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(number);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white min-h-screen font-inter">
      <div className="w-full flex items-center mb-4">
        <button
          onClick={handleBackClick}
          className="text-left w-10 h-10 bg-[rgba(167,146,119,0.2)]  flex items-center justify-center rounded-full transition-all duration-300 ease-in-out transform hover:scale-110"
        >
          <i className="fas fa-chevron-left text-sm"></i>
        </button>
      </div>
      {showNotification && (
        <div
          className="fixed top-0 left-0 w-full flex justify-center items-center z-50"
        >
          <div className="notification bg-red-500 text-white p-4 rounded mt-4 shadow-lg">
            Keranjang kosong. Silakan tambahkan item ke keranjang!
          </div>
        </div>
      )}

      <h1 className="text-lg font-bold text-center  mb-[20px]">
        Metode Pembayaran
      </h1>
      <div className="w-full max-w-xs sm:max-w-md">
        {/* Pilihan Tunai */}
        <button
          onClick={() => handleSelect("Tunai")}
          className={`w-full flex items-center justify-between p-4 rounded-lg mb-2 transform transition-all duration-300 ease-in-out ${
            selectedMethod === "Tunai"
              ? "bg-[rgb(167,146,119)]"
              : "bg-[rgba(167,146,119,0.2)]"
          } hover:scale-105`}
        >
          <div className="flex items-center space-x-2">
            <CashIcon
              className={`w-6 h-6 ${
                selectedMethod === "Tunai" ? "text-white" : ""
              }`}
            />
            <span
              className={`font-semibold ${
                selectedMethod === "Tunai" ? "text-white" : ""
              }`}
            >
              Tunai
            </span>
          </div>
          <span
            className={`rounded-full w-4 h-4 border ${
              selectedMethod === "Tunai" ? "bg-white" : ""
            }`}
          ></span>
        </button>

        {/* Pilihan Qris */}
        <button
          onClick={() => handleSelect("Qris")}
          className={`w-full flex items-center justify-between p-4 rounded-lg transform transition-all duration-300 ease-in-out ${
            selectedMethod === "Qris"
              ? "bg-[rgb(167,146,119)]"
              : "bg-[rgba(167,146,119,0.2)]"
          } hover:scale-105`}
        >
          <div className="flex items-center space-x-2">
            <QrcodeIcon
              className={`w-6 h-6 ${
                selectedMethod === "Qris" ? "text-white" : ""
              }`}
            />
            <span
              className={`font-semibold ${
                selectedMethod === "Qris" ? "text-white" : ""
              }`}
            >
              Qris
            </span>
          </div>
          <span
            className={`rounded-full w-4 h-4 border ${
              selectedMethod === "Qris" ? "bg-white" : ""
            }`}
          ></span>
        </button>
      </div>

      <h1 className="text-lg font-bold text-center mt-[20px] mb-[20px]">
        Jenis Pesanan
      </h1>

      <div className="w-full max-w-xs sm:max-w-md">
        {/* Pilihan Offline */}
        <button
          onClick={() => handleJenispesanan("Offline")}
          className={`w-full flex items-center justify-between p-4 rounded-lg mb-2 transform transition-all duration-300 ease-in-out ${
            jenispesanan === "Offline"
              ? "bg-[rgb(167,146,119)]"
              : "bg-[rgba(167,146,119,0.2)]"
          } hover:scale-105`}
        >
          <div className="flex items-center space-x-2">
            <i
              className={`fa-solid fa-globe ${
                jenispesanan === "Offline" ? "text-white" : ""
              }`}
            ></i>
            <span
              className={`font-semibold ${
                jenispesanan === "Offline" ? "text-white" : ""
              }`}
            >
              Offline
            </span>
          </div>
          <span
            className={`rounded-full w-4 h-4 border ${
              jenispesanan === "Offline" ? "bg-white" : ""
            }`}
          ></span>
        </button>

        {/* Pilihan Online */}
        <button
          onClick={() => handleJenispesanan("Online")}
          className={`w-full flex items-center justify-between p-4 rounded-lg transform transition-all duration-300 ease-in-out ${
            jenispesanan === "Online"
              ? "bg-[rgb(167,146,119)]"
              : "bg-[rgba(167,146,119,0.2)]"
          } hover:scale-105`}
        >
          <div className="flex items-center space-x-2">
            <i
              className={`fa-solid fa-wifi ${
                jenispesanan === "Online" ? "text-white" : ""
              }`}
            ></i>
            <span
              className={`font-semibold ${
                jenispesanan === "Online" ? "text-white" : ""
              }`}
            >
              Online
            </span>
          </div>
          <span
            className={`rounded-full w-4 h-4 border ${
              jenispesanan === "Online" ? "bg-white" : ""
            }`}
          ></span>
        </button>
      </div>

      <div className="w-full max-w-xs sm:max-w-md mt-6 p-4 bg-[rgba(167,146,119,0.2)] rounded-lg">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatRupiah(totalharga)}</span>
        </div>
        <div className="flex justify-between">
          <span>Diskon</span>
          <span>-{formatRupiah(totalDiskon)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>{formatRupiah(totalharga - totalDiskon)}</span>
        </div>
      </div>

      {/* Kotak Bayar */}
      <div className="w-full max-w-xs sm:max-w-md mt-4">
        <button
          onClick={handleAlert}
          className="w-full bg-[#A79277] text-white py-2 rounded-lg font-semibold transform transition-all duration-300 ease-in-out hover:scale-105"
        >
          Bayar
        </button>
      </div>

      {/* Popup Pembayaran Berhasil */}
      {showAlert && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 text-center w-72 sm:w-80 mx-4">
            <i
              className="fas fa-question-circle text-[#A79277] mx-auto"
              style={{ fontSize: "3rem" }}
            ></i>
            <h2 className="text-lg font-semibold mt-4 text-gray-800">
              Apakah Anda yakin melakukan pembayaran ini?
            </h2>
            <div className="flex justify-center mt-6 space-x-4">
              <button
                onClick={() => setShowAlert(false)}
                className="bg-[rgba(167,146,119,0.2)] text-black font-semibold rounded-lg py-2 px-4 hover:scale-105 transform transition duration-300"
              >
                Tidak
              </button>
              <button
                onClick={handlePayment}
                className="bg-[#A79277] text-white font-semibold rounded-lg py-2 px-4 hover:scale-105 transform transition duration-300"
              >
                Iya
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-lg font-bold">Pembayaran Berhasil!</h2>
            <p className="mt-2">Terima kasih atas pembayaran Anda.</p>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={handleCloseBayar}
                className="bg-[rgba(167,146,119,0.2)] py-2 px-4 rounded hover:scale-105 transform transition duration-300"
              >
                Kembali ke Menu
              </button>
              <button
                onClick={handleScanSatisfaction}
                className="bg-[#A79277] text-white py-2 px-4 rounded hover:scale-105 transform transition duration-300"
              >
                Scan Kepuasan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kamera untuk Scan Kepuasan */}
      {showCamera && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center w-[90%] max-w-xl">
            <h2 className="text-2xl font-bold mb-6">Scan Kepuasan</h2>
            <video
              ref={videoRef}
              className="w-full h-auto max-w-lg mb-6 transform scale-x-[-1] rounded-lg shadow-md"
              autoPlay
            ></video>
            <button
              onClick={handleScan}
              className="bg-[#A79277] text-white font-semibold py-3 px-6 rounded-lg text-lg hover:bg-[#8B6F61] hover:scale-105 transform transition duration-300"
            >
              Mulai Scan
            </button>
            <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
          </div>
        </div>
      )}

      {/* Popup Loading */}
      {showloading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center w-[90%] sm:w-[80%] md:max-w-lg">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#A79277]"></div>
              <p className=" mt-4 text-lg">Memproses, harap tunggu...</p>
            </div>
          </div>
        </div>
      )}

      {/* Popup Scan Sukses */}
      {showScanSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center w-[90%] sm:w-[80%] md:max-w-lg">
            <CheckCircleIcon className="w-20 h-20 text-green-500 mb-6" />
            {analysisResult && (
              <div className="flex items-center mb-6">
                {/* Render bintang berdasarkan rating */}
                {Array.from({ length: 5 }, (_, index) => (
                  <i
                    key={index}
                    className={`fas fa-star ${
                      index < analysisResult
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }`}
                    style={{ fontSize: "2rem", margin: "0 4px" }}
                  ></i>
                ))}
              </div>
            )}
            <h2 className="text-xl font-bold mb-4">Scan Sukses!</h2>
            <p className="mt-2 text-lg">
              Terima kasih telah memberikan penilaian.
            </p>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={handleCloseScan}
                className="bg-[rgba(167,146,119,0.2)] py-2 px-4 rounded hover:scale-105 transform transition duration-300"
              >
                Kembali ke Menu
              </button>
              <button
                onClick={handleScanSatisfaction}
                className="bg-[#A79277] text-white py-2 px-4 rounded hover:scale-105 transform transition duration-300"
              >
                Scan Ulang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Scan Error */}
      {showScanError && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center w-[90%] sm:w-[80%] md:max-w-lg">
            <XCircleIcon className="w-20 h-20 text-red-500 mb-6" />
            <h2 className="text-xl font-bold mb-4">Scan Gagal!</h2>
            <p className="mt-2 text-lg text-center">
              Maaf, terjadi kesalahan saat pemindaian. Silakan coba lagi atau
              pastikan kamera Anda berfungsi dengan baik.
            </p>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={handleCloseScan}
                className="bg-[rgba(167,146,119,0.2)] py-2 px-4 rounded hover:scale-105 transform transition duration-300"
              >
                Kembali ke Menu
              </button>
              <button
                onClick={handleScanSatisfaction}
                className="bg-[#A79277] text-white py-2 px-4 rounded hover:scale-105 transform transition duration-300"
              >
                Scan Ulang
              </button>
            </div>
          </div>
        </div>
      )}

      <LoginValidation />
    </div>
  );
}

export default App;