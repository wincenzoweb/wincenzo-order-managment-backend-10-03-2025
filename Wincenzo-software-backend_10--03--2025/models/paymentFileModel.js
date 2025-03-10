const mongoose = require("mongoose");

const paymentFileSchema = new mongoose.Schema({
    amount_lc_1: { type: Number },
    amount_lc_2: { type: Number },
    article_number: { type: String, index: true },
    article_type: { type: String },
    booking_date: { type: Date },
    booking_office_id: { type: String },
    booking_office_name: { type: String },
    booking_office_pin: { type: String },
    booking_time: { type: Number },
    commission: { type: Number },
    delivery_date: { type: Date },
    delivery_office_id: { type: String },
    delivery_office_name: { type: String },
    delivery_office_pin: { type: String },
    gross_amount: { type: Number },
    liability_document: { type: String },
    net_payable: { type: Number },
    payment_cheque_no: { type: String },
    payment_date: { type: Date },
    payment_document_no: { type: String },
    payment_office_id: { type: String },
    payment_office_name: { type: String },
    round_off_amount: { type: Number },
    rts: { type: String },
    system_postings: { type: String },
    branch: { type: String, index: true },
    status: { type: String },
});

paymentFileSchema.index({ article_number: 1, status: 1, branch: 1 });

module.exports = mongoose.model("PaymentData", paymentFileSchema);
