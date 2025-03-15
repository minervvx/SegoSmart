import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
const Homepage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [makanan, setMakanan] = useState([]);
  const [minuman, setMinuman] = useState([]);
  const [promo, setPromo] = useState([]);
  let navigate = useNavigate();
  const publicUrl = process.env.PUBLIC_URL;
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });

    async function fetchingData() {
      try {
        const daftarMakanan = await axios.get(
          ` ${apiUrl}/Menu/tampilMenu/perKategori/makanan`
        );
        setMakanan(daftarMakanan.data);

        const daftarMinuman = await axios.get(
          `${apiUrl}/Menu/tampilMenu/perKategori/minuman`
        );
        setMinuman(daftarMinuman.data);

        const promoList = await axios.get(`${apiUrl}/Promo/tampilPromo/All`);
        const promises = promoList.data.map((item) => {
          return axios
            .get(`${apiUrl}/Menu/tampilMenu/Byid/${item.id_menu}`)
            .catch((err) => {
              console.error(err);
              return null;
            });
        });

        const responses = await Promise.all(promises);
        const daftarmenu = responses.map((respon) =>
          respon ? respon.data : null
        );

        const promos = promoList.data.map((item, index) => {
          return {
            ...item,
            menu: daftarmenu[index],
          };
        });

        setPromo(promos);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchingData();
  }, [apiUrl]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menup?nama=${searchQuery}`);
    }
  };

  const renderItem = (img, name, price, index, id) => (
    <Link to={`/Infomenu/${name}`} key={index}>
      <div
        key={index}
        data-aos="slide-up"
        className="bg-[rgba(167,146,119,0.2)] p-2 rounded-lg relative w-40 sm:w-48 md:w-56 flex-shrink-0 mb-5"
      >
        <img
          src={publicUrl + "/images/menu/" + (img || "default-image.jpg")}
          alt={name}
          className="w-full h-24 sm:h-28 md:h-40 object-cover rounded-lg mb-2"
        />
        <h3 className="text-sm text-left font-bold mt-4">{name}</h3>
        <p className="text-sm text-left">{formatRupiah(price)}</p>
      </div>
    </Link>
  );

  const renderPromo = (title, discount, image, id, index) => (
    <Link to={`/Infopromo/${id}`} key={index}>
      <div
        key={index}
        data-aos="slide-down"
        className="bg-gradient-to-r from-[rgba(0,0,0)] to-[rgba(167,146,119)] rounded-3xl p-4 flex items-center justify-between w-80 h-40"
      >
        <div className="text-white flex flex-col justify-center">
          <div className="text-lg font-bold">{title}</div>
          <div className="text-4xl font-bold">{discount}%</div>
        </div>
        <div>
          <img
            src={publicUrl + "/images/menu/" + (image || "default-image.jpg")}
            className=" h-25 "
            alt={title}
          />
        </div>
      </div>
    </Link>
  );

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(number);
  };

  return (
    <div className="max-w-full mx-auto min-h-screen ">
      <header className="sticky top-0 bg-white bg-opacity-80 backdrop-blur-lg z-50 p-2 flex flex-col items-center">
        <div className="w-full max-w-2xl flex flex-col items-center">
          <h1 className="text-2xl font-bold text-left w-full">Pilih</h1>
          <h1 className="text-2xl font-bold text-left w-full">
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
              className="w-full p-2 pl-10 rounded-full bg-[rgba(167,146,119,0.2)] text-gray-500 focus:outline-none focus:ring-0"
            />
            <i className="fas fa-search absolute left-3 top-3 text-gray-500"></i>
          </form>
        </div>
      </header>

      <section
        data-aos="fade-down"
        className="text-center pt-8 bg-[rgba(167,146,119,0.2)]"
      >
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-center px-8">
          <div className="text-left mx-auto md:mr-8 md:ml-16 w-full">
            <h1 className="text-4xl sm:text-5xl md:text-4xl lg:text-5xl font-bold text-[#000]">
              Selamat Datang di{" "}
            </h1>
            <h1 className="text-4xl sm:text-5xl md:text-4xl lg:text-5xl font-bold text-[#A79277]">
              Sego Resek
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-4 text-left sm:text-lg md:text-base lg:text-xl max-w-lg sm:max-w-xl md:max-w-2xl mx-auto md:ml-0">
              Nikmati cita rasa ayam yang menggugah selera, dengan bumbu yang
              kaya dan tekstur yang sempurna, setiap suapan membawa kenikmatan
              tersendiri.
            </p>

            <button
              onClick={() => (window.location.href = "/menup")}
              className="mt-5 ml-0 px-4 py-2 rounded-full bg-[#A79277] text-white font-semibold focus:outline-none hover:scale-105 transform transition duration-300 bg-gradient-to-r from-[#A79277] to-[#625545] hover:bg-gradient-to-r hover:animate-gradientHover"
            >
              Menu Kami
            </button>
          </div>

          {/* Gambar */}
          <img
            src={`${publicUrl}/images/menu/SegoResek.png`}
            alt="Rice Bowl"
            className="mt-8 md:mt-0 w-full sm:w-2/3 md:w-1/2 lg:w-1/3 mx-auto"
          />
        </div>
      </section>

      <section
        data-aos="fade-up"
        className="text-center pb-5 pt-10 bg-gradient-to-b from-[rgba(167,146,119,0.2)] to-white px-8"
      >
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-center px-4 sm:px-8 md:px-16">
          <img
            src={`${publicUrl}/images/menu/Sego Resek Jingkrak Hitam.png`}
            alt="Hien Bowl"
            className="w-2/3 sm:w-1/2 md:w-1/3 lg:w-1/2 mb-4 sm:mb-0 sm:mr-8"
          />

          <div className="w-full sm:w-2/3 text-left">
            <h2 className="text-4xl font-bold text-[#A79277]">Tentang Kami</h2>
            <p className="text-gray-600 mt-4 text-justify">
              Restoran ini menyajikan berbagai macam hidangan lezat seperti
              aneka ayam, bebek, dan nasi yang pasti menggugah selera. Setiap
              sajian diracik dengan bahan-bahan berkualitas dan cita rasa yang
              menggoda. Nikmati makanan yang enak bersama keluarga Anda dalam
              suasana yang nyaman, dengan harga yang sangat terjangkau. Pastikan
              untuk mengunjungi restoran ini dan rasakan kenikmatannya!
            </p>
          </div>
        </div>
      </section>

      <div className=" px-2 mt-5 pb-2 sm:px-12">
        <h2 className="text-xl font-bold text-left mb-4">Promo</h2>
        <div
          className="flex overflow-x-auto overflow-hidden space-x-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {promo.map((item, index) =>
            item?.menu?.gambar
              ? renderPromo(
                  item.nama_promo,
                  item.diskon,
                  item.menu.gambar,
                  item.id,
                  index
                )
              : null
          )}
        </div>
      </div>

      <section className="pb-10 px-2 mt-10 sm:px-12">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Makanan</h2>
          <Link to="/menup" className="text-sm font-semibold">
            Lihat Semua
          </Link>
        </div>
        <div
          className="overflow-x-auto flex space-x-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {makanan.map((item, index) =>
            renderItem(item.gambar, item.nama_menu, item.harga, index, item.id)
          )}
        </div>
      </section>

      <section className="pb-10 mt-10 px-4 sm:px-12">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Minuman</h2>
          <Link to="/menup" className="text-sm font-semibold">
            Lihat Semua
          </Link>
        </div>
        <div
          className="overflow-x-auto flex space-x-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {minuman.map((item, index) =>
            renderItem(item.gambar, item.nama_menu, item.harga, index, item.id)
          )}
        </div>
      </section>
      <footer className="bg-[#A79277] text-white py-4">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between px-6 sm:px-12 max-w-screen-lg items-center">
          {/* Bagian Kontak */}
          <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-0">
            <img
              src={`${publicUrl}/images/menu/BG Sego Resek Jingkrak Putih.png`}
              alt="Logo"
              className="w-[120px] h-[120px] mb-3 sm:mb-0 sm:mr-4 mx-auto sm:mx-0"
            />
            <div className="flex flex-col items-center sm:items-start">
              <p className="font-bold text-sm mb-2">Contact Us</p>
              <div className="flex items-center space-x-2 text-xs">
                <i className="fas fa-map-marker-alt"></i>
                <p>Jl. Terusan Surabaya No.08</p>
              </div>
              <div className="flex items-center space-x-2 mt-1 text-xs">
                <i className="fab fa-instagram"></i>
                <p>segoresek</p>
              </div>
              <div className="flex items-center space-x-2 mt-1 text-xs">
                <i className="fas fa-clock"></i>
                <p>8:00 AM - 2:00 PM</p>
              </div>
            </div>
          </div>

          <div
            data-aos="zoom-in"
            className="mt-4 sm:mt-0 flex justify-end sm:w-1/2"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31321.808425838626!2d112.59715557065893!3d-7.9666125200040385!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7883eaa135f695%3A0xe5d4a66b051dfae!2sSego%20Resek%20Terusan%20Surabaya!5e0!3m2!1sid!2sid!4v1733383173160!5m2!1sid!2sid"
              width="50%"
              height="120"
              style={{ border: "0" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="max-w-xs w-full h-[120px] rounded-md"
              title="Map"
            ></iframe>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
