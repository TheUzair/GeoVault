import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, Briefcase, Users } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const AddressForm = ({ onSave }) => {
  const [formData, setFormData] = useState({
    house: "",
    road: "",
    category: "Home", // Default category
  });

  const categories = [
    { name: "Home", icon: <Home size={24} /> },
    { name: "Office", icon: <Briefcase size={24} /> },
    { name: "Friends & Family", icon: <Users size={24} /> },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategorySelect = (category) => {
    setFormData({ ...formData, category });
  };

  const saveAddress = async (addressData) => {
    try {
      const response = await axios.post(
        `${API_URL}/addresses`,
        {
          house: addressData.house,
          road: addressData.road,
          type: addressData.category,
          // location: {
          //   lat: addressData.lat, 
          //   lng: addressData.lng,
          // },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
  
      return response.data;
    } catch (error) {
      console.error('Error saving address:', error);
      throw error;
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const savedAddress = await saveAddress(formData);
      onSave(savedAddress);
      setFormData({ house: "", road: "", category: "Home" });
    } catch (error) {
      console.error('Failed to save address:', error.message);
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Add Delivery Address</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="house" className="block text-sm font-medium text-gray-700">
            House/Flat/Block No.
          </label>
          <input
            type="text"
            id="house"
            name="house"
            value={formData.house}
            onChange={handleInputChange}
            className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Enter house/flat/block no."
            required
          />
        </div>
        <div>
          <label htmlFor="road" className="block text-sm font-medium text-gray-700">
            Apartment/Road/Area
          </label>
          <input
            type="text"
            id="road"
            name="road"
            value={formData.road}
            onChange={handleInputChange}
            className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Enter apartment/road/area"
            required
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Category</p>
          <div className="flex space-x-4">
            {categories.map((category) => (
              <button
                type="button"
                key={category.name}
                onClick={() => handleCategorySelect(category.name)}
                className={`flex flex-col items-center p-4 border rounded-lg ${formData.category === category.name
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700"
                  }`}
              >
                {category.icon}
                <span className="text-xs mt-1">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
        <Button type="submit" className="w-full bg-blue-600 text-white">
          Save Address
        </Button>
      </form>
    </div>
  );
};

export default AddressForm;
