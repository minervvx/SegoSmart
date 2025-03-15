import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

const App = () => {
  const navigate = useNavigate();
  const { nama } = useParams();
  const [menu, setMenu] = useState([]);
  const publicUrl = process.env.PUBLIC_URL;
  const apiUrl = process.env.REACT_APP_API_URL;


  const handleBackClick = () => {
    navigate(-1);
  };

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    async function fetchingData() {
      const menulist = await axios.get(`${apiUrl}/Menu/tampilMenu/perNama/${nama}`);
      setMenu(menulist.data);
    }
    fetchingData();

  },[nama, apiUrl])

  const renderMenu = (image, title, price, describe) => (
    <div>
      <div 
      data-aos ="slide-down"
      className="bg-transparent rounded-lg overflow-hidden mb-6 relative z-10">
        <img
          src={publicUrl + "/images/menu/" + image}
          alt={title}
          className="w-full object-contain h-56 sm:h-72 md:h-80 lg:h-96 xl:h-96 rounded-lg z-10 relative"
        />
      </div>

      <div 
      data-aos ="slide-up"
      className="flex justify-between items-center mb-4">
        <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
        <span className="text-xl sm:text-2xl font-bold">{formatRupiah(price)}</span>
      </div>
      <p 
      data-aos ="slide-up"
      className="text-gray-600 leading-relaxed mb-6 text-sm sm:text-base text-justify">
        {describe}
      </p>
    </div>
  );
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(number);
  };

  return (
    <div
  className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto p-4 sm:p-6 md:p-8 border border-white rounded-lg"
>
  <div className="absolute left-4 top-4 z-20">
    <button
      className="w-10 h-10 bg-[rgba(167,146,119,0.2)] rounded-full flex items-center justify-center cursor-pointer"
      onClick={handleBackClick}
    >
      <i className="fas fa-chevron-left"></i>
    </button>
  </div>

  <div className="absolute top-0 left-0 md:left-1/2 transform md:-translate-x-1/2 -translate-y-[50px] bg-[#A79277] rounded-b-full w-full sm:w-full md:w-screen lg:w-[600px] xl:w-[700px] h-64 sm:h-80 md:h-[400px] lg:h-[400px] xl:h-[400px] z-0"></div>
  {menu.map((item) =>
    renderMenu(item.gambar, item.nama_menu, item.harga, item.deskripsi)
  )}
</div>

  );
};


export default App;
