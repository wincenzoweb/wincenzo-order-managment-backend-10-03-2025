const axios = require('axios');
const ShiprocketCredential = require('../models/ShiprocketCredentials'); // Ensure the filename matches the model name

const shiprocketAuthMiddleware = async (req, res, next) => {
    try {
        // Check if credentials exist in the database
        let credentials = await ShiprocketCredential.findOne();

        if (!credentials) {
            return res.status(400).json({ error: 'Shiprocket credentials not set. Please login first.' });
        }

        const currentDate = new Date();

        // Check if token is expired or missing
        if (!credentials.token || currentDate >= credentials.tokenExpiry) {
            console.log('Token expired, attempting to refresh...');

            try {
                // If token is expired or doesn't exist, request a new token
                const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
                    email: credentials.email,
                    password: credentials.password
                });

                if (response.data && response.data.token) {
                    const { token } = response.data;

                    // Set new token expiry date (9 days from now)
                    const tokenExpiryDate = new Date();
                    tokenExpiryDate.setDate(tokenExpiryDate.getDate() + 1);

                    // Update the token and expiry date in DB
                    credentials.token = token;
                    credentials.tokenExpiry = tokenExpiryDate;
                    await credentials.save();

                    console.log('Token refreshed successfully');
                } else {
                    // If token is not present in response, something went wrong
                    return res.status(500).json({ error: 'Failed to retrieve token from Shiprocket response' });
                }
            } catch (loginError) {
                console.error('Login error:', loginError.response?.data || loginError.message);
                return res.status(500).json({ error: 'Failed to authenticate with Shiprocket. Please check credentials.' });
            }
        }

        // Attach the token to the request object so controllers can use it
        req.shiprocketToken = credentials.token;
        next();
    } catch (error) {
        console.error('Error in shiprocketAuthMiddleware:', error);
        res.status(500).json({ error: 'Failed to authenticate with Shiprocket' });
    }
};

module.exports = shiprocketAuthMiddleware;
