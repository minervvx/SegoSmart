import React, { useState,useEffect} from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import axios from 'axios';
import AOS from "aos";
import "aos/dist/aos.css";

const App = () => {
    const navigate = useNavigate();
    const {id} = useParams();
    const publicUrl = process.env.PUBLIC_URL;
    const apiUrl = process.env.REACT_APP_API_URL

    const [promoItems, setPromoItems] = useState({})
    const [menu, setMenu] = useState({})

    useEffect(() => {
      AOS.init({ duration: 400, once: true });
      async function fetchData() {
        const response = await axios.get(`${apiUrl}/Promo/tampilPromo/perId/${id}`);
        const menu = await axios.get(`${apiUrl}/Menu/tampilMenu/Byid/${response.data.id_menu}`);

        setPromoItems(response.data)
        setMenu(menu.data)
      }
      fetchData()
    },[id,apiUrl])

    const handleBackClick = () => {
        navigate(-1);
    };
    const formatRupiah = (number) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(number);
    };

    const infoPromo = (
      titlePromo,
      diskon,
      image,
      title,
      lastPrice,
      describePromo
    ) => (
      <div>
        <div 
        data-aos ="slide-down"
        className="bg-white rounded-lg mb-6 flex flex-col">
          <div className="p-4">
            <h2 className="text-lg sm:text-xl font-bold">{titlePromo}</h2>
            <h3 className="text-2xl sm:text-3xl font-bold">{diskon}%</h3>
          </div>
          <div className="flex justify-center items-center">
            <div className="bg-gradient-to-r from-[rgba(0,0,0)] to-[rgba(167,146,119)] rounded-3xl p-4 flex items-center w-80 h-40">
              <div>
                <img
                  src={publicUrl + "/images/menu/" + image}
                  className=" w-full object-contain max-h-64 sm:max-h-72 md:max-h-80 lg:max-h-96 xl:max-h-96 rounded-lg"
                  alt={title}
                />
              </div>
            </div>
          </div>
        </div>
        <div 
        data-aos ="slide-up"
        className="flex justify-between items-center mb-4">
          <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
          <span className="text-xl sm:text-2xl font-bold">{formatRupiah(lastPrice)}</span>
        </div>
        <p 
        data-aos ="slide-up"
        className="text-gray-600 leading-relaxed mb-6 text-sm sm:text-base text-justify">
          {describePromo}
        </p>
      </div>
    );

    return (
      <div className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto p-4 sm:p-6 md:p-8 border border-white rounded-lg">
  <div className="absolute left-4 top-4 z-10">
    <button
      className="w-10 h-10 bg-[rgba(167,146,119,0.2)] rounded-full flex items-center justify-center cursor-pointer"
      onClick={handleBackClick}
    >
      <i className="fas fa-chevron-left"></i>
    </button>
  </div>
  {infoPromo(
    promoItems.nama_promo,
    promoItems.diskon,
    menu.gambar,
    menu.nama_menu,
    promoItems.harga_akhir,
    promoItems.deskripsi
  )}
</div>

    );
};

export default App;
