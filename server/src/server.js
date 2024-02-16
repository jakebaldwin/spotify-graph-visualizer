const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const loggerMiddleware = require('./middleware/logger');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Use the logger middleware for all routes
//app.use(loggerMiddleware);

// Routes
app.use('/api', authRoutes);

// Serve static files (if needed)
// app.use(express.static('public'));

// Handle production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
