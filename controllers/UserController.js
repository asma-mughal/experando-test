import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/UserModel.js";

export const registerUser = async (req, res) => {
  const {
    fullName,
    email,
    password,
    phoneNumber,
    userType,
    googleId,
    facebookId,
  } = req.body;

  try {
    if (!fullName || !email || !userType ||  !password) {
      return res
        .status(400)
        .json({ message: "Full name, email, password , and user type are required" });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (!googleId && !facebookId && !password) {
      return res
        .status(400)
        .json({
          message:
            "Password is required if Google or Facebook ID is not provided",
        });
    }

    let hashedPassword = "";
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      userType,
      googleId: googleId || "",
      facebookId: facebookId || "",
    });

    await newUser.save();
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET
    );
    res
      .status(201)
      .json({ message: "User registered successfully", token, user: newUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const registerOAuth = async (req, res) => {
  const { fullName, email, userType, oauthId, provider } = req.body;

  try {
    if (!fullName || !email || !userType || !oauthId || !provider) {
      return res
        .status(400)
        .json({
          message:
            "Full name, email, user type, OAuth ID, and provider are required",
        });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (
        (provider === "google" && existingUser.googleId === oauthId) ||
        (provider === "facebook" && existingUser.facebookId === oauthId)
      ) {
        const token = jwt.sign(
          { userId: existingUser._id, email: existingUser.email },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        return res
          .status(200)
          .json({
            message: "User logged in successfully",
            token,
            user: existingUser,
          });
      }

      return res
        .status(400)
        .json({
          message: "User already exists but with a different OAuth provider",
        });
    }

    const newUser = new User({
      fullName,
      email,
      userType,
      [provider === "google" ? "googleId" : "facebookId"]: oauthId,
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res
      .status(201)
      .json({ message: "User registered successfully", token, user: newUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const loginUser = async (req, res) => {
  const { email, password, userType } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if user is blocked
    if (user.isActive === false) {
      return res.status(403).json({ message: "Your account has been blocked. Please contact support." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.userType !== userType) {
      return res.status(400).json({ message: "User type mismatch" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET
    );

    res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const {
    currentPassword,
    newPassword,
    fullName,
    profilePicture,
    jobsDone,
    totalHires,
    email,
    isActive, 
  } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordValid) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    // Email update
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({ message: "Email is already in use" });
      }
      user.email = email;
    }
    if (typeof isActive === "boolean") {
      user.isActive = isActive;
    }
    user.fullName = fullName || user.fullName;
    user.profilePicture = profilePicture || user.profilePicture;

    if (jobsDone) {
      user.jobsDone = (user.jobsDone || 0) + jobsDone;
    }

    if (totalHires) {
      user.totalHires = (user.totalHires || 0) + totalHires;
    }

    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const getUserData = async (req, res) => {
  try {
    const { userType } = req.query;
    if (req?.user?._id) {
      const user = await User.findById(req.user._id).select("-password");
     
      if (!user) {
        return res.status(404).send("User not found");
      }
       if (!user.isActive) {
      return res.status(403).json({ message: "Your account has been blocked. Please contact support." });
    }
      return res.json(user);
    } else {
      const filter = userType ? { userType } : {};
      const users = await User.find(filter);
      return res.json(users);
    }
  } catch (err) {
    res.status(500).send("Server error");
  }
};
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully", user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", error });
  }
};
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    return res.json(users);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send("Server error");
  }
};
export const getUsersByType = async (req, res) => {
  try {
    const { userType } = req.params;
    if (!["craftsman", "client", "admin"].includes(userType)) {
      return res
        .status(400)
        .json({
          message: 'Invalid user type. Use "craftsman", "client", or "admin".',
        });
    }

    const users = await User.find({ userType }).select("-password");

    if (users.length === 0) {
      return res
        .status(404)
        .json({ message: `No users found with user type ${userType}` });
    }

    

    return res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const deleteAllUsers = async (req, res) => {
  try {
    const result = await User.deleteMany({});
    
    return res.status(200).json({
      message: `Successfully deleted ${result.deletedCount} users`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", error });
  }
};