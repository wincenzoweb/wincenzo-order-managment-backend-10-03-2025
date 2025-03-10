const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true // Convert email to lowercase
    },
    mobile: {
        type: String,
        required: true
    },
    position: {
        type: String,
    },
    branch: {
        type: String,
    },
    address: {
        type: String,
    },
    accessRights: [
        {
            type: String
        }
    ],
    accountStatus: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: String,
    },
    role: {
        type: String,
        enum: ['admin', "branchAdmin", "employee"]
    }
});

userSchema.index({ email: 1 }, { unique: true });


module.exports = mongoose.model('User', userSchema);

