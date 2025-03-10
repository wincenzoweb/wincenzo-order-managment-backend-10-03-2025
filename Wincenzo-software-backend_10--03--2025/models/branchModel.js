const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BranchSchema = new Schema({
    branchName: {
        type: String,
        index: true,
        required: true
    },
    branchId: {
        type: String,
        required: true
    },
    branchAddress: {
        type: String,
        required: true
    },
    branchManagerName: {
        type: String,
        required: true
    }
});

BranchSchema.index({ branchName: 1 })

module.exports = Branch = mongoose.model('Branch', BranchSchema);
