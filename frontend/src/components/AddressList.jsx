import React from "react";

const AddressList = ({ addresses, onDelete }) => {
  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Saved Addresses</h2>
      {addresses.map((address) => (
        <div key={address._id} className="border p-4 rounded mb-2">
          <p>{address.house}, {address.road} ({address.category})</p>
          <div className="flex justify-between mt-2">
            <button
              onClick={() => onDelete(address._id)}
              className="text-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AddressList;
