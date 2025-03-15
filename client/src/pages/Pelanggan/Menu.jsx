import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import "tailwindcss/tailwind.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
const App = () => {
  const publicUrl = process.env.PUBLIC_URL;
  const [searchParams] = useSearchParams();
  const nama = searchParams.get("nama");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [menu, setMenu] = useState([]);
  const [originalMenu, setOriginalMenu] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    async function fetchingData() {
      let daftarMenu;
      if (nama) {
        daftarMenu = await axios.get(
          `${apiUrl}/Menu/tampilMenu/perNama/${nama}`
        );
      } else {
        daftarMenu = await axios.get(`${apiUrl}/Menu/tampilMenu/All`);
      }
      setOriginalMenu(daftarMenu.data);
      setMenu(daftarMenu.data);
    }
    fetchingData();
  }, [refreshKey, nama, apiUrl]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menup?nama=${searchQuery}`);
      setRefreshKey((prevKey) => prevKey + 1);
    }
  };

  const handleFilterMenu = (type) => {
    setActiveFilter(type);
    if (type === "all") {
      setMenu(originalMenu);
    } else {
      const filteredMenu = originalMenu.filter(
        (item) => item.kategori === type
      );
      setMenu(filteredMenu);
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(number);
  };

  return (
    <div className="">
      <div className="mb-20">
        <header
          data-aos="slide-down"
          className="flex flex-col justify-between items-center sticky top-0 p-4 bg-white bg-opacity-80 backdrop-blur-lg z-10"
        >
          <div className="flex justify-between items-center w-full">
            <Link
              to= {"/berandap"}
              className="w-10 h-10 bg-[rgba(167,146,119,0.2)] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-110"
            >
              <i className="fas fa-chevron-left text-gray-600"></i>
            </Link>

            <h1 className="text-2xl md:text-3xl font-bold">Menu</h1>
            <div className="w-10 h-10 rounded-full flex items-center justify-center"></div>
          </div>

          {/* Search Bar */}
          <div
            data-aos="slide-down"
            className="relative w-full max-w-2xl mx-auto mb-4 mt-4"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex-grow mb-2"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari"
                className="w-full p-2 pl-10 rounded-full bg-[rgba(167,146,119,0.2)] text-gray-500 focus:outline-none focus:ring-0 transition-colors duration-300 hover:bg-[rgba(136,121,103,0.3)]"
              />
              <i className="fas fa-search absolute left-3 top-3 text-gray-500 transition-transform transform hover:scale-110 hover:text-gray-700"></i>
            </form>
          </div>

          {/* Filter Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleFilterMenu("all")}
              className={`px-4 py-2 rounded-full font-semibold focus:outline-none transition-all duration-300 ease-in-out transform hover:scale-110 ${
                activeFilter === "all"
                  ? "bg-[#A79277] text-white"
                  : "bg-[rgba(167,146,119,0.2)] text-gray-500 "
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterMenu("makanan")}
              className={`px-4 py-2 rounded-full font-semibold focus:outline-none transition-all duration-300 ease-in-out transform hover:scale-110 ${
                activeFilter === "makanan"
                  ? "bg-[#A79277] text-white"
                  : "bg-[rgba(167,146,119,0.2)] text-gray-500 "
              }`}
            >
              Makanan
            </button>
            <button
              onClick={() => handleFilterMenu("minuman")}
              className={`px-4 py-2 rounded-full font-semibold focus:outline-none transition-all duration-300 ease-in-out transform hover:scale-110 ${
                activeFilter === "minuman"
                  ? "bg-[#A79277] text-white"
                  : "bg-[rgba(167,146,119,0.2)] text-gray-500 "
              }`}
            >
              Minuman
            </button>
          </div>
        </header>

        <section data-aos="slide-up" className="mb-4 px-10">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">Menu</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-5 text-left">
            {menu.map((item, index) => (
              <Link to={`/Infomenu/${item.nama_menu}`} key={index}>
                <div className="bg-[rgba(167,146,119,0.2)] p-3 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 duration-300">
                  <img
                    src={
                      publicUrl +
                      "/images/menu/" +
                      (item.gambar || "default-image.jpg")
                    }
                    alt={item.nama_menu}
                    className="w-full h-24 sm:h-28 md:h-40 object-cover rounded-lg mb-2"
                  />
                  <h3 className="text-sm font-bold truncate">
                    {item.nama_menu}
                  </h3>
                  <p className="text-sm">{formatRupiah(item.harga)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default App;
