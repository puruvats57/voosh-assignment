const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, UserProfile } = require('../models/User');

// User registration
async function register(req, res) {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).send({ error: 'Registration failed' });
  }
}

// User login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, 'secret', { expiresIn: '1h' });
    res.send({ token });
  } catch (error) {
    res.status(500).send({ error: 'Login failed' });
  }
}

// User profile details
async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.send({ email: user.email }); // Return profile details
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch profile' });
  }
}

// Edit user details
async function editProfile(req, res) {
  try {
    const userId = req.user.userId;
    const { name, bio, phone, email, password, photo, isPublic } = req.body;
    const userProfile = await UserProfile.findOne({ userId });
    if (!userProfile) {
      return res.status(404).send({ error: 'User profile not found' });
    }
    userProfile.name = name;
    userProfile.bio = bio;
    userProfile.phone = phone;
    userProfile.email = email;
    userProfile.password = password;
    userProfile.photo = photo;
    userProfile.isPublic = isPublic;
    await userProfile.save();
    res.send({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).send({ error: 'Failed to update profile' });
  }
}

// Set profile visibility (public or private)
async function setProfileVisibility(req, res) {
  try {
    const userId = req.user.userId;
    const { isPublic } = req.body;
    const userProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: { isPublic } },
      { new: true }
    );
    if (!userProfile) {
      return res.status(404).send({ error: 'User profile not found' });
    }
    res.send({ message: `Profile visibility set to ${isPublic ? 'public' : 'private'}` });
  } catch (error) {
    res.status(500).send({ error: 'Failed to update profile visibility' });
  }
}

// Get user profile based on visibility (public for normal users, all for admin)
async function getUserProfile(req, res) {
  try {
    const { userId } = req.params;
    const userProfile = await UserProfile.findOne({ userId });
    if (!userProfile) {
      return res.status(404).send({ error: 'User profile not found' });
    }
    // Check if the profile is public or if the request is from an admin user
    if (userProfile.isPublic || req.user.isAdmin) {
      return res.send(userProfile);
    } else {
      return res.status(403).send({ error: 'Forbidden' });
    }
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch user profile' });
  }
}

module.exports = { register, login, getProfile, editProfile, setProfileVisibility, getUserProfile };
