import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ManageAddresses from "./pages/ManageAddresses";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import MapInterface from "./components/MapInterface";
import { Toaster } from "./components/ui/toaster";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/homepage" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/manage-addresses" element={<Navigate to="/addresses" replace />} />
        <Route path="/addresses" element={<ManageAddresses />} />
        <Route path="/mapview" element={<MapInterface />} />
      </Routes>
      <Toaster />
    </>
  );
};

export default App;
