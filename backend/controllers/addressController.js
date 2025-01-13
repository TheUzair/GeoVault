import Address from "../models/Address.js";

export const saveAddress = async (req, res) => {
  try {
    console.log("Request received:", req.body);
    const { house, road, type, landmark, city, state, pincode } = req.body;
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    // Check for duplicate pre-save logic
    const existingAddress = await Address.findOne({
      user: req.user.id,
      house: req.body.house,
      road: req.body.road,
      type: req.body.type,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
    });

    if (existingAddress) {
      console.log("Address already exists:", existingAddress);
      return res.status(200).json({ message: "Address already exists", address: existingAddress });
    }

    try {
      const newAddress = new Address({
        user: userId,
        house,
        road,
        type,
        landmark: landmark || "",
        city,
        state,
        pincode,
      });

      await newAddress.save();
      res.status(201).json(newAddress);
    } catch (error) {
      if (error.code === 11000) { // Duplicate key error
        return res.status(200).json({ message: "Address already exists" });
      }
      console.error("Save address error:", error);
      res.status(500).json({ message: "Failed to save address" });
    }
  } catch (error) {
    console.error("Error handling request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await Address.find({ user: userId });
    res.status(200).json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ message: "Failed to fetch addresses" });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Remove _id from request body if it exists
    const { _id, ...updateData } = req.body;

    const address = await Address.findOne({ _id: id, user: userId });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const updatedAddress = await Address.findByIdAndUpdate(
      id,
      {
        ...updateData,
        user: userId
      },
      { new: true }
    );

    res.status(200).json(updatedAddress);
  } catch (error) {
    console.error("Update address error:", error);
    res.status(500).json({ message: "Failed to update address" });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    await Address.findByIdAndDelete(id);
    res.json({ message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete address" });
  }
};