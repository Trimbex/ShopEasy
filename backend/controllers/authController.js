import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Generate JWT token for a user
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1d' }
  );
};

// Register a new user
export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        // By default, users are not admins
        isAdmin: false
      }
    });

    // Generate JWT token
    const token = generateToken(newUser);

    // Return user data and token (excluding password)
    const { password: _, ...userData } = newUser;
    
    res.status(201).json({
      ...userData,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Log in an existing user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user data and token (excluding password)
    const { password: _, ...userData } = user;
    
    res.json({
      ...userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get the current user's information
export const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by the authenticate middleware
    const userId = req.user.id;
    
    // Get the user from the database (to ensure we have the most up-to-date info)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 


// Update User Profile
export const updateProfile = async (req, res) => {
  try {
    // User ID is available from the authenticated request
    const userId = req.user.id;
    const { name, currentPassword, newPassword } = req.body;

    // Fetch the user from the database to get their current hashed password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // If user not found (shouldn't happen with authenticate middleware)
    if (!user) {
       // This might indicate a token issue, though middleware should handle it
       return res.status(404).json({ message: 'User not found' });
    }

    const updateData = {};

    // Handle name update
    if (name !== undefined && name !== null && name.trim() !== '') {
      updateData.name = name.trim();
    } else if (name !== undefined && name.trim() === '') {
        // Allow clearing the name field
        updateData.name = null;
    }


    // Handle password update
    if (currentPassword || newPassword) {
      // Both fields must be provided for a password change
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Both currentPassword and newPassword are required to change password' });
      }

      // Verify the current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid current password' });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      updateData.password = hashedPassword;
    }

    // If no fields were provided for update
    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    // Perform the update
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      // Select fields to return, EXCLUDE PASSWORD
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
};