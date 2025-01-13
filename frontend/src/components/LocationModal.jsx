import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, SearchIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LocationModal = ({ onClose, onLocationFetched }) => {
  const navigate = useNavigate();
  
  const handleEnableLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationFetched({ lat: latitude, lng: longitude }); 
        onClose();
        navigate("/mapview"); 
      },
      (error) => {
        console.error("Error fetching location: ", error);
        alert("Unable to fetch location. Please try again.");
      }
    );
  };

  const handleSearchManually = () => {
    navigate("/mapview");
  };

  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: "0%", opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 120 }}
      className="fixed inset-x-0 bottom-0 flex justify-center items-end p-2"
    >
      <div className="bg-blue-600 rounded-lg p-3 w-full max-w-[320px] text-white text-center shadow-lg">
        <div className="flex justify-center mb-1.5">
          <MapPin size={24} className="text-white" />
        </div>
        <h2 className="text-base font-semibold mb-1">Location Permission is off</h2>
        <p className="text-[11px] mb-3 px-2">
          We need your location to find the nearest store & provide you a seamless delivery experience
        </p>
        <div className="space-y-2">
          <Button
            onClick={handleEnableLocation}
            className="w-full bg-red-500 text-white hover:bg-red-700 text-xs py-1.5 h-8"
          >
            Enable Location
          </Button>
          <Button
            onClick={handleSearchManually}
            variant="outline"
            className="w-full border-white text-red-500 bg-white hover:bg-red-50 hover:text-red-600 flex items-center justify-center gap-1.5 text-xs py-1.5 h-8"
          >
            <SearchIcon size={14} className="text-red-500" />
            <span>Search Your Location Manually</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default LocationModal;