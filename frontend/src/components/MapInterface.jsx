import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { Navigation2 } from "lucide-react";

const libraries = ["places"];

const MapInterface = ({ initialLocation, onLocationSelect }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState("");
  const mapRef = useRef(null);
  const geocoder = useRef(null);

  useEffect(() => {
    if (isLoaded && !geocoder.current) {
      geocoder.current = new window.google.maps.Geocoder();
    }
  }, [isLoaded]);

  useEffect(() => {
    if (isLoaded && initialLocation) {
      setMarker(initialLocation);
      handleReverseGeocode(initialLocation);
    }
  }, [initialLocation, isLoaded]);

  const handleReverseGeocode = async (location) => {
    if (!geocoder.current) return;

    try {
      const response = await geocoder.current.geocode({ location });
      if (response.results?.[0]) {
        setAddress(response.results[0].formatted_address);
      }
    } catch (error) {
      console.error("Error getting address:", error);
    }
  };

  const handleMarkerDrag = async (event) => {
    const newPosition = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setMarker(newPosition);
    await handleReverseGeocode(newPosition);
    onLocationSelect({ ...newPosition, address });
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMarker(userLocation);
          handleReverseGeocode(userLocation);

          // Update map center directly
          if (mapRef.current) {
            const map = mapRef.current;
            map.panTo(userLocation);
            map.setZoom(15);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div>
      <GoogleMap
        onLoad={(map) => {
          mapRef.current = map;
        }}
        center={marker || { lat: 0, lng: 0 }}
        zoom={marker ? 15 : 2}
        mapContainerStyle={{ height: "100vh", width: "100%" }}
        onClick={(e) => {
          const newPosition = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          };
          setMarker(newPosition);
          handleReverseGeocode(newPosition);
        }}
      >
        {marker && (
          <Marker
            position={marker}
            draggable={true}
            onDragEnd={handleMarkerDrag}
          />
        )}
      </GoogleMap>
      <div className="flex gap-4 mt-4 w-full">
        <Button
          variant="outline"
          onClick={handleLocateMe}
          className="flex items-center gap-2 w-full"
        >
          <Navigation2 className="h-4 w-4" />
          Locate Me
        </Button>
      </div>
      {address && <p className="mt-2 text-center">Selected Address: {address}</p>}
    </div>
  );
};

export default MapInterface;
