import React from "react";
import { Link, useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation(); // Mendapatkan path URL saat ini

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[rgba(167,146,119,0.2)] backdrop-blur-md p-4 flex justify-around">
      {[
        { name: "Home", icon: "fa-home", link: "/Beranda" },
        { name: "Menu", icon: "fa-solid fa-utensils", link: "/cari" },
        { name: "Keranjang", icon: "fa-shopping-cart", link: "/Keranjang" },
        { name: "Profil", icon: "fa-user", link: "/Profil" },
      ].map((item, index) => (
        <Link
          to={item.link}
          key={index}
          className="flex flex-col items-center group transform transition-transform duration-200 ease-in-out"
        >
          <i
            className={`fas ${item.icon} ${
              location.pathname === item.link
                ? "text-[#6E4E3A]" // Warna aktif
                : "text-gray-500" // Warna default
            } group-hover:text-[#A79277] group-hover:scale-110`} // Membuat lebih besar saat dihover
          ></i>
          <span
            className={`text-xs ${
              location.pathname === item.link
                ? "text-[#6E4E3A]" // Warna aktif
                : "text-gray-500" // Warna default
            } group-hover:text-[#A79277] group-hover:scale-110`}
          >
            {item.name}
          </span>
        </Link>
      ))}
    </footer>
  );
};

export default Footer;
