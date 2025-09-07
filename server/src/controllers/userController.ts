import type { Request, Response } from "express";
import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import logger from "../logger/winston.logger.js";

export const createDummyUser = async (req: Request, res: Response) => {
  try {
    // Generate dummy user data
    const dummyUserData = {
      username: `dummy_user_${Date.now()}`,
      email: `dummy_${Date.now()}@example.com`,
      password: "dummyPassword123",
      firstName: "Dummy",
      lastName: "User",
    };

    // Check if user already exists (though unlikely with timestamp)
    const existingUser = await User.findOne({
      $or: [
        { username: dummyUserData.username },
        { email: dummyUserData.email }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this username or email already exists",
      });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dummyUserData.password, saltRounds);

    // Create new user
    const newUser = new User({
      ...dummyUserData,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    // Remove password from response
    const userResponse = {
      id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };

    logger.info(`Dummy user created successfully: ${savedUser.username}`);

    res.status(201).json({
      success: true,
      message: "Dummy user created successfully",
      data: userResponse,
    });
  } catch (error: any) {
    logger.error("Error creating dummy user:", error);
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors,
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "User with this username or email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
};

export const addUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { username: username },
        { email: email }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this username or email already exists",
      });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
    });

    const savedUser = await newUser.save();

    // Remove password from response
    const userResponse = {
      id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };

    logger.info(`User created successfully: ${savedUser.username}`);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userResponse,
    });
  } catch (error: any) {
    logger.error("Error creating user:", error);
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors,
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "User with this username or email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude password from response
    
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error: any) {
    logger.error("Error retrieving users:", error);
    
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
};
