import React, { useState } from "react";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";

const SearchBox = ({ setMarker, setAddress }) => {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete();

  const handleInput = (e) => setValue(e.target.value);

  const handleSelect = async (description) => {
    setValue(description, false);
    clearSuggestions();

    const geocodeResults = await getGeocode({ address: description });
    const { lat, lng } = getLatLng(geocodeResults[0]);

    setMarker({ lat, lng });
    setAddress(description);
  };

  return (
    <div className="relative">
      <input
        value={value}
        onChange={handleInput}
        disabled={!ready}
        placeholder="Search location"
        className="border rounded p-2 w-full"
      />
      {status === "OK" && (
        <ul className="absolute z-10 bg-white border mt-1 rounded-md shadow-lg">
          {data.map(({ place_id, description }) => (
            <li
              key={place_id}
              onClick={() => handleSelect(description)}
              className="p-2 hover:bg-gray-200 cursor-pointer"
            >
              {description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBox;
