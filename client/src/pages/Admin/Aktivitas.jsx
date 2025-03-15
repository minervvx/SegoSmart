import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoginValidation from "./components/LoginValidation";
import jsPDF from "jspdf";
import "jspdf-autotable";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

const App = () => {
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const navigate = useNavigate();
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDateFrom, setSelectedDateFrom] = useState("");
  const [selectedDateTo, setSelectedDateTo] = useState("");
  const [riwayats, setRiwayats] = useState([]);
  const [totalHarga, setTotalHarga] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const publicUrl = process.env.PUBLIC_URL;
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    async function fetchingData() {
      let riwayatList = null;
      if (from && to) {
        riwayatList = await axios.get(
          `${apiUrl}/riwayat/tampilRiwayat/filter/?from=${from}&to=${to}`
        );
      } else {
        riwayatList = await axios.get(`${apiUrl}/riwayat/tampilRiwayat/All`);
      }

      const total = riwayatList.data.reduce(
        (accumulator, item) => accumulator + item.total_harga,
        0
      );
      const rating = riwayatList.data.reduce(
        (accumulator, item) => accumulator + item.kepuasan,
        0
      );

      setTotalHarga(total);
      setAverageRating(rating / riwayatList.data.length);

      const promisesItem = riwayatList.data.map((item) => {
        return axios.get(`${apiUrl}/ItemPesanan/itemPesanan/${item.id}`);
      });

      const responsesItem = await Promise.all(promisesItem);

      const items = responsesItem.map((response) => response.data);

      const promisesMenu = items.map(async (item) => {
        return await Promise.all(
          item.map((i) => {
            return axios.get(`${apiUrl}/Menu//tampilMenu/Byid/${i.id_menu}`);
          })
        );
      });

      const responsesMenu = await Promise.all(promisesMenu);

      const menus = responsesMenu.map((responseArray) =>
        responseArray
          .filter((response) => response.data)
          .map((response) => response.data)
      );

      const riwayats = riwayatList.data.map((item, index) => {
        const itemMenus = items[index] || [];
        const menuDetails = menus[index] || [];
        return {
          ...item,
          item: itemMenus.filter(Boolean),
          menu: menuDetails.filter(Boolean),
        };
      });
      setRiwayats(riwayats);
    }

    fetchingData();
  }, [apiUrl, from, to]);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(number);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setPopupVisible(true);
  };

  const closePopup = () => {
    setPopupVisible(false);
    setSelectedItem(null);
  };

  const handleBackClick = () => {
    navigate("/Profil");
  };

  const handleDateFromChange = (event) =>
    setSelectedDateFrom(event.target.value);
  const handleDateToChange = (event) => setSelectedDateTo(event.target.value);

  const handleFilter = () => {
    if (!selectedDateFrom && !selectedDateTo) {
      window.location.href = `/aktivitas`;
      return;
    }
    if (!selectedDateFrom || !selectedDateTo) {
      alert("isi kedua tanggal");
      return;
    }

    window.location.href = `/aktivitas/?from=${selectedDateFrom}&to=${selectedDateTo}`;
  };

  const formatDateTime = (mysqlDatetime) => {
    const date = new Date(mysqlDatetime);
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return new Intl.DateTimeFormat("id-ID", options).format(date);
  };

  const handlePrintToPDF = () => {
    const doc = new jsPDF("p", "mm", "a3");
    let y = 10;
  
    doc.setFont("calibri", "normal");
  
    doc.setFontSize(18);
    doc.setFont("calibri", "bold");
    doc.text("Laporan Aktivitas", 148.5, y, { align: "center" });
    y += 15;
  
    const totalTransaksi = riwayats.length;
    const grandTotalHarga = riwayats.reduce((total, riwayat) => total + riwayat.total_harga, 0);
  
    const menuCounts = riwayats.flatMap((riwayat) =>
      riwayat.item.map((item, index) => ({
        namaMenu: riwayat.menu[index]?.nama_menu || "-",
        jumlah: item.jumlah,
      }))
    ).reduce((acc, item) => {
      acc[item.namaMenu] = (acc[item.namaMenu] || 0) + item.jumlah;
      return acc;
    }, {});
  
    const menuPalingPopuler = Object.entries(menuCounts).sort((a, b) => b[1] - a[1])[0] || ["-", 0];
  
    const rataRataPendapatan = grandTotalHarga / totalTransaksi;
  
    const uniqueDates = [...new Set(riwayats.map((riwayat) => formatDateTime(riwayat.createdAt, "yyyy-MM-dd")))];
const rataRataPendapatanPerHari = grandTotalHarga / uniqueDates.length;

const monthlyTotals = riwayats.reduce((acc, riwayat) => {
  const monthYear = formatDateTime(riwayat.createdAt, "yyyy-MM");
  acc[monthYear] = (acc[monthYear] || 0) + riwayat.total_harga;
  return acc;
}, {});

const rataRataPendapatanPerBulan = 
  Object.values(monthlyTotals).reduce((sum, total) => sum + total, 0) / Object.keys(monthlyTotals).length;

  
    const uniqueYears = [...new Set(riwayats.map((riwayat) => new Date(riwayat.createdAt).getFullYear()))];
    const rataRataPendapatanPerTahun = grandTotalHarga / uniqueYears.length;
  
    doc.setFontSize(12);
    doc.setFont("calibri", "normal");
    doc.text(`Total Transaksi: ${totalTransaksi}`, 10, y);
    y += 8;
    doc.text(`Total Penjualan: ${formatRupiah(grandTotalHarga)}`, 10, y);
    y += 8;
    doc.text(`Menu Paling Populer: ${menuPalingPopuler[0]} (${menuPalingPopuler[1]} kali dipesan)`, 10, y);
    y += 8;
    doc.text(`Rata-rata Pendapatan per Transaksi: ${formatRupiah(rataRataPendapatan)}`, 10, y);
    y += 8;
    doc.text(`Rata-rata Pendapatan per Hari: ${formatRupiah(rataRataPendapatanPerHari)}`, 10, y);
    y += 8;
    doc.text(`Rata-rata Pendapatan per Bulan: ${formatRupiah(rataRataPendapatanPerBulan)}`, 10, y);
    y += 8;
    doc.text(`Rata-rata Pendapatan per Tahun: ${formatRupiah(rataRataPendapatanPerTahun)}`, 10, y);
    y += 15;
  
    let printedRiwayatIds = [];
  
    const tableData = riwayats.flatMap((riwayat, index) =>
      riwayat.item.map((item, itemIndex) => {
        const menu = riwayat.menu[itemIndex];
  
        let shouldPrintDateAndTotal = true;
        if (printedRiwayatIds.includes(riwayat.id)) {
          shouldPrintDateAndTotal = false;
        } else {
          printedRiwayatIds.push(riwayat.id);
        }
  
        const dateText = shouldPrintDateAndTotal ? formatDateTime(riwayat.createdAt) : "";
        const totalHargaText = shouldPrintDateAndTotal ? formatRupiah(riwayat.total_harga) : "";
  
        return {
          no: `${index + 1}-${itemIndex + 1}`,
          date: dateText,
          menuName: menu?.nama_menu || "-",
          jumlah: item.jumlah,
          subTotal: formatRupiah(item.sub_total),
          priceBeforeDiscount: formatRupiah(item.sub_total - (item.sub_total * item.diskon) / 100),
          discount: item.diskon + "%",
          totalPrice: totalHargaText,
          shouldPrintDateAndTotal,
        };
      })
    );
  
    doc.autoTable({
      head: [
        [
          "No",
          "Tanggal",
          "Nama Menu",
          "Jumlah",
          "Subtotal",
          "Harga Sebelum Diskon",
          "Total Diskon",
          "Total Harga",
        ],
      ],
      body: tableData.map((row) => [
        row.no,
        row.shouldPrintDateAndTotal ? row.date : "",
        row.menuName,
        row.jumlah,
        row.subTotal,
        row.priceBeforeDiscount,
        row.discount,
        row.shouldPrintDateAndTotal ? row.totalPrice : "",
      ]),
      foot: [
        [
          "",
          "",
          "",
          "",
          "",
          "",
          "Total Keseluruhan",
          formatRupiah(grandTotalHarga),
        ],
      ],
      startY: y,
      styles: {
        fontSize: 11,
        font: "calibri",
        cellPadding: 5,
        valign: "middle",
        halign: "center",
        lineColor: [229, 231, 235],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      footStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      tableLineWidth: 0.25,
      tableLineColor: [229, 231, 235],
    });
  
    doc.save("Laporan_Aktivitas.pdf");
  };
  

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto p-4 sm:p-6 md:p-8 lg:max-w-3xl">
      <div
        data-aos="slide-down"
        className="fixed top-0 left-0 w-full pb-2 z-40 bg-white"
      >
        <div className="flex items-center justify-between w-full">
          <button
            className="w-10 h-10 bg-[rgba(167,146,119,0.2)] rounded-full flex items-center justify-center cursor-pointer mt-4 ml-4 hover:scale-105 transform transition duration-300"
            onClick={handleBackClick}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <h1 className="flex-grow text-center font-bold text-xl sm:text-2xl mt-4 mr-[60px]">
            Aktivitas
          </h1>
        </div>
        <div className="mt-4 flex justify-center space-x-4">
          <div>
            <label
              htmlFor="dateFrom"
              className="text-sm sm:text-base font-semibold"
            >
              Dari Tanggal:
            </label>
            <input
              id="dateFrom"
              type="date"
              value={selectedDateFrom}
              onChange={handleDateFromChange}
              className="ml-2 py-1 px-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label
              htmlFor="dateTo"
              className="text-sm sm:text-base font-semibold"
            >
              Sampai Tanggal:
            </label>
            <input
              id="dateTo"
              type="date"
              value={selectedDateTo}
              onChange={handleDateToChange}
              className="ml-2 py-1 px-2 border border-gray-300 rounded"
            />
          </div>
          <button
            className="flex items-center px-4 py-2 bg-[#A79277] text-white rounded-lg shadow hover:scale-105 transform transition duration-300"
            onClick={handleFilter}
          >
            <i className="fas fa-search"></i>
          </button>
          <button
            className="bg-[#A79277] text-white px-4 py-2 rounded-lg flex items-center justify-center hover:scale-105 transform transition duration-300"
            onClick={handlePrintToPDF}
          >
            <i className="fas fa-print"></i>
          </button>
        </div>
      </div>

      <div data-aos="slide-up" className="flex-grow pt-2">
        <div className="mt-20">
          <div className="space-y-4 pb-24">
            {riwayats.map((riwayat, index) => (
              <div
                key={index}
                className={`bg-[rgba(167,146,119,0.2)] p-4 rounded-lg flex sm:p-6 cursor-pointer ${
                  index === riwayats.length - 1 ? "mb-4" : ""
                }`}
                onClick={() => handleItemClick(riwayat)}
              >
                <img
                  src={
                    riwayat.menu?.[0]?.gambar
                      ? `${publicUrl}/images/menu/${riwayat.menu[0].gambar}`
                      : `${publicUrl}/images/default-image.jpg`
                  }
                  alt="Food item"
                  className="w-16 h-16 rounded-lg mr-4 sm:w-20 sm:h-20"
                />
                <div className="flex-grow">
                  <h2 className="font-bold text-sm sm:text-base text-left">
                    {riwayat.menu &&
                      riwayat.menu.map((m, index) => {
                        if (m && m.nama_menu) {
                          return index !== riwayat.menu.length - 1
                            ? `${m.nama_menu}, `
                            : `${m.nama_menu}.`;
                        }
                        return null;
                      })}
                  </h2>

                  <p className="text-gray-600 text-xs sm:text-sm text-left">
                    {formatDateTime(riwayat.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm sm:text-base">
                    {formatRupiah(riwayat.total_harga)}
                  </p>
                  <div className="flex justify-end space-x-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <i
                        key={i}
                        className={`fas fa-star ${
                          i < riwayat.kepuasan
                            ? "text-yellow-500"
                            : "text-gray-400"
                        }`}
                      ></i>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 mx-auto sm:w-[calc(100%-2rem)] max-w-3xl pt-2 pb-4 z-40 bg-white">
        <div className="space-y-2">
          <p className="font-bold text-sm sm:text-base bg-[rgba(167,146,119,0.2)] p-2 rounded">
            Rata-rata rating
            <span className="text-yellow-500">
              {Array.from({ length: 5 }, (_, i) => (
                <i
                  key={i}
                  className={`fas fa-star ${
                    i < averageRating ? "text-yellow-500" : "text-gray-400"
                  }`}
                ></i>
              ))}
            </span>
          </p>
          <p className="font-bold text-sm sm:text-base bg-[rgba(167,146,119,0.2)] p-2 rounded">
            Total {formatRupiah(totalHarga)}
          </p>
        </div>
      </div>
      {isPopupVisible && selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            <div className="absolute top-4 left-4 text-sm font-bold">
              {selectedItem.id}
            </div>
            <button
              className="absolute top-4 right-4 text-gray-500"
              onClick={closePopup}
            >
              <i className="fas fa-times"></i>
            </button>
            <div className="text-center mb-4">
              <p className="font-bold text-lg">{selectedItem.date}</p>
            </div>
            <div>
              <p className="font-bold mb-2">Ringkasan Pesanan</p>
              {selectedItem.item.map((i, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span>
                    {selectedItem.menu[index].nama_menu} x{i.jumlah}
                  </span>
                  <span>
                    {formatRupiah(i.sub_total)}(-
                    {(i.sub_total * i.diskon) / 100})
                  </span>
                </div>
              ))}
              <br />
              <div className="flex justify-between items-center font-bold">
                <span>Total Awal</span>
                <span>{formatRupiah(selectedItem.total_temp)}</span>
              </div>
              <div className="flex justify-between items-center font-bold">
                <span>Total Diskon</span>
                <span>{formatRupiah(selectedItem.total_diskon)}</span>
              </div>
              <div className="flex justify-between items-center font-bold">
                <span>Total</span>
                <span>{formatRupiah(selectedItem.total_harga)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <LoginValidation />
    </div>
  );
};

export default App;
