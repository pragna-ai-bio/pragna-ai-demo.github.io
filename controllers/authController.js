import User from "../models/userSchema.js";
import jsonwebtoken from "jsonwebtoken";

// Generate token
const generateToken = (id) => {
  return jsonwebtoken.sign({ id }, process.env.JWT_SECRET || "research_only_secret_key", {
    expiresIn: "30d",
  });
};

// REGISTER
export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        status: "error",
        message: "User already exists with this email",
      });
    }

    // Create user
    const user = new User({ name, email, password });
    await user.save(); 

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
        disclaimer: "RESEARCH PLATFORM",
      },
    });
  } catch (error) {
    console.log("Registration error:", error);
    res.status(500).json({
      status: "error",
      message: "Registration failed",
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Find user + include password field
    const user = await User.findOne({ email }).select("+password");

    // Validate password
    if (!user || !(await user.matchPassword(password))) {
      // If login comes from form submission, render login page with error
      if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
        return res.render('login', { error: 'Invalid email or password' });
      }

      // Otherwise, return JSON for API requests
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Set cookie for browser usage
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // If login comes from form submission, redirect to /patients
    if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
      return res.redirect('/patients');
    }

    // For API requests, return JSON
    res.json({
      status: "success",
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });

  } catch (error) {
    console.log("Login error:", error);
    res.status(500).json({
      status: "error",
      message: "Login failed",
    });
  }
}