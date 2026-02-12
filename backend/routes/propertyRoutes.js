import { Router } from "express";
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getPropertiesByOwner,
  getRelatedProperties,
  trackView,
} from "../controllers/propertyController.js";

import { authenticate } from "../middleware/authMiddleware.js";
import upload from "../middleware/multerMiddleware.js";

const router = Router();

// Public
router.get("/", getProperties);
router.get("/owner", authenticate, getPropertiesByOwner);
router.get("/related/:id", getRelatedProperties);
router.post("/:id/view", trackView);

// CRUD
router.post("/", authenticate, upload.array("images", 5), createProperty);
router.put("/:id", authenticate, updateProperty);
router.delete("/:id", authenticate, deleteProperty);

// IMPORTANT — toujours en dernier
router.get("/:id", getPropertyById);

export default router;
