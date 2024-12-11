import Address from "../models/Address.js";

export const saveAddress = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request user:", req.user);

    const { house, road, type, location = {} } = req.body;
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    const newAddress = new Address({
      user: userId,
      house,
      road,
      type,
      location: {
        lat: location.lat || null, 
        lng: location.lng || null, 
      },
    });

    await newAddress.save();
    res.status(201).json(newAddress);
  } catch (error) {
    console.error("Save address error:", error);
    res.status(500).json({ message: "Failed to save address" });
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

    const address = await Address.findOne({ _id: id, user: userId });
    
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const updatedAddress = await Address.findByIdAndUpdate(
      id,
      { 
        ...req.body,
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