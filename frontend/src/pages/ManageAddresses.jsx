import React, { useState, useEffect } from "react";
import axios from "axios";
import AddressForm from "../components/AddressForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FaTrash,
  FaStar,
  FaRegStar,
  FaEdit,
  FaSearch,
  FaHome,
  FaBuilding,
  FaUsers,
  FaMapMarkerAlt
} from "react-icons/fa";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const API_URL = import.meta.env.VITE_API_URL;
const ADDRESS_CATEGORIES = ["Home", "Office", "Friends & Family", "Other"];

const ManageAddresses = ({ limit }) => {
  const [addresses, setAddresses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    const savedSelectedAddress = localStorage.getItem("selectedDeliveryAddress");
    if (savedSelectedAddress) {
      const parsedAddress = JSON.parse(savedSelectedAddress);
      if (!addresses.find((addr) => addr._id === parsedAddress._id)) {
        setSelectedAddress(null); // Reset if not in updated addresses
      } else {
        setSelectedAddress(parsedAddress);
      }
    }
  }, [addresses]);

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);


  const handleSaveAddress = async (addressData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      // setIsFormOpen(false); // Close form first

      if (editingAddress) {
        const response = await axios.put(
          `${API_URL}/addresses/${editingAddress._id}`,
          addressData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAddresses(prev =>
          prev.map(addr => addr._id === editingAddress._id ? response.data : addr)
        );
      } else {
        const response = await axios.post(
          `${API_URL}/addresses`,
          addressData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAddresses(prev => [...prev, response.data]);
      }

      setEditingAddress(null);
      setIsFormOpen(false);
      await fetchAddresses();
    } catch (err) {
      console.error("Error saving address:", err);
    }
  };


  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingAddress(null);
    setIsFormOpen(false);
  };

  const handleSelectForDelivery = (address) => {
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
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      await axios.delete(`${API_URL}/addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAddresses((prev) => prev.filter((addr) => addr._id !== addressId));
    } catch (err) {
    }
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

  const sortedAndFilteredAddresses = filteredAddresses
    .sort((a, b) => {
      if (a.isFavorite === b.isFavorite) return 0;
      return a.isFavorite ? -1 : 1;
    })
    .slice(0, limit || undefined);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  const addressTypeIcons = {
    Home: <FaHome className="text-blue-500" />,
    Office: <FaBuilding className="text-blue-500" />,
    "Friends & Family": <FaUsers className="text-blue-500" />,
    Other: <FaMapMarkerAlt className="text-blue-500" />
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {!limit && ( 
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Manage Addresses</h1>
            <Button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Add New Address
            </Button>
          </div>

          <div className="relative mb-6">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search addresses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </>
      )}

      {/* Address Form Dialog */}
      {isFormOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseForm();
          }}
        >
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl relative">
            {/* Add close button */}
            <button
              onClick={handleCloseForm}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h2>
            <AddressForm
              onSave={handleSaveAddress}
              categories={ADDRESS_CATEGORIES}
              initialValues={editingAddress}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      {/* Address List */}
      <div className="grid gap-4">
        {sortedAndFilteredAddresses.map((address) => (
          <Card key={address._id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {addressTypeIcons[address.type] || <FaMapMarkerAlt className="text-blue-500" />}
                    <span className="font-semibold">{address.type}</span>
                    {address.isFavorite && (
                      <FaStar className="text-yellow-500" />
                    )}
                  </div>
                  <p className="text-lg font-medium">{address.house}</p>
                  <p className="text-gray-600">{address.road}</p>
                  {/* Remove the nested p tags here */}
                  <div className="text-gray-600">
                    {address.city}, {address.state}, {address.pincode}
                  </div>
                  {address.landmark && (
                    <p className="text-gray-500 text-sm mt-1">
                      Landmark: {address.landmark}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleFavorite(address)}
                    className="text-yellow-500 hover:text-yellow-600"
                  >
                    {address.isFavorite ? <FaStar /> : <FaRegStar />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditAddress(address)}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <FaEdit />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                      >
                        <FaTrash />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Address</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this address? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteAddress(address._id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="mt-4">
                {selectedAddress?._id === address._id ? (
                  <Button
                    className="w-full bg-green-200 text-green-600"
                    disabled
                  >
                    Selected for Delivery
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleSelectForDelivery(address)}
                  >
                    Select for Delivery
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {sortedAndFilteredAddresses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No addresses match your search.' : 'No saved addresses.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageAddresses;