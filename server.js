const express = require('express');
const session = require('express-session');
const passport = require('./googleAuth');
const { authenticateToken, isAdmin } = require('./middlewares/middleware.js');
const { register, login, getProfile, editProfile } = require('./controllers/controller.js');
const { setProfileVisibility, getUserProfile } = require('./controllers/controller.js');
const { User } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(session({ secret: 'your_secret_key', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Google authentication routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  });

// Your existing routes
app.post('/register', register);
app.post('/login', login);
app.get('/profile', authenticateToken, getProfile);
app.put('/profile', authenticateToken, editProfile);
app.put('/profile/visibility', authenticateToken, setProfileVisibility);
app.get('/profile/:userId', authenticateToken, getUserProfile);

// Admin routes
app.get('/admin/profile/:userId', authenticateToken, isAdmin, getUserProfile);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
