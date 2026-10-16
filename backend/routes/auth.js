import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

function validEmail(email) {
  return typeof email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};

    if (
      typeof name !== "string" || !name.trim() || name.trim().length > 80 ||
      !validEmail(email) ||
      typeof password !== "string" || password.length < 8 || password.length > 72
    ) {
      return res.status(400).json({
        message: "Enter a name, valid email, and password of 8–72 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail }).select("_id");
    if (existing) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash
    });

    return res.status(201).json({
      message: "Account created. You can now sign in.",
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Email already registered." });
    }
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!validEmail(email) || typeof password !== "string" || password.length > 72) {
      return res.status(400).json({ message: "Enter a valid email and password." });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      message: "Login successful.",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("name email profileImageUrl createdAt");
    if (!user) return res.status(404).json({ message: "User not found." });

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Profile error:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

export default router;
