import "./App.css";
import Judul from "./pages/Admin/Tampilanpembuka.jsx";
import Login from "./pages/Admin/Login.jsx";
import Lupapassword from "./pages/Admin/Lupapassword.jsx";
import Passwordbaru from "./pages/Admin/Passwordbaru.jsx";
import Beranda from "./pages/Admin/Beranda.jsx";
import Cari from "./pages/Admin/Cari.jsx";
import Infopromo from "./pages/Admin/Infopromo.jsx";
import Infomenu from "./pages/Admin/Infomenu.jsx";
import Keranjang from "./pages/Admin/Keranjang.jsx";
import Pembayaran from "./pages/Admin/Pembayaran.jsx";
import Kelolamenu from "./pages/Admin/Kelolamenu.jsx";
import Tambahmenu from "./pages/Admin/Tambahmenu.jsx";
import Profil from "./pages/Admin/Profil.jsx";
import Infoakun from "./pages/Admin/Infoakun.jsx";
import Aktivitas from "./pages/Admin/Aktivitas.jsx";
import Tambahpromo from "./pages/Admin/Tambahpromo.jsx";
import Promo from "./pages/Admin/Promo.jsx";
import Editmenu from "./pages/Admin/Editmenu.jsx";
import Menup from "./pages/Pelanggan/Menu.jsx";
import Berandap from "./pages/Pelanggan/Beranda.jsx";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Define all the routes and their respective components */}
          <Route path="/" element={<Judul />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Lupapassword" element={<Lupapassword />} />
          <Route path="/Passwordbaru" element={<Passwordbaru />} />
          <Route path="/Beranda" element={<Beranda />} />
          <Route path="/Cari" element={<Cari />} />
          <Route path="/Infopromo/:id" element={<Infopromo />} />
          <Route path="/Infomenu/:nama" element={<Infomenu />} />
          <Route path="/Keranjang" element={<Keranjang />} />
          <Route path="/Pembayaran" element={<Pembayaran />} />
          <Route path="/Kelolamenu" element={<Kelolamenu />} />
          <Route path="/Tambahmenu" element={<Tambahmenu />} />
          <Route path="/Profil" element={<Profil />} />
          <Route path="/Infoakun" element={<Infoakun />} />
          <Route path="/Aktivitas" element={<Aktivitas />} />
          <Route path="/Promo" element={<Promo />} />
          <Route path="/Tambahpromo" element={<Tambahpromo />} />
          <Route path="/Editmenu/:id_menu" element={<Editmenu />} />
          <Route path="/Menup" element={<Menup />} />
          <Route path="/Berandap" element={<Berandap />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
