import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginValidation from "./components/LoginValidation";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

AOS.init({ duration: 400, once: true });
const App = () => {
  const navigate = useNavigate();
  const publicUrl = process.env.PUBLIC_URL;
  const apiUrl = process.env.REACT_APP_API_URL

  const [menuItems, setMenuItems] = useState([]);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const response = await axios.get(`${apiUrl}/Promo/tampilPromo/All`)

      const promises = response.data.map((item) => {
        return axios.get(`${apiUrl}/Menu//tampilMenu/Byid/${item.id_menu}`);
      });

      const responses = await Promise.all(promises);
      const daftarmenu = responses.map((respon) => respon.data);


      const promos = response.data.map((item, index) => {
        return {
          ...item,
          menu: daftarmenu[index],
        };
      });
      setMenuItems(promos);
    }
    fetchData();
  },[apiUrl]);
  const handleBackClick = () => {
    navigate("/Profil");
  };

  const handleDeleteClick = (id) => {
    setItemToDelete(id); 
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    const response = await axios.delete(
      `${apiUrl}/Promo/hapusPromo/${itemToDelete}`
    );
    if (response.data.success) {
      setMenuItems(menuItems.filter((item) => item.id !== itemToDelete)); 
      setDeleteModalOpen(false);
    } else {
      console.error("Error deleting promo");
    }
  };

  const handleViewClick = (id) => {
    navigate(`/infopromo/${id}`);
  };

  const handleAddpromoClick = () => {
    navigate("/tambahpromo");
  };

  const MenuItem = ({ id, image, discount, title, onDelete, onView }) => {
    return (
      <div className="bg-[rgba(167,146,119,0.2)] p-4 rounded-lg shadow-md relative flex flex-col items-center justify-between overflow-hidden">
        {/* Image section */}
        <div className="bg-gradient-to-r from-[rgba(0,0,0)] to-[rgba(167,146,119)] rounded-3xl p-4 flex items-center justify-between m-3 w-40 h-20">
          <div className="text-white flex flex-col justify-center">
            <div className="font-bold">{discount}%</div>
          </div>
          <div>
            <img
              src={image}
              className=" h-25 "
              alt={title}
            />
          </div>
        </div>
        {/* Title */}
        <h3 className="text-left font-bold mb-2 mt-10 text-[10px] sm:text-[12px]">
          {title}
        </h3>
        {/* Button container */}
        <div className="flex flex-row item-center justify-center w-full mt-2 space-x-[4px]">
          <button
            className="bg-gray-400 text-white px-[5px] py-[2px] rounded-full flex items-center text-[8px] sm:text-[12px] hover:scale-105 transform transition duration-300"
            onClick={() => onView(id)}
          >
            Lihat <i className="fas fa-eye ml-[3px] text-[8px]"></i>
          </button>
          <button
            className="bg-red-500 text-white px-[5px] py-[2px] rounded-full flex items-center text-[8px] sm:text-[12px] hover:scale-105 transform transition duration-300"
            onClick={() => onDelete(id)}
          >
            Hapus <i className="fas fa-trash ml-[3px] text-[8px]"></i>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 relative max-w-full overflow-hidden">
      {/* Back button */}
      <div className="absolute left-4 top-4 z-10">
        <button
          className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer"
          onClick={handleBackClick}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
      </div>

      {/* Page header */}
      <div className="flex items-center mb-6">
        <h1 className="text-xl font-bold mx-auto">Kelola Promo</h1>
      </div>

      {/* Menu section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Daftar Promo</h2>
        <button
          className="bg-[#A79277] text-white px-3 py-1 rounded-full flex items-center hover:scale-105 transform transition duration-300"
          onClick={handleAddpromoClick}
        >
          Tambah Promo <i className="fas fa-plus ml-2"></i>
        </button>
      </div>

      {/* Menu items grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
        {menuItems.map((item) => (
          <MenuItem
            key={item.id}
            id = {item.id}
            image={publicUrl + "/images/menu/" + item.menu.gambar}
            discount={item.diskon}
            title={item.nama_promo}
            onDelete={handleDeleteClick}
            onView={handleViewClick}
          />
        ))}
      </div>

      {/* Delete confirmation modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            <h2 className="text-lg font-bold mb-4">
              Yakin ingin menghapus menu?
            </h2>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmDelete}
                className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600"
              >
                IYA
              </button>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600"
              >
                TIDAK
              </button>
            </div>
          </div>
        </div>
      )}
      <LoginValidation />
    </div>
  );
};

export default App;
