import React, { useState } from "react";
import LocationModal from "../components/LocationModal";
import MapInterface from "../components/MapInterface";
import ManageAddresses from "./ManageAddresses";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);
  const [location, setLocation] = useState(null);
  const [manualSearch, setManualSearch] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleSeeAllAddresses = async () => {
    setIsNavigating(true);
    try {
      await navigate('/addresses');
    } finally {
      setIsNavigating(false);
    }
  };

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

  return (
    <div className="h-screen flex flex-col">
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
          </>
        )}

        <div className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Addresses</h2>
            <Button
              onClick={handleSeeAllAddresses}
              variant="outline"
              className="group hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              disabled={isNavigating}
            >
              {isNavigating ? (
                <>
                  Loading
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  View All Addresses
                  <ArrowRight className="ml-2 h-4 w-4 transition-all duration-200 group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </div>
          <ManageAddresses limit={3} />
        </div>

      </main>
    </div>
  );
};

export default HomePage;