import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

function App() {
  const navigate = useNavigate();
  const publicUrl =process.env.PUBLIC_URL;

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3000);

    return () => clearTimeout(timer); 
  }, [navigate]);

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-white overflow-hidden">
      <div 
      data-aos="slide-down"
      className="flex flex-col items-center mb-4 animate-fade-in">
        <img
          src={`${publicUrl}/images/menu/Sego Resek Jingkrak Hitam.png`}
          alt="Sego Resek Jingkrak Hitam"
          className="w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 mx-auto mb-2 object-cover"
        />
      </div>
      <div 
      data-aos="slide-up"
      className="absolute bottom-0 w-full h-1/3 bg-[#b69a7f] rounded-t-[60%]"></div>
    </div>
  );
}

export default App;
