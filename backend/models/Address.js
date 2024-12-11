import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  house: { type: String, required: true },
  road: { type: String, required: true },
  type: { type: String, enum: ["Home", "Office", "Friends & Family"], default: "Home" },
  // location: {
  //   lat: { type: Number, required: false },
  //   lng: { type: Number, required: false },
  // },
  isFavorite: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Address", addressSchema);
