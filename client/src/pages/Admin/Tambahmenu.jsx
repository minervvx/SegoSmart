import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

AOS.init({ duration: 1000, once: true });
function App() {
  const navigate = useNavigate();
  const [gambar, setGambar] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;

  function handleBackClick() {
    navigate("/kelolamenu");
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const newFileName = Date.now() + "_" + file.name;

    const renamedFile = new File([file], newFileName, { type: file.type });

    return renamedFile;
  };

  const initialValues = {
    nama_menu: "",
    harga: 0,
    stok: 0,
    kategori: "",
    deskripsi: "",
    gambar: null,
  };

  const validationSchema = Yup.object().shape({
    nama_menu: Yup.string().required("Nama Menu tidak boleh kosong."),
    harga: Yup.number().min(1000, "Harga minimal Rp 1.000").required(),
    stok: Yup.number().required(),
    kategori: Yup.string().required("Pilih Kategori"),
    deskripsi: Yup.string().required("Deskripsi menu tidak boleh kosong."),
    gambar: Yup.mixed()
      .required()
      .test(
        "fileType",
        "File yang diunggah harus berupa gambar",
        (value) => value && value.type.startsWith("image/")
      ),
  });

  const onSubmit = async (data) => {
    try {
      const menu = await axios.post(`${apiUrl}/Menu/tambahMenu`, {
        nama_menu: data.nama_menu,
        harga: data.harga,
        stok: data.stok,
        kategori: data.kategori,
        deskripsi: data.deskripsi,
        gambar: data.gambar.name,
      });

      if (menu.data.error) {
        setError(menu.data.error);
      } else {
        const formData = new FormData();
        formData.append("gambar", data.gambar);

        const upload = await axios.post(
          `${apiUrl}/uploadGambar/Menu`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (!upload.data.error) {
          setSuccess(true);
        }
      }
    } catch (err) {
      console.error("Error during submission:", err);
      setError(true);
    }

    setGambar(false);
  };

  return (
    <div className="">
      <div className="absolute left-4 top-4 z-10">
        <button
          className="w-10 h-10 bg-[rgba(167,146,119,0.2)] rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transform transition duration-300"
          onClick={handleBackClick}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
      </div>

      {success && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[100]">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center sm:text-xl">
            <p>Berhasil Menambahkan Menu</p>
            <button
              className="bg-[#A79277] mt-10 text-white px-6 py-3 rounded-md"
              onClick={() => navigate("/kelolaMenu")}
            >
              kembali
            </button>
          </div>
        </div>
      )}
      {error && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[100]">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
            <div className="flex items-center justify-center mb-4">
              <FontAwesomeIcon
                icon={faExclamationCircle}
                className="text-red-500 text-4xl"
              />
            </div>
            <h2 className="text-lg font-bold">{error}</h2>
            <p className="text-gray-600 mt-2">
              Menu dengan nama yang sama sudah ada di daftar menu.
            </p>
            <button
              onClick={() => {
                setError(false);
                window.location.reload();
              }}
              className="mt-6 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
      <Formik
        className="mt-[6px]"
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ setFieldValue }) => (
          <Form className="space-y-4 px-20">
            <h2 className="text-lg font-bold text-center sm:text-xl pt-5">
              Tambahkan Menu & Stok
            </h2>
            <h3 className="text-md font-bold text-left">
              Informasi Menu & Stok
            </h3>
            <div className="flex items-center space-x-4">
              <label className="block font-semibold w-1/4 text-left">
                Nama Menu
              </label>

              <div className="w-3/4">
                <Field
                  type="text"
                  name="nama_menu"
                  placeholder="Masukkan Nama Menu"
                  className="w-full p-2 bg-[rgba(167,146,119,0.2)] rounded-md focus:outline-none"
                />

                <ErrorMessage
                  name="nama_menu"
                  component="span"
                  className="text-[#ff0000] text-sm block mt-1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="block font-semibold w-1/4 text-left">
                Harga
              </label>

              <div className="w-3/4">
                <Field
                  type="number"
                  name="harga"
                  placeholder="Masukkan Harga"
                  className="w-full p-2 bg-[rgba(167,146,119,0.2)] rounded-md focus:outline-none"
                />

                <ErrorMessage
                  name="harga"
                  component="span"
                  className="text-[#ff0000] text-sm block mt-1"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-4">
                <label className="block font-semibold w-1/4 text-left">
                  Stok
                </label>

                <div className="w-3/4">
                  <Field
                    type="number"
                    name="stok"
                    placeholder="Masukkan Stok"
                    className="w-full p-2 bg-[rgba(167,146,119,0.2)] rounded-md focus:outline-none"
                  />

                  <ErrorMessage
                    name="stok"
                    component="span"
                    className="text-[#ff0000] text-sm block mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-4">
                <label className="block font-semibold w-1/4 text-left">
                  Kategori
                </label>

                <div className="w-3/4">
                  <Field
                    as="select"
                    name="kategori"
                    className="w-full p-2 bg-[rgba(167,146,119,0.2)] rounded-md focus:outline-none cursor-pointer"
                  >
                    <option value="">Pilih Kategori</option>
                    <option value="makanan">Makanan</option>
                    <option value="minuman">Minuman</option>
                  </Field>

                  <ErrorMessage
                    name="kategori"
                    component="span"
                    className="text-[#ff0000] text-sm block mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex items-start space-x-4">
                <label className="block font-semibold w-1/4 text-left">
                  Deskripsi
                </label>

                <div className="w-3/4">
                  <Field
                    as="textarea"
                    name="deskripsi"
                    placeholder="Masukkan Deskripsi"
                    className="w-full p-2 bg-[rgba(167,146,119,0.2)] rounded-md focus:outline-none h-24"
                  />

                  <ErrorMessage
                    name="deskripsi"
                    component="span"
                    className="text-[#ff0000] text-sm block mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center">
              <label className="block font-semibold w-full sm:w-1/4 text-left">
                Foto Menu
              </label>

              <div className="w-full sm:w-3/4 ml-4">
                <div className="h-[100px] bg-[rgba(167,146,119,0.2)] rounded-md flex items-center justify-center relative">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    name="gambar"
                    onChange={(e) => {
                      setGambar(e.target.files[0]);
                      const newFile = handleFileChange(e);
                      setFieldValue("gambar", newFile);
                    }}
                  />
                  <label
                    htmlFor="menuPhoto"
                    className="cursor-pointer flex items-center"
                  >
                    {gambar ? (
                      <img
                        src={URL.createObjectURL(gambar)}
                        alt="menu"
                        className="h-[100px]"
                      />
                    ) : (
                      <>
                        <i className="fas fa-plus-circle text-gray-400 text-2xl"></i>
                        <span className="ml-2 text-gray-400">Pilih Gambar</span>
                      </>
                    )}
                  </label>
                </div>

                <ErrorMessage
                  name="gambar"
                  component="span"
                  className="text-[#ff0000] text-sm block mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-2">
              <button
                className="px-2 py-1 sm:px-3 sm:py-2 bg-[#A79277] text-white rounded-md hover:scale-105 transform transition duration-300"
                type="submit"
              >
                Tambah Menu
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default App;
