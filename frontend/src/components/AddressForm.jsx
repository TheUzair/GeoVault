import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Home, Briefcase, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useLoadScript } from "@react-google-maps/api";

const API_URL = import.meta.env.VITE_API_URL;
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const libraries = ["places"];

const AddressForm = ({ onSave, initialValues, onCancel }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,  
    formState: { errors }
  } = useForm({
    defaultValues: {
      type: initialValues?.type || "Home",
      house: initialValues?.house || "",
      road: initialValues?.road || "",
      landmark: initialValues?.landmark || "",
      city: initialValues?.city || "",
      state: initialValues?.state || "",
      pincode: initialValues?.pincode || "",
    }
  });

  const categories = [
    { name: "Home", icon: <Home size={24} /> },
    { name: "Office", icon: <Briefcase size={24} /> },
    { name: "Friends & Family", icon: <Users size={24} /> },
  ];

  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [validationError, setValidationError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialValues) {
      Object.keys(initialValues).forEach((key) => {
        setValue(key, initialValues[key]);
      });
    }
  }, [initialValues, setValue]);

  const handleCategorySelect = (category) => {
    setValue("type", category);
  };

  const saveAddress = async (addressData) => {
    console.log("Calling saveAddress API with data:", addressData);
    try {
      const endpoint = initialValues?._id
        ? `${API_URL}/addresses/${initialValues._id}`
        : `${API_URL}/addresses`;

      const method = initialValues?._id ? 'put' : 'post';

      const addressPayload = {
        type: addressData.type,
        house: addressData.house,
        road: addressData.road,
        landmark: addressData.landmark || '',
        city: addressData.city,
        state: addressData.state,
        pincode: addressData.pincode
      };

      const response = await axios[method](
        endpoint,
        addressPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      console.log("API Response:", response.data);

      return response.data;
    } catch (error) {
      console.error('Error saving address:', error);
      throw error;
    }
  };

  const validateAddress = async (address) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({
        address: `${address.house} ${address.road}, ${address.city}, ${address.state} ${address.pincode}`
      });

      if (response.results.length > 0) {
        const validatedAddress = response.results[0];
        const addressComponents = validatedAddress.address_components;

        const extractComponent = (type) => {
          const component = addressComponents.find(comp =>
            comp.types.includes(type)
          );
          return component ? component.long_name : '';
        };

        // Update form with validated address
        setValue('city', extractComponent('locality'));
        setValue('state', extractComponent('administrative_area_level_1'));
        setValue('pincode', extractComponent('postal_code'));

        return true;
      }
      return false;
    } catch (error) {
      console.error('Address validation error:', error);
      return false;
    }
  };

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!isLoaded) {
        throw new Error('Google Maps not loaded');
      }

      const isValid = await validateAddress(data);

      if (!isValid) {
        setValidationError('Please enter a valid address');
        return;
      }

      const savedAddress = await saveAddress(data);
      if (savedAddress) {
        onSave(savedAddress);
        if (!initialValues) {
          reset();
        }
        onSave(savedAddress)
        setValidationError(null);
      }
    } catch (error) {
      console.error('Failed to save address:', error.message);
      setValidationError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-complete functionality
  const handleAddressSearch = async (searchText) => {
    if (!isLoaded || !searchText) return;

    try {
      const autocompleteService = new window.google.maps.places.AutocompleteService();
      const results = await autocompleteService.getPlacePredictions({
        input: searchText,
        componentRestrictions: { country: 'IN' }, // Restrict to India
        types: ['address']
      });

      setAddressSuggestions(results.predictions);
    } catch (error) {
      console.error('Autocomplete error:', error);
    }
  };

  const handleAddressSelect = async (placeId) => {
    try {
      const placesService = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );

      placesService.getDetails(
        { placeId },
        (place, status) => {
          if (status === 'OK') {
            const addressComponents = place.address_components;
            const extractComponent = (type) => {
              const component = addressComponents.find(comp =>
                comp.types.includes(type)
              );
              return component ? component.long_name : '';
            };

            setValue('house', extractComponent('street_number'));
            setValue('road', extractComponent('route'));
            setValue('city', extractComponent('locality'));
            setValue('state', extractComponent('administrative_area_level_1'));
            setValue('pincode', extractComponent('postal_code'));
            setAddressSuggestions([]);
          }
        }
      );
    } catch (error) {
      console.error('Error selecting address:', error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">
        {initialValues ? 'Edit Delivery Address' : 'Add Delivery Address'}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <div className="flex space-x-4">
            {categories.map((category) => (
              <button
                type="button"
                key={category.name}
                onClick={() => handleCategorySelect(category.name)}
                className={`flex flex-col items-center p-4 border rounded-lg ${watch("type") === category.name
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

        <div className="relative">
          <Input
            type="text"
            placeholder="Search for address"
            onChange={(e) => handleAddressSearch(e.target.value)}
            className="mt-1"
          />
          {addressSuggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg">
              {addressSuggestions.map((suggestion) => (
                <div
                  key={suggestion.place_id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleAddressSelect(suggestion.place_id)}
                >
                  {suggestion.description}
                </div>
              ))}
            </div>
          )}
        </div>

        {validationError && (
          <div className="text-red-500 text-sm mt-2">{validationError}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            House/Flat/Block No.
          </label>
          <Input
            {...register("house")}
            placeholder="Enter house/flat/block no."
            className="mt-1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Road/Area/Colony
          </label>
          <Input
            {...register("road")}
            placeholder="Enter road/area/colony"
            className="mt-1"
            required
          />
        </div>

        <div>
          <Input
            {...register("landmark")}
            placeholder="Landmark (Optional)"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            {...register("city")}
            placeholder="City"
            className="mt-1"
          />
          <Input
            {...register("state")}
            placeholder="State"
            className="mt-1"
          />
        </div>

        <div>
          <Input
            {...register("pincode")}
            placeholder="Pincode"
            className="mt-1"
          />
        </div>

        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            className="bg-blue-600 text-white"
            disabled={isSubmitting}
            onClick={(e) => {
              if (isSubmitting) {
                e.preventDefault();
                return;
              }
            }}
          >
            {isSubmitting ? 'Saving...' : initialValues ? 'Update Address' : 'Save Address'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;