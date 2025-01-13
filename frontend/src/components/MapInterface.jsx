import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { Navigation2, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const libraries = ["places"];

const MapInterface = ({ initialLocation, onLocationSelect }) => {
  const navigate = useNavigate();
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const mapRef = useRef(null);
  const geocoder = useRef(null);
  const autocompleteService = useRef(null);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (isLoaded) {
      geocoder.current = new window.google.maps.Geocoder();
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
    }
  }, [isLoaded]);

  const addToRecentSearches = (location) => {
    const newSearch = {
      address: location.address,
      lat: location.lat,
      lng: location.lng,
      timestamp: new Date().toISOString()
    };

    setRecentSearches(prevSearches => {
      const filtered = prevSearches.filter(
        search => search.address !== location.address
      );
      const updated = [newSearch, ...filtered].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleRecentSearchSelect = (search) => {
    const location = {
      lat: search.lat,
      lng: search.lng,
    };
    setMarker(location);
    setAddress(search.address);
    setSearchQuery(search.address);
    setSuggestions([]);

    if (mapRef.current) {
      mapRef.current.panTo(location);
      mapRef.current.setZoom(15);
    }
  };

  
  // Handle search input changes and fetch suggestions
  const handleSearchInputChange = async (value) => {
    setSearchQuery(value);
    if (value.length > 2 && autocompleteService.current) {
      try {
        const response = await autocompleteService.current.getPlacePredictions({
          input: value,
          types: ['geocode', 'establishment']
        });
        setSuggestions(response.predictions || []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

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

  useEffect(() => {
    if (isLoaded && initialLocation) {
      setMarker(initialLocation);
      handleReverseGeocode(initialLocation);
    }
  }, [initialLocation, isLoaded]);

 
  // Handle suggestion selection
  const handleSuggestionSelect = async (placeId) => {
    if (!geocoder.current) return;

    try {
      const response = await geocoder.current.geocode({ placeId });
      if (response.results?.[0]) {
        const location = {
          lat: response.results[0].geometry.location.lat(),
          lng: response.results[0].geometry.location.lng(),
          address: response.results[0].formatted_address,
        };
        setMarker(location);
        setAddress(location.address);
        setSearchQuery(location.address);
        setSuggestions([]);
        addToRecentSearches(location);

        if (mapRef.current) {
          mapRef.current.panTo(location);
          mapRef.current.setZoom(15);
        }
      }
    } catch (error) {
      console.error("Error getting location details:", error);
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

          // Update map center
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
    <TooltipProvider>
      <div className="min-h-screen">
        {/* Search Bar with Autocomplete */}
        <div className="p-4 bg-white shadow-md sticky top-0 z-10">
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  placeholder="Search location..."
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none pr-8"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSuggestions([]);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                onClick={() => handleSuggestionSelect(suggestions[0]?.place_id)}
                className="flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600"
                disabled={!suggestions.length}
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute w-full bg-white mt-1 rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-50">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.place_id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSuggestionSelect(suggestion.place_id)}
                  >
                    {suggestion.description}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="mt-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center p-2 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-700">Recent Searches</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearRecentSearches}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Clear All
              </Button>
            </div>
            <div className="divide-y divide-gray-100">
              {recentSearches.map((search, index) => (
                <div
                  key={index}
                  onClick={() => handleRecentSearchSelect(search)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                >
                  <Search className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 truncate">
                    {search.address}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map Container */}
        <div className="h-[calc(100vh-80px)]">
          <GoogleMap
            onLoad={(map) => {
              mapRef.current = map;
            }}
            center={marker || { lat: 0, lng: 0 }}
            zoom={marker ? 15 : 2}
            mapContainerStyle={{ height: "100%", width: "100%" }}
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
        </div>

        <div className="fixed bottom-7 left-1/2 transform -translate-x-1/2 flex justify-center gap-4 px-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={handleLocateMe}
                className="flex items-center gap-2 bg-white hover:bg-blue-50 shadow-lg"
              >
                <Navigation2 className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-600">Locate Me</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Get your current location</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={() => navigate('/addresses')}
                className="flex items-center gap-2 bg-white hover:bg-gray-50 shadow-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="font-medium text-gray-600">Manage Addresses</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Go to addresses page</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default MapInterface;
