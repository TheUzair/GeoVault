import React, { useState, useEffect } from "react";
import AddressForm from "@/components/AddressForm";
import AddressList from "@/components/AddressList";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const ManageAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch addresses when the component loads
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }
        const response = await axios.get(`${API_URL}/api/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAddresses(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching addresses:", error);
        setError("Failed to fetch addresses");
        setLoading(false);
      }
    };
    fetchAddresses();
  }, []);
  

  // Save a new address
  const handleSaveAddress = async (address) => {
    try {
      setSaving(true);
      if (isEditing && selectedAddress) {
        const response = await axios.put(
          `${API_URL}/api/addresses/${selectedAddress._id}`,
          address,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        setAddresses(prev => 
          prev.map(addr => addr._id === selectedAddress._id ? response.data : addr)
        );
        setIsEditing(false);
      } else {
        const response = await axios.post(
          `${API_URL}/api/addresses`,
          address,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        setAddresses(prev => [...prev, response.data]);
      }
      setSelectedAddress(null);
    } catch (err) {
      console.error("Error saving address:", err);
      setError("Failed to save address");
    } finally {
      setSaving(false);
    }
  };
  
  // Delete an address
  const handleDeleteAddress = async (id) => {
    try {
      setDeleting(true);
      await axios.delete(`${API_URL}/api/addresses/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAddresses((prev) => prev.filter((address) => address._id !== id));
    } catch (err) {
      console.error("Error deleting address:", err);
      setError("Failed to delete address. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <p>Loading addresses...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Addresses</h1>
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      <AddressForm onSave={handleSaveAddress} isSaving={saving} />
      <AddressList
        addresses={addresses}
        onDelete={handleDeleteAddress}
        isDeleting={deleting}
      />
    </div>
  );
};

export default ManageAddresses;
