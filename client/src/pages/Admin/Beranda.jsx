import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "./components/Footer";
import LoginValidation from "./components/LoginValidation";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
const Homepage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [makanan, setMakanan] = useState([]);
  const [minuman, setMinuman] = useState([]);
  const [promo, setPromo] = useState([]);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  let navigate = useNavigate();
  const publicUrl = process.env.PUBLIC_URL;
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    async function fetchingData() {
      const daftarMakanan = await axios.get(
        `${apiUrl}/Menu/tampilMenu/perKategori/makanan`
      );
      setMakanan(daftarMakanan.data);
      const daftarMinuman = await axios.get(
        `${apiUrl}/Menu/tampilMenu/perKategori/minuman`
      );
      setMinuman(daftarMinuman.data);
      const promoList = await axios.get(`${apiUrl}/Promo/tampilPromo/All`);

      const promises = promoList.data.map((item) => {
        return axios.get(`${apiUrl}/Menu/tampilMenu/Byid/${item.id_menu}`);
      });

      const responses = await Promise.all(promises);
      const daftarmenu = responses.map((respon) => respon.data);

      const promos = promoList.data.map((item, index) => {
        return {
          ...item,
          menu: daftarmenu[index],
        };
      });

      setPromo(promos);
    }
    fetchingData();
  }, [apiUrl]);

  useEffect(() => {
    if (popup.show) {
      const timer = setTimeout(() => setPopup({ ...popup, show: false }), 1500);
      return () => clearTimeout(timer);
    }
  }, [popup]);

  const handleOrderNowClick = () => {
    navigate("/cari");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/Cari?nama=${searchQuery}`);
    }
  };

  const renderItem = (img, name, price, stok, index, id) => (
    <div
      data-aos="slide-right"
      key={index}
      className="bg-[rgba(167,146,119,0.2)] p-2 rounded-lg relative w-40 sm:w-48 md:w-56 flex-shrink-0 mb-5 shadow-lg"
    >
      <img
        src={publicUrl + "/images/menu/" + img}
        alt={name}
        className="w-full h-24 sm:h-28 md:h-40 object-cover rounded-lg mb-2"
      />
      <h3 className="text-sm text-left font-bold mt-4">{name}</h3>
      <p className="text-sm text-left">{formatRupiah(price)}</p>
      <div
        className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
          stok > 0 ? "bg-[#A79277]" : "bg-[#a792777d]"
        }`}
      >
        {stok}
      </div>
      <button
        className={`absolute bottom-2 right-2 p-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out transform active:scale-95 active:shadow-lg ${
          stok > 0
            ? "bg-[#A79277] hover:bg-[#c3a37a] hover:scale-110 active:bg-[#d4b48b]"
            : "bg-[#a792777d] cursor-not-allowed"
        }`}
        onClick={() => {
          if (stok > 0) {
            addKeranjang(id);
          } else {
            setPopup({
              show: true,
              message: "Stok habis!",
              type: "error",
            });
          }
        }}
      >
        <i className="fas fa-shopping-cart text-white"></i>
      </button>
    </div>
  );

  const renderPromo = (title, discount, image, id, index) => (
    <Link to={`/Infopromo/${id}`} key={index}>
      <div
        data-aos="slide-left"
        className="bg-gradient-to-r from-[rgba(0,0,0)] to-[rgba(167,146,119)] rounded-3xl p-4 flex items-center justify-between w-80 h-40 shadow-lg"
      >
        <div className="text-white flex flex-col justify-center">
          <div className="text-lg font-bold">{title}</div>
          <div className="text-4xl font-bold">{discount}%</div>
        </div>
        <div>
          <img
            src={publicUrl + "/images/menu/" + image}
            className=" h-25 "
            alt={title}
          />
        </div>
      </div>
    </Link>
  );

  const addKeranjang = async (idmenu) => {
    try {
      const add = await axios.post(`${apiUrl}/Keranjang/tambahKeranjang`, {
        id_menu: idmenu,
        jumlah: 1,
      });

      if (add.data.error) {
        setPopup({ show: true, message: add.data.error, type: "error" });
      } else {
        setPopup({
          show: true,
          message: "Berhasil menambahkan ke keranjang!",
          type: "success",
        });

        setMakanan((prevMakanan) =>
          prevMakanan.map((item) =>
            item.id_menu === idmenu && item.stok > 0
              ? { ...item, stok: Math.max(0, item.stok - 1) }
              : item
          )
        );

        setMinuman((prevMinuman) =>
          prevMinuman.map((item) =>
            item.id_menu === idmenu && item.stok > 0
              ? { ...item, stok: Math.max(0, item.stok - 1) }
              : item
          )
        );
      }
    } catch (error) {
      setPopup({
        show: true,
        message: error,
        type: "error",
      });
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(number);
  };

  return (
    <div className="max-w-full mx-auto min-h-screen pb-20">
      <header
        data-aos="slide-right"
        className="sticky top-0 bg-white bg-opacity-80 backdrop-blur-lg z-50 p-2 flex flex-col items-center"
      >
        <div className="w-full max-w-2xl flex flex-col items-center">
          <h1 className="text-2xl font-bold text-left w-full hover:animate-pulse">
            Pilih
          </h1>
          <h1 className="text-2xl font-bold text-left w-full hover:animate-pulse">
            Makanan <span className="text-[#A79277]">Favoritmu</span>
          </h1>
        </div>

        <div className="relative w-full max-w-2xl mx-auto mb-4 flex items-center">
          <form onSubmit={handleSearchSubmit} className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari"
              className="w-full p-2 pl-10 rounded-full bg-[rgba(167,146,119,0.2)] text-gray-500 focus:outline-none focus:ring-0 transition-colors duration-300 hover:bg-[rgba(136,121,103,0.3)]"
            />
            <i className="fas fa-search absolute left-3 top-3 text-gray-500 transition-transform transform hover:scale-110 hover:text-gray-700"></i>
          </form>

          <button
            onClick={handleOrderNowClick}
            className="ml-2 px-4 py-2 rounded-full bg-[#A79277] text-white font-semibold focus:outline-none transition-transform transform hover:scale-105 hover:bg-[#8a6b5d]"
          >
            Order Now
          </button>
        </div>
      </header>
      <div className="mb-4 px-10">
        <div
          className="flex overflow-x-auto overflow-hidden space-x-4 "
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {promo.map((item, index) =>
            renderPromo(
              item.nama_promo,
              item.diskon,
              item.menu.gambar,
              item.id,
              index
            )
          )}
        </div>
      </div>

      <section className="mb-4 px-10">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Makanan</h2>
          <Link to="/cari" className="text-sm font-semibold">
            Lihat Semua
          </Link>
        </div>
        <div
          className="overflow-x-auto flex space-x-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {makanan.map((item, index) =>
            renderItem(
              item.gambar,
              item.nama_menu,
              item.harga,
              item.stok,
              index,
              item.id_menu
            )
          )}
        </div>
      </section>

      <section className="mb-4 px-10">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Minuman</h2>
          <Link to="/cari" className="text-sm font-semibold">
            Lihat Semua
          </Link>
        </div>
        <div
          className="overflow-x-auto flex space-x-4 overflow-hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {minuman.map((item, index) =>
            renderItem(
              item.gambar,
              item.nama_menu,
              item.harga,
              item.stok,
              index,
              item.id_menu
            )
          )}
        </div>
      </section>
      {popup.show && (
        <div
          className={`fixed top-10 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg z-50 ${
            popup.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          <i
            className={`fas ${
              popup.type === "success" ? "fa-check-circle" : "fa-times-circle"
            } mr-2`}
          ></i>
          {popup.message}
        </div>
      )}

      <Footer />
      <LoginValidation />
    </div>
  );
};

export default Homepage;
