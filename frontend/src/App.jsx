import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Login";
import ManageAddresses from "./pages/ManageAddresses";
import HomePage from "./pages/HomePage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/HomePage" element={<HomePage />} />
      <Route path="/manage-addresses" element={<ManageAddresses />} />
    </Routes>
  );
};

export default App;
