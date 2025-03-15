import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import LoginValidation from "./components/LoginValidation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

const AddPromo = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPromoExists, setIsPromoExists] = useState(false);
  const [Menu, setMenu] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;

  function closeModal() {
    setIsModalOpen(false);
    setIsPromoExists(false);
  }

  const handleBackClick = () => {
    navigate("/promo");
  };

  useEffect(() => {
    AOS.init({ duration: 400, once: true });
    async function fetchData() {
      const response = await axios.get(`${apiUrl}/Menu/tampilMenu/All`);
      setMenu(response.data);
    }
    fetchData();
  }, [apiUrl]);

  const initialValues = {
    id_menu: "",
    nama_promo: "",
    diskon: "",
    deskripsi: "",
  };

  const validationSchema = Yup.object().shape({
    id_menu: Yup.string().required("Menu harus dipilih."),
    nama_promo: Yup.string().required("Nama promo tidak boleh kosong."),
    diskon: Yup.number("Diskon harus berupa angka.").required(
      "Diskon tidak boleh kosong."
    ),
    deskripsi: Yup.string().required("Deskripsi tidak boleh kosong."),
  });

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(`${apiUrl}/Promo/tambahPromo`, data);

      if (
        response.data.success === false &&
        response.data.message === "Promo sudah ada untuk menu ini"
      ) {
        setIsPromoExists(true);
      } else if (response.data.success) {
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error adding promo:", error);
      setIsPromoExists(true);
    }
  };

  return (
    <div className="">
      {/* Tombol Back di kiri atas */}
      <div className="absolute left-4 top-4 z-10">
        <button
          className="w-10 h-10 bg-[rgba(167,146,119,0.2)] rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transform transition duration-300"
          onClick={handleBackClick}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
            <div className="flex items-center justify-center mb-4">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-green-500 text-4xl"
              />
            </div>
            <h2 className="text-lg font-bold">Promo berhasil ditambahkan</h2>
            <p className="text-gray-600 mt-2">
              Promo telah berhasil ditambahkan ke daftar promo Anda.
            </p>
            <button
              onClick={() => {
                closeModal();
                navigate("/promo");
              }}
              className="mt-6 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Lihat di Promo
            </button>
          </div>
        </div>
      )}

      {/* Modal jika promo sudah ada */}
      {isPromoExists && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[100]">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
            <div className="flex items-center justify-center mb-4">
              <FontAwesomeIcon
                icon={faExclamationCircle}
                className="text-red-500 text-4xl"
              />
            </div>
            <h2 className="text-lg font-bold">Promo Sudah Ada</h2>
            <p className="text-gray-600 mt-2">
              Promo dengan nama yang sama sudah ada di daftar promo Anda.
            </p>
            <button
              onClick={closeModal}
              className="mt-6 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        Menu={Menu}
      >
        <Form>
          <div className="space-y-6 px-20">
            <h2 className="text-lg font-bold text-center sm:text-xl pt-5">
              Tambahkan Promo & Stok
            </h2>
            <div className="space-y-4">
              <h3 className="text-md font-bold text-left mt-4">
                Informasi Promo
              </h3>

              {/* Nama Promo */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-4">
                  <label className="block font-semibold w-full sm:w-1/4 text-left">
                    Nama Promo
                  </label>

                  <div className="w-full sm:w-3/4">
                    <Field
                      type="text"
                      name="nama_promo"
                      placeholder="Masukkan Nama promo"
                      className="w-full p-2 mt-1 bg-[rgba(167,146,119,0.2)] rounded-md focus:outline-none"
                    />

                    <ErrorMessage
                      name="nama_promo"
                      component="span"
                      className="text-red-500 text-sm block mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Potongan Harga */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-4">
                  <label className="block font-semibold w-full sm:w-1/4 text-left">
                    Diskon _%
                  </label>

                  <div className="w-full sm:w-3/4">
                    <Field
                      type="text"
                      name="diskon"
                      placeholder="Masukkan Potongan Harga"
                      className="w-full p-2 mt-1 bg-[rgba(167,146,119,0.2)] rounded-md focus:outline-none"
                    />

                    <ErrorMessage
                      name="diskon"
                      component="span"
                      className="text-red-500 text-sm block mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Daftar Menu */}

              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-4">
                  <label className="block font-semibold w-full sm:w-1/4 text-left">
                    Daftar Menu
                  </label>

                  <div className="w-full sm:w-3/4">
                    <Field
                      as="select"
                      name="id_menu"
                      className="w-full p-2 mt-1 bg-[rgba(167,146,119,0.2)] rounded-md"
                    >
                      <option value="">Pilih daftar menu</option>
                      {Menu.map((menu) => (
                        <option key={menu.id_menu} value={menu.id_menu}>
                          {menu.nama_menu}
                        </option>
                      ))}
                    </Field>

                    <ErrorMessage
                      name="id_menu"
                      component="span"
                      className="text-red-500 text-sm block mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-start space-x-4">
                  <label className="block font-semibold w-full sm:w-1/4 text-left">
                    Deskripsi
                  </label>

                  <div className="w-full sm:w-3/4">
                    <Field
                      as="textarea"
                      name="deskripsi"
                      placeholder="Masukkan Deskripsi"
                      className="w-full  p-2 mt-1 bg-[rgba(167,146,119,0.2)] rounded-md h-24 focus:outline-none"
                    />

                    <ErrorMessage
                      name="deskripsi"
                      component="span"
                      className="text-red-500 text-sm block mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-2">
            <button
              className="px-2 py-1 sm:px-3 sm:py-2 bg-[#A79277] text-white rounded-md hover:scale-105 transform transition duration-300"
              type="submit"
            >
              Tambah Promo
            </button>
          </div>
          </div>

          
          <LoginValidation />
        </Form>
      </Formik>
    </div>
  );
};

export default AddPromo;
