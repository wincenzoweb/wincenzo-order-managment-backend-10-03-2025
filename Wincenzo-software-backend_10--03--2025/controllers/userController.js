//userController.js

const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Function to generate JWT token
const generateAuthToken = (user, userType) => {
  return jwt.sign(
    { userId: user._id, userType: userType },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

const loginUser = async (req, res) => {
  try {
    const { email, mobile, password } = req.body;

    // Check if the identifier is either an email or mobile number
    const user = await User.findOne({
      $or: [{ email }, { mobile }],
    });
    if (!user) {
      res.status(404).json({ error: "Invalid Email Id." });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid Password." });
      return;
    }

    // Generate JWT token
    const token = generateAuthToken(user, user.role);

    // Return user data based on the model
    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        position: user.position,
        branch: user.branch,
        role: user.role,
        accessRights: user.accessRights,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const addUser = async (req, res) => {
  try {
    // Extract user data from req.body
    let { username, email, mobile, password, role, branch } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists. Please use a different email." });
    }

    // Extract the role of the logged-in user from req.user
    const loggedInUserRole = req.user.role;
    const loggedInUserID = req.user._id;

    // Check if the logged-in user has permission to add users
    if (loggedInUserRole === "admin") {
      // Admin can add admin, branchAdmin, and employee
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
      const userData = {
        username,
        email: email.toLowerCase(),// Convert email to lowercase
        mobile,
        password: hashedPassword,
        role,
        branch,
        createdBy: loggedInUserID,
      };
      const newUser = new User(userData);
      await newUser.save();
      res.status(201).json({ message: "User created successfully", newUser });
      return;
    } else if (loggedInUserRole === "branchAdmin") {
      // BranchAdmin can add only employee
      if (role !== "employee") {
        res.status(403).json({ message: "BranchAdmin can only add employees" });
        return;
      } else {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const userData = {
          username,
          email: email.toLowerCase(),// Convert email to lowercase
          mobile,
          password: hashedPassword,
          role,
          branch,
          createdBy: loggedInUserID,
        };
        const newUser = new User(userData);
        await newUser.save();
        res.status(201).json({ message: "User created successfully", newUser });
        return;
      }
    } else {
      // Other roles don't have permission to add users
      res.status(403).json({ message: "You do not have permission to add users" });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// // Function to add a new user
// const addUser = async (req, res) => {
//   try {
//     // Extract user data from req.body
//     const { username, email, mobile, password, role, branch } = req.body;

//     // Extract the role of the logged-in user from req.user
//     const loggedInUserRole = req.user.role;
//     const loggedInUserID = req.user._id;

//     // Check if the logged-in user has permission to add users
//     if (loggedInUserRole === "admin") {
//       // Admin can add admin, branchAdmin, and employee
//       const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
//       const userData = {
//         username,
//         email,
//         mobile,
//         password: hashedPassword,
//         role: role,
//         branch,
//         createdBy: loggedInUserID,
//       };
//       const newUser = new User(userData);
//       await newUser.save();
//       res.status(201).json({ message: "User created successfully", newUser });
//       return;
//     } else if (loggedInUserRole === "branchAdmin") {
//       // BranchAdmin can add only employee
//       if (req.body.role !== "employee") {
//         res.status(403).json({ message: "BranchAdmin can only add employees" });
//         return;
//       } else {
//         const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
//         const userData = {
//           username,
//           email,
//           mobile,
//           password: hashedPassword,
//           role: role,
//           branch,
//           createdBy: loggedInUserID,
//         };
//         const newUser = new User(userData);
//         await newUser.save();
//         res.status(201).json({ message: "User created successfully", newUser });
//         return;
//       }
//     } else {
//       // Other roles don't have permission to add users
//       res
//         .status(403)
//         .json({ message: "You do not have permission to add users" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// Function to get all users
const getAllUsers = async (req, res) => {
  try {
    // Extract the role, ID, and branch of the logged-in user from req.user
    const { role, _id, branch } = req.user;

    let users;

    if (role === "admin") {
      // Admin can access all users
      users = await User.find();
    } else if (role === "branchAdmin") {
      // BranchAdmin can access all users within their branch
      users = await User.find({
        $or: [
          { createdBy: _id }, // Users created by this branchAdmin
          { branch }, // Users created by admin in the same branch
        ],
      });
    } else {
      // Other roles don't have permission to access users
      res
        .status(403)
        .json({ error: "You do not have permission to access users" });
      return;
    }

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function to delete a user by ID
const deleteUserById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const loggedInUserRole = req.user.role;
    const loggedInUserBranch = req.user.branch;

    // Check if userId is provided
    if (!userId) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }

    // Find user by ID
    let user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Check if the logged-in user has permission to delete the user
    if (
      loggedInUserRole === "admin" ||
      (loggedInUserRole === "branchAdmin" &&
        user.createdBy === req.user._id &&
        user.branch === loggedInUserBranch)
    ) {
      // Delete user by ID
      await User.findByIdAndDelete(userId);

      // Send success message
      res.status(200).json({ message: "User deleted successfully" });
      return;
    } else {
      // Other roles don't have permission to delete users
      res
        .status(403)
        .json({ error: "You do not have permission to delete this user" });
      return;
    }
  } catch (error) {
    // Handle internal server error
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function to update user by ID
const updateUserById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const loggedInUserRole = req.user.role;
    const loggedInUserBranch = req.user.branch;

    // Check if userId is provided
    if (!userId) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }

    // Find user by ID
    let user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Check if the logged-in user has permission to update the user
    if (
      loggedInUserRole === "admin" ||
      (loggedInUserRole === "branchAdmin" &&
        user.createdBy === req.user._id &&
        user.branch === loggedInUserBranch)
    ) {
      // Update user fields
      user.username = req.body.username || user.username;
      if (req.body.password) {
        user.password = await bcrypt.hash(req.body.password, 10);
      }
      user.email = req.body.email.toLowerCase() || user.email;
      user.mobile = req.body.mobile || user.mobile;
      user.position = req.body.position || user.position;
      user.branch = req.body.branch || user.branch;
      user.address = req.body.address || user.address;
      user.accessRights = req.body.accessRights || user.accessRights;
      user.accountStatus = req.body.accountStatus || user.accountStatus;
      user.createdBy = req.body.createdBy || user.createdBy;
      user.role = req.body.role || user.role;

      // Save updated user
      await user.save();

      // Send success message
      res.status(200).json({ message: "User updated successfully", user });
      return;
    } else {
      // Other roles don't have permission to update users
      res
        .status(403)
        .json({ error: "You do not have permission to update this user" });
      return;
    }
  } catch (error) {
    // Handle internal server error
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

// Function to get user by ID
const getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if userId is provided
    if (!userId) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }

    // Find user by ID
    const user = await User.findById(userId);

    // Check if user exists
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Send user data
    res.status(200).json({ user });
  } catch (error) {
    // Handle internal server error
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

const createInitialAdmin = async (req, res) => {
  try {
    const { username, password, email, mobile, role, branch, accessRights } =
      req.body;
    const adminExists = await User.findOne({ username });
    if (adminExists)
      return res.status(400).json({ message: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const initialRight = ["allemployee","orderdashboard","workdashboard","branch","bookingorder","paymentorders","paiduser","returnorders","pendingorders","trackorder","settings"];

    const admin = new User({
      username,
      password: hashedPassword,
      email,
      mobile,
      role,
      branch,
      accessRights: initialRight,
    });
    await admin.save();
    res.status(201).json({ message: "Admin created successfully", admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  loginUser,
  addUser,
  getAllUsers,
  deleteUserById,
  updateUserById,
  getUserById,
  createInitialAdmin,
};
