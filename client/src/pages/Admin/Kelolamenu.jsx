import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoginValidation from "./components/LoginValidation";
import AOS from "aos";
import "aos/dist/aos.css";

const App = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  const publicUrl = process.env.PUBLIC_URL;

  const [menuItems, setMenuItems] = useState([]);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    async function fetchData() {
      try {
        const response = await axios.get(
          `${apiUrl}/Menu/tampilMenu/All`
        );
        setMenuItems(response.data);
      } catch (error) {
        console.error("Error fetching menu data:", error);
      }
    }

    fetchData();
  }, [apiUrl]);

  const MenuItem = ({ image, title,stok, onDelete, onEdit, onView }) => {
    return (
      <div className="bg-[rgba(167,146,119,0.2)] p-4 rounded-lg shadow-md relative flex flex-col items-center justify-between overflow-hidden">
        {/* Bagian gambar */}
        <div className="flex justify-center items-center mb-4 w-full">
          <img
            src={image}
            alt={title}
            className="object-cover rounded-lg w-full h-auto max-h-64"
          />
        </div>

        {/* Judul menu */}
        <h3 className="text-left font-bold mb-2 text-[10px] sm:text-[12px]">
          {title}
        </h3>
        <div className="absolute top-2 right-2 bg-[#A79277] text-white w-10 h-10 rounded-full flex items-center justify-center text-xs">
          {stok}
        </div>

        {/* Tombol aksi */}
        <div className="flex flex-row item-center justify-center w-full mt-2 space-x-[4px]">
          <button
            className="bg-[rgba(167,146,119,0.7)] text-white px-[5px] py-[2px] rounded-full flex items-center text-[8px] sm:text-[12px] hover:scale-105 transform transition duration-300"
            onClick={() => onView(title)}
          >
            Lihat <i className="fas fa-eye ml-[3px] text-[8px]"></i>
          </button>
          <button
            className="bg-blue-500 text-white px-[5px] py-[2px] rounded-full flex items-center text-[8px] sm:text-[12px] hover:scale-105 transform transition duration-300"
            onClick={() => onEdit()} 
          >
            Ubah <i className="fas fa-edit ml-[3px] text-[8px]"></i>
          </button>

          <button
            className="bg-red-500 text-white px-[5px] py-[2px] rounded-full flex items-center text-[8px] sm:text-[12px] hover:scale-105 transform transition duration-300"
            onClick={() => onDelete()}
          >
            Hapus <i className="fas fa-trash ml-[3px] text-[8px]"></i>
          </button>
        </div>
      </div>
    );
  };

  const handleBackClick = () => {
    navigate("/profil");
  };

  const handleDeleteMenu = async (id_menu) => {
    try {
      const response = await axios.delete(
       ` ${apiUrl}/menu/hapusMenu/${id_menu}`
      );
      if (response.data.success) {
        setMenuItems(menuItems.filter((menu) => menu.id_menu !== id_menu));
        setDeleteModalOpen(false); 
      }
    } catch (error) {
      console.error("Error deleting menu:", error);
    }
  };


  const handleEditClick = (id_menu) => {
    navigate(`/Editmenu/${id_menu}`); 
  };

  const handleViewClick = (title) => {
    navigate(`/infomenu/${title}`);
  };

  const handleAddMenuClick = () => {
    navigate("/tambahmenu");
  };

  return (
    <div className="p-6 relative max-w-full overflow-hidden">
      {/* Tombol kembali */}
      <div className="absolute left-4 top-4 z-10 ">
        <button
          className="w-10 h-10 bg-[rgba(167,146,119,0.2)] rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transform transition duration-300"
          onClick={handleBackClick}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
      </div>

      {/* Header halaman */}
      <div className="flex items-center mb-6">
        <h1 className="text-xl font-bold mx-auto">Kelola Menu</h1>
      </div>

      {/* Header daftar menu */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Daftar Menu</h2>
        <button
          className="bg-[#A79277] text-white px-3 py-1 rounded-full flex items-center hover:scale-105 transform transition duration-300"
          onClick={handleAddMenuClick}
        >
          Tambah Menu <i className="fas fa-plus ml-2"></i>
        </button>
      </div>

      {/* Daftar menu */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
        {menuItems.map((item) => (
          <MenuItem
            key={item.id_menu}
            image={publicUrl + "/images/menu/" + item.gambar}
            title={item.nama_menu}
            stok={item.stok}
            onDelete={() => {
              setItemToDelete(item.id_menu);
              setDeleteModalOpen(true);
            }}
            onEdit={() => handleEditClick(item.id_menu)}
            onView={handleViewClick}
          />
        ))}
      </div>

      {/* Modal konfirmasi hapus */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            <h2 className="text-lg font-bold mb-4">
              Yakin ingin menghapus menu?
            </h2>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleDeleteMenu(itemToDelete)} 
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