import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const { fullName, password, email } = req.body;
  try {
    if (!fullName || !password || !email) {
      return res.status(400).json({ message: "all fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "password must be at least 6 characters" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });
    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "invalid user data" });
    }
  } catch (error) {
    console.log("Error In the SignUp Controller", error.message);
    res.status(500).json({
      message: "internal server error ",
    });
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: " Invalid cridantials" });
    }
    const isPasswordOk = await bcrypt.compare(password, user.password);

    if (!isPasswordOk) {
      return res.status(400).json({ message: "Invaild credantials" });
    }

    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
      console.log("Error In login controller", error.message)
      res.status(500).json({message:"Internal server Error"})
  }
};
export const logout = (req, res) => {

    try {
      res.cookie("jwt", "", { maxAge: 0 })
      res.status(200).json({ message: "logged out successfully" })

    } catch (error) {
         console.log("Error In logout controller", error.message)
      res.status(500).json({ message: "Internal server Error" })
    }
};
export const updateProfile = async (req, res) => {
  console.log("STEP 1: before upload");
  
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "profile pic is required" });
    }

    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ message: "Cloudinary config missing" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
      resource_type: "image",
    });

    console.log("STEP 2: after upload", uploadResponse.secure_url);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password"); // IMPORTANT

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("STEP 3: DB updated");

    return res.status(200).json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
    });

  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      message: error.message || "internal server error",
    });
  }
};
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth Controller", error.message)
    res.status(500).json({message: "internal server error"})
  }
}
