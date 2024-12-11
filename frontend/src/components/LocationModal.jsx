import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { SearchIcon } from "lucide-react";

const LocationModal = ({ onClose, onSearchManually, onLocationFetched }) => {
  const handleEnableLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationFetched({ lat: latitude, lng: longitude }); 
        onClose();
      },
      (error) => {
        console.error("Error fetching location: ", error);
        alert("Unable to fetch location. Please try again.");
      }
    );
  };

  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: "0%", opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 120 }}
      className="fixed inset-x-0 bottom-0 flex justify-center items-end pb-4"
    >
      <div className="bg-blue-600 rounded-lg p-6 w-11/12 max-w-md text-white text-center shadow-lg">
        <div className="flex justify-center mb-4">
          <MapPin size={48} className="text-white" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Location Permission is off</h2>
        <p className="text-sm mb-6">
          We need your location to find the nearest store & provide you a seamless delivery experience
        </p>
        <Button
          onClick={handleEnableLocation}
          className="w-full bg-red-500 text-white hover:bg-red-700 mb-4"
        >
          Enable Location
        </Button>
        <Button
          onClick={onSearchManually}
          variant="outline"
          className="w-full border-white text-red-500 bg-white hover:bg-red-50 hover:text-red-600"
        >
         <span><SearchIcon size={48} className="text-red-500"></SearchIcon></span> Search Your Location Manually
        </Button>
      </div>
    </motion.div>
  );
};

export default LocationModal;
