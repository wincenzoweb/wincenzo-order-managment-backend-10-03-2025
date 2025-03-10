const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shiprocketCredentialSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true  
    },
    token: {
        type: String,
        required: false
    },
    tokenExpiry: {
        type: Date, // To store the token expiration date
        required: false
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('ShiprocketCredential', shiprocketCredentialSchema);
