import React, { useState, useEffect } from "react";
import axios from "axios";
import LocationModal from "../components/LocationModal";
import MapInterface from "../components/MapInterface";
import AddressForm from "../components/AddressForm";
import { FaTrash, FaStar, FaRegStar } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;
const ADDRESS_CATEGORIES = ["Home", "Office", "Friends & Family", "Other"];

const HomePage = () => {
  const [showModal, setShowModal] = useState(true);
  const [location, setLocation] = useState(null);
  const [manualSearch, setManualSearch] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch addresses on component mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found");

        const response = await axios.get(`${API_URL}/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAddresses(response.data);
      } catch (err) {
        console.error("Error fetching addresses:", err);
        setError("Failed to load saved addresses.");
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  useEffect(() => {
    const savedSelectedAddress = localStorage.getItem('selectedDeliveryAddress');
    if (savedSelectedAddress) {
      const parsedAddress = JSON.parse(savedSelectedAddress);
      setSelectedAddress(parsedAddress);
      setLocation(parsedAddress.location);
    }
  }, []);

  const handleSearchManually = () => {
    setShowModal(false);
    setManualSearch(true);
  };

  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation);
    setManualSearch(false);
  };

  const handleLocationFetched = (currentLocation) => {
    setLocation(currentLocation);
    setShowModal(false);
  };

  const handleSaveAddress = async (address) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      if (selectedAddress) {
        const response = await axios.put(
          `${API_URL}/addresses/${selectedAddress._id}`,
          { ...address, location },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAddresses((prev) =>
          prev.map((addr) =>
            addr._id === selectedAddress._id ? response.data : addr
          )
        );
      } else {
        const response = await axios.post(
          `${API_URL}/addresses`,
          { ...address, location },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAddresses((prev) => [...prev, response.data]);
      }
      alert("Address saved successfully!");
      setSelectedAddress(null);
    } catch (err) {
      console.error("Error saving address:", err);
      setError("Failed to save address.");
    }
  };

  const handleSelectForDelivery = (address) => {
    setLocation(address.location);
    setSelectedAddress(address);
    localStorage.setItem('selectedDeliveryAddress', JSON.stringify(address));
  };

  const handleToggleFavorite = async (address) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await axios.put(
        `${API_URL}/addresses/${address._id}`,
        { ...address, isFavorite: !address.isFavorite },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAddresses((prev) =>
        prev.map((addr) =>
          addr._id === address._id ? response.data : addr
        )
      );
    } catch (err) {
      console.error("Error toggling favorite:", err);
      setError("Failed to update favorite status.");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found");

        await axios.delete(`${API_URL}/addresses/${addressId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAddresses((prev) => prev.filter((addr) => addr._id !== addressId));
      } catch (err) {
        console.error("Error deleting address:", err);
        setError("Failed to delete address.");
      }
    }
  };

  const clearSelectedAddress = () => {
    setSelectedAddress(null);
    setLocation(null);
    localStorage.removeItem('selectedDeliveryAddress');
  };


  const filteredAddresses = addresses.filter((address) => {
    const searchFields = [
      address.house,
      address.road,
      address.type,
      address.landmark,
      address.city,
      address.state,
      address.pincode
    ];

    return searchFields.some(field =>
      field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const sortedAndFilteredAddresses = filteredAddresses.sort((a, b) => {
    if (a.isFavorite === b.isFavorite) {
      return 0;
    }
    return a.isFavorite ? -1 : 1;
  });
  if (loading) {
    return <p>Loading addresses...</p>;
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-semibold text-center">Delivery Location Selector</h1>
        <div className="mt-2 relative">
          <input
            type="text"
            placeholder="Search by address, landmark, city..."
            className="w-full p-2 pl-4 pr-10 rounded text-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setSearchTerm('')}
            >
              ×
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4">
        {showModal && (
          <LocationModal
            onClose={() => setShowModal(false)}
            onSearchManually={handleSearchManually}
            onLocationFetched={handleLocationFetched}
          />
        )}

        {!showModal && (manualSearch || location) && (
          <>
            <MapInterface
              initialLocation={location}
              onLocationSelect={handleLocationSelect}
            />
            <div className="mt-4">
              <AddressForm
                onSave={handleSaveAddress}
                categories={ADDRESS_CATEGORIES}
                initialValues={selectedAddress}
                onCancel={() => clearSelectedAddress()}
              />
            </div>
          </>
        )}

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Saved Addresses</h2>
          {error && <p className="text-red-500">{error}</p>}
          {sortedAndFilteredAddresses.length > 0 ? (
            <ul className="space-y-4">
              {sortedAndFilteredAddresses.map((address) => (
                <li key={address._id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{address.house}</p>
                        <p className="text-sm text-gray-600">{address.road}</p>
                        <p className="text-xs text-blue-600">{address.type}</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          className="text-yellow-500 hover:text-yellow-600"
                          onClick={() => handleToggleFavorite(address)}
                          title="favorite"
                        >
                          {address.isFavorite ? <FaStar /> : <FaRegStar />}
                        </button>
                        <button
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteAddress(address._id)}
                          title="Delete address"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3">
                      {selectedAddress?._id === address._id ? (
                        <button
                          className="w-full py-2 bg-green-100 text-green-700 rounded-md font-medium"
                          disabled
                        >
                          Selected Delivery Address
                        </button>
                      ) : (
                        <button
                          className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                          onClick={() => handleSelectForDelivery(address)}
                        >
                          Select for Delivery
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">
              {searchTerm ? 'No addresses match your search.' : 'No saved addresses.'}
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
