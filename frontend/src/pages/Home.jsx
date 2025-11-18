import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import sedanImg from "../assets/sedan.png";
import suvImg from "../assets/suv.jpg";
import pickupImg from "../assets/pickup.jpg";
import coupeImg from "../assets/coupes.webp";

export default function Home() {
  const { isAuthed } = useAuth();
  const navigate = useNavigate();

  function handleSellClick(e) {
    e.preventDefault();
    if (isAuthed) {
      navigate("/sell");
    } else {
      navigate("/signin");
    }
  }
  const bodyTypes = [
    { label: "Sedan", value: "Sedan", image: sedanImg },
    { label: "SUV", value: "SUV", image: suvImg },
    { label: "Truck", value: "Truck", image: pickupImg },
    { label: "Coupe", value: "Coupe", image: coupeImg },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
            <span className="text-sm font-semibold text-zinc-900">🚗 Trusted Car Marketplace</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-zinc-900 mb-6 leading-tight">
            Find Your
            <span className="block text-yellow-800">Car Today</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-800 max-w-3xl mx-auto mb-8 font-medium">
            Browse through used cars. Simple, fast and reliable.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/browse"
              className="px-8 py-4 bg-zinc-900 text-white rounded-xl font-semibold text-lg hover:bg-zinc-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Browse All Cars
            </Link>
            <button
              onClick={handleSellClick}
              className="px-8 py-4 bg-yellow-400 text-zinc-900 rounded-xl font-semibold text-lg hover:bg-yellow-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Sell Your Car
            </button>
            <Link
              to="/signup"
              className="px-8 py-4 bg-white text-zinc-900 rounded-xl font-semibold text-lg hover:bg-zinc-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      <div className="py-20 bg-gradient-to-b from-zinc-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4">
              Browse by Body Type
            </h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              Find the perfect car that matches your lifestyle and needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {bodyTypes.map((type, index) => (
              <Link
                key={type.value}
                to={`/browse?body=${type.value}`}
                className="group relative overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                  <img
                    src={type.image}
                    alt={type.label}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-zinc-900 text-center group-hover:text-yellow-600 transition-colors duration-200">
                    {type.label}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <footer className="bg-zinc-900 text-zinc-400 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} iWantCar. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
