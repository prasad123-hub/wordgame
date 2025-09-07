import { Router } from "express";
import { addUser, createDummyUser, getAllUsers } from "../controllers/userController.js";

const router = Router();

// POST /api/users - Add a new user
router.post("/", addUser);

// POST /api/users/dummy - Create a dummy user
router.post("/dummy", createDummyUser);

// GET /api/users - Get all users
router.get("/", getAllUsers);

export default router;
