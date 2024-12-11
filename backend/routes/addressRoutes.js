import express from "express";
import { saveAddress, getAddresses, deleteAddress , updateAddress} from "../controllers/addressController.js";
import authenticate from "../middleware/authMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, saveAddress);
router.get("/", authenticate, getAddresses);
router.put("/:id", protect, updateAddress); 
router.delete("/:id", authenticate, deleteAddress);

export default router;
