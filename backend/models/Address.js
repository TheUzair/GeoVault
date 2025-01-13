import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  house: { type: String, required: true },
  road: { type: String, required: true },
  type: { type: String, enum: ["Home", "Office", "Friends & Family"], default: "Home" },
  landmark: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  isFavorite: { type: Boolean, default: false },
   // location: {
  //   lat: { type: Number, required: false },
  //   lng: { type: Number, required: false },
  // },
}, { timestamps: true });

// Add composite unique index
addressSchema.index({ user: 1, house: 1, road: 1, type: 1, city: 1, state: 1, pincode: 1 }, { unique: true });

export default mongoose.model("Address", addressSchema);
