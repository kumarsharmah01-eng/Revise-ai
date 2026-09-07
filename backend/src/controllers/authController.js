import bcrypt from "bycryptjs";
import User from "../models/user.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassowrd = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPaasword,
    });
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(" Registration Error:", error.message);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
