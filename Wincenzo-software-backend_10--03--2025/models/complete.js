const mongoose = require('mongoose');

const completedBookingDataSchema = new mongoose.Schema({
    sl: { type: Number },
    barcode: { type: String, index: true },
    ref: { type: String },
    city: { type: String },
    pincode: { type: String },
    name: { type: String },
    add1: { type: String },
    add2: { type: String },
    add3: { type: String },
    addremail: { type: String },
    addrmobile: { type: String },
    sendermobile: { type: String },
    weight: { type: Number },
    cod: { type: Number },
    insval: { type: Number },
    vpp: { type: String },
    l: { type: Number },
    b: { type: Number },
    h: { type: Number },
    contenttype: { type: String },
    priority: { type: String },
    product: { type: String },
    altmobile: { type: String },
    cr: { type: String, index: true },
    date: { type: Date, index: true },
    typing: { type: String },
    branch: { type: String, index: true },
    status: {
        type: String,
        enum: ['Completed'],
        default: 'Completed'
    },
}, { timestamps: true });

module.exports = mongoose.model('CompletedBookingData', completedBookingDataSchema);
