const axios = require('axios');
const ShiprocketCredentials = require('../models/ShiprocketCredentials');


const getValidShiprocketToken = async () => {
    // Fetch the credentials from the database
    let credentials = await ShiprocketCredentials.findOne();

    if (!credentials) {
        throw new Error('Shiprocket credentials not set. Please provide them first.');
    }

    const currentDate = new Date();

    // Check if token exists and is still valid (not expired)
    if (!credentials.token || currentDate >= credentials.tokenExpiry) {
        console.log('Token expired or not found, refreshing token...');

        // Perform login request to get a new token
        try {
            const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
                email: credentials.email,
                password: credentials.password
            });

            const { token } = response.data;

            // Set new token expiry date (9 days from now)
            const tokenExpiryDate = new Date();
            tokenExpiryDate.setDate(tokenExpiryDate.getDate() + 1);

            // Update the token and expiry date in the database
            credentials.token = token;
            credentials.tokenExpiry = tokenExpiryDate;
            await credentials.save();

            console.log('Token refreshed successfully.');
        } catch (error) {
            console.error('Error refreshing token:', error);
            throw new Error('Failed to refresh Shiprocket token. Please check your credentials.');
        }
    }

    return credentials.token; 
};

const getToken = async (req, res) => {
    try {
        const token = await getValidShiprocketToken();

        // Respond with the token
        res.json({ token });
    } catch (error) {
        console.error('Error fetching Shiprocket token:', error);
        res.status(500).json({ error: 'Failed to fetch Shiprocket token' });
    }
};




const trackOrderByAWB = async (req, res) => {
    const { awb } = req.body;  // Get AWB number from the request body
  
    if (!awb) {
      return res.status(400).json({ message: "AWB number is required" });
    }
  
    try {
      // Fetch Shiprocket credentials from the database (assuming there's only one set of credentials)
      const credentials = await ShiprocketCredentials.findOne();
  
      if (!credentials) {
        return res.status(404).json({ message: "Shiprocket credentials not found" });
      }
  
      const { token, tokenExpiry } = credentials;
  
      // Check if the token has expired
      const currentTime = new Date();
      if (!token || currentTime >= tokenExpiry) {
        return res.status(401).json({ message: "Shiprocket token is missing or expired" });
      }
  
      // Make the request to the Shiprocket API with the AWB number and valid token
      const response = await axios.get(
        `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,  // Use the token from the database
          },
        }
      );
  
      // Return the tracking information to the client
      return res.status(200).json(response.data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Failed to fetch tracking information",
        error: error.response ? error.response.data : "Unknown error",
      });
    }
  };
  







// Controller to add or update email and password
const addOrUpdateCredentials = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if credentials already exist
        let credentials = await ShiprocketCredentials.findOne();
        if (!credentials) {
            // Create new credentials entry
            credentials = new ShiprocketCredentials({ email, password });
        } else {
            // Update existing credentials
            credentials.email = email;
            credentials.password = password;
        }

        await credentials.save();
        res.status(200).json({ message: 'Credentials saved successfully.' ,credentials});
    } catch (error) {
        res.status(500).json({ error: 'Error saving credentials.' });
    }
};



// New controller to update only email and password
const updateCredentials = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find existing credentials
        const credentials = await ShiprocketCredentials.findOne();
        if (!credentials) {
            return res.status(404).json({ error: 'No Shiprocket credentials found.' });
        }

        // Update email and password
        if (email) {
            credentials.email = email;
        }
        if (password) {
            credentials.password = password;
        }

        await credentials.save();
        res.status(200).json({ message: 'Credentials updated successfully.' , credentials});
    } catch (error) {
        res.status(500).json({ error: 'Error updating credentials.' });
    }
};


// Get stored Shiprocket email and password
const getCredentials = async (req, res) => {
    try {
        // Fetch credentials from the database
        const credentials = await ShiprocketCredentials.findOne();

        if (!credentials) {
            return res.status(404).json({ message: 'Shiprocket credentials not found.' });
        }

        // Return the email and password
        res.status(200).json({
            email: credentials.email,
            password: credentials.password,
        });
    } catch (error) {
        console.error('Error fetching Shiprocket credentials:', error);
        res.status(500).json({ message: 'Failed to fetch Shiprocket credentials.' });
    }
};

module.exports = {
    getToken,
    addOrUpdateCredentials,
    getValidShiprocketToken,
    trackOrderByAWB,
    getCredentials,
    updateCredentials // Export the new update function
};
