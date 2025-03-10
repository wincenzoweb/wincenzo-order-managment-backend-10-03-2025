const Branch = require('../models/branchModel');

exports.getBranches = async (req, res) => {
    try {
        const branches = await Branch.find();
        res.json(branches);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getBranchById = async (req, res) => {
    try {
        const branch = await Branch.findById(req.params.id);
        if (!branch) return res.status(404).json({ message: 'Branch not found' });
        res.json(branch);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createBranch = async (req, res) => {
    const { branchName, branchId, branchAddress, branchManagerName } = req.body;

    const newBranch = new Branch({
        branchName,
        branchId,
        branchAddress,
        branchManagerName
    });

    try {
        const branch = await newBranch.save();
        res.status(201).json({ message: 'Branch Added successfully', branch });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateBranch = async (req, res) => {
    const { branchName, branchId, branchAddress, branchManagerName } = req.body;

    try {
        const branch = await Branch.findById(req.params.id);
        if (!branch) return res.status(404).json({ message: 'Branch not found' });

        branch.branchName = branchName || branch.branchName;
        branch.branchId = branchId || branch.branchId;
        branch.branchAddress = branchAddress || branch.branchAddress;
        branch.branchManagerName = branchManagerName || branch.branchManagerName;

        await branch.save();
        res.json({ message: 'Branch Update successfully', branch });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


exports.deleteBranch = async (req, res) => {
    try {
        const branch = await Branch.findByIdAndDelete(req.params.id);
        if (!branch) return res.status(404).json({ message: 'Branch not found' });

        res.json({ message: 'Branch deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
