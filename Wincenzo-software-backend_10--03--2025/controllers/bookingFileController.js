// controllers/dataController.js
const BookingData = require('../models/bookingFileModel');
const PaymentData = require('../models/paymentFileModel');
const PendingOrder = require('../models/pendingOrderModel');
const ReturnAndPendingData = require('../models/ReturnAndPendingFileModel');
const Joi = require('joi');

// Define Joi schema to match Mongoose schema (only keys)
const bookingDataSchemaKeys = Joi.object().keys({
    sl: Joi.any(),
    barcode: Joi.any(),
    ref: Joi.any(),
    city: Joi.any(),
    pincode: Joi.any(),
    name: Joi.any(),
    add1: Joi.any(),
    add2: Joi.any(),
    add3: Joi.any(),
    addremail: Joi.any(),
    addrmobile: Joi.any(),
    sendermobile: Joi.any(),
    weight: Joi.any(),
    cod: Joi.any(),
    insval: Joi.any(),
    vpp: Joi.any(),
    l: Joi.any(),
    b: Joi.any(),
    h: Joi.any(),
    contenttype: Joi.any(),
    priority: Joi.any(),
    product: Joi.any(),
    altmobile: Joi.any(),
    cr: Joi.any(),
    date: Joi.any(),
    typing: Joi.any(),
    branch: Joi.any(),
    status: Joi.any()
});

//Latest code
// exports.receiveData = async (req, res) => {
//     try {
//         // Check if the user has the 'admin' role
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied. Only admins can insert data.' });
//         }

//         const dataArray = req.body;
//         console.log("firds", dataArray)
//         if (!Array.isArray(dataArray)) {
//             return res.status(400).json({ message: 'Data should be an array of objects' });
//         }

//         // Validate keys of each object in the array against the schema keys
//         for (const data of dataArray) {
//             const dataKeys = Object.keys(data);
//             const schemaKeys = Object.keys(bookingDataSchemaKeys.describe().keys);

//             // Check if all keys in data are in schema
//             const extraKeys = dataKeys.filter(key => !schemaKeys.includes(key));
//             if (extraKeys.length > 0) {
//                 return res.status(400).json({ message: `File Validation error: Extra Column found : ${extraKeys.join(', ')}` });
//             }

//             // Check if all keys in schema are in data
//             const missingKeys = schemaKeys.filter(key => !dataKeys.includes(key));
//             if (missingKeys.length > 0) {
//                 return res.status(400).json({ message: `File Validation error: Missing Column : ${missingKeys.join(', ')}` });
//             }

//             // Set default status to 'Processing' if it is an empty string
//             if (!data.status || data.status.trim() === '') {
//                 data.status = 'Processing';
//             }
//         }

//         // Insert data into the database (assuming keys are valid)
//         const savedData = await BookingData.insertMany(dataArray);
//         const count = savedData.length
//         res.status(200).json({ message: `${count} Data received and saved successfully`, data: savedData });
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// };



exports.receiveData = async (req, res) => {
    try {
        // Check if the user has the 'admin' role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Only admins can insert data.' });
        }

        const dataArray = req.body;
        console.log("Received dataArray:", dataArray);

        if (!Array.isArray(dataArray)) {
            dataArray = [dataArray]; 
            return res.status(400).json({ message: 'Data should be an array of objects' });
        }

        // Validate keys of each object in the array against the schema keys
        for (const data of dataArray) {
            const dataKeys = Object.keys(data);
            const schemaKeys = Object.keys(bookingDataSchemaKeys.describe().keys);

            // Check if all keys in data are in schema
            const extraKeys = dataKeys.filter(key => !schemaKeys.includes(key));
            if (extraKeys.length > 0) {
                return res.status(400).json({ message: `File Validation error: Extra Column found : ${extraKeys.join(', ')}` });
            }

            // Check if all keys in schema are in data
            const missingKeys = schemaKeys.filter(key => !dataKeys.includes(key));
            if (missingKeys.length > 0) {
                return res.status(400).json({ message: `File Validation error: Missing Column : ${missingKeys.join(', ')}` });
            }

            // Check if barcode is present and not empty
            // if (!data.barcode || data.barcode.trim() === '') {
            //     console.error("Validation error: Barcode is required for data:", data);
            //     return res.status(400).json({ message: 'Validation error: Barcode is required.' });
            // }

            // if (typeof data.barcode !== 'string' || data.barcode.trim() === '') {
            //     console.error("Validation error: Barcode is required and must be a string:", data);
            //     return res.status(400).json({ message: 'Validation error: Barcode is required and must be a string.' });
            // }
            

            if (!data.barcode || String(data.barcode).trim() === '') {
                console.error("Validation error: Barcode is required for data:", data);
                return res.status(400).json({ message: 'Validation error: Barcode is required.' });
            }
            

            // Set default status to 'Processing' if it is an empty string
            if (!data.status || data.status.trim() === '') {
                data.status = 'Processing';
            }
        }

        // Insert data into the database (assuming keys are valid)
        const savedData = await BookingData.insertMany(dataArray);
        const count = savedData.length;

        res.status(200).json({ message: `${count} Data received and saved successfully`, data: savedData });
    } catch (err) {
        console.error("Error:", err); // Log the error for debugging
        res.status(400).json({ message: err.message });
    }
};


exports.getAllData = async (req, res) => {
    try {
        let allData;
        let totalData;
        // Check user role
        if (req.user.role === 'admin' || req.user.role === 'branchAdmin' || req.user.role === 'employee') {
            // Admin can access all data
            allData = await BookingData.find();
            totalData = await BookingData.countDocuments();
            // } else if (req.user.role === 'branchAdmin' || req.user.role === 'employee') {
            //     // Branch Admin and Employee can access data within their branch
            //     const branch = req.user.branch; // Assuming branch information is stored in req.user
            //     allData = await BookingData.find({ branch: branch });
            //     totalData = await BookingData.countDocuments({ branch: branch });
        } else {
            // Other roles are not authorized to access data
            return res.status(403).json({ error: 'Access denied. Unauthorized role.' });
        }
        // Send success response
        res.status(200).json({ totalData, data: allData });
    } catch (err) {
        // Send error response
        res.status(400).json({ error: err.message });
    }
};


exports.getDataById = async (req, res) => {
    try {
        const data = await BookingData.findById(req.params.bookingid);
        if (!data) {
            return res.status(404).json({ message: 'Data not found' });
        }
        res.status(200).json(data);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// exports.updateDataById = async (req, res) => {
//     try {
//         // Check if the user has the 'admin' role
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied. Only admins can insert data.' });
//         }

//         const data = await BookingData.findByIdAndUpdate(req.params.bookingid, req.body,
//             { new: true, runValidators: true });
//         if (!data) {
//             return res.status(404).json({ message: 'Data not found' });
//         }
//         res.status(200).json({ message: 'Data Update successfully', data });
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// };


exports.updateDataById = async (req, res) => {
    try {
        // Check if the user has the 'admin' role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Only admins can update data.' });
        }

        const data = await BookingData.findByIdAndUpdate(req.params.bookingid, req.body, {
            new: true,
            runValidators: true,
        });

        if (!data) {
            return res.status(404).json({ message: 'Data not found' });
        }
        
        res.status(200).json({ message: 'Data updated successfully', data });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


exports.deleteDataById = async (req, res) => {
    try {
        // Check if the user has the 'admin' role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Only admins can insert data.' });
        }
        const bookingId = req.params.bookingid
        const data = await BookingData.findByIdAndDelete(bookingId);
        if (!data) {
            return res.status(404).json({ message: 'Data not found' });
        }
        res.status(200).json({ message: 'Data deleted successfully', data });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteMultipleData = async (req, res) => {

    try {
        // Check if the user has the 'admin' role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Only admins can insert data.' });
        }
        const ids = req.body.ids;

        if (!Array.isArray(ids)) {
            return res.status(400).json({ error: 'IDs should be an array of strings' });
        }

        const foundDocuments = await BookingData.find({ _id: { $in: ids } });

        if (foundDocuments.length !== ids.length) {
            const foundIds = foundDocuments.map(doc => doc._id.toString());
            const notFoundIds = ids.filter(id => !foundIds.includes(id));
            return res.status(404).json({ error: 'Some IDs were not found', notFoundIds });
        }

        const result = await BookingData.deleteMany({ _id: { $in: ids } });
        res.status(200).json({ message: 'Data deleted successfully', deletedCount: result.deletedCount, deletedData: foundDocuments });
    } catch (err) {

        res.status(400).json({ error: err.message });
    }
};

// exports.getPaginatedData = async (req, res) => {
//     try {
//         let { page, limit, search, startDate, endDate } = req.query;
//         page = parseInt(page) || 1;
//         limit = parseInt(limit) || 10;
//         search = search ? search.trim() : "";

//         let dataQuery;

//         if (req.user.role === 'admin' || req.user.role === 'branchAdmin' || req.user.role === 'employee') {
//             dataQuery = BookingData.find();

//             const searchConditions = [];
//             const dateConditions = [];

//             if (search) {
//                 // Split search terms by commas
//                 const searchTerms = search.split(',').map(term => term.trim());

//                 const combinedConditions = searchTerms.map(term => {
//                     const conditions = [];
//                     if (term) {
//                         // Convert spaces to plus signs for product search
//                         const formattedSearch = term.replace(/ /g, '+');

//                         // Exact match for the product field
//                         conditions.push({ product: formattedSearch });

//                         // For other fields, use regex with escaped characters
//                         const escapeRegex = (string) => {
//                             return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
//                         };
//                         const escapedSearch = escapeRegex(term);

//                         conditions.push(
//                             { barcode: { $regex: escapedSearch, $options: "i" } },
//                             { ref: { $regex: escapedSearch, $options: "i" } },
//                             { city: { $regex: escapedSearch, $options: "i" } },
//                             { pincode: { $regex: escapedSearch, $options: "i" } },
//                             { name: { $regex: escapedSearch, $options: "i" } },
//                             { add1: { $regex: escapedSearch, $options: "i" } },
//                             { add2: { $regex: escapedSearch, $options: "i" } },
//                             { add3: { $regex: escapedSearch, $options: "i" } },
//                             { addremail: { $regex: escapedSearch, $options: "i" } },
//                             { addrmobile: { $regex: escapedSearch, $options: "i" } },
//                             { sendermobile: { $regex: escapedSearch, $options: "i" } },
//                             { cr: { $regex: escapedSearch, $options: "i" } },
//                             { branch: { $regex: escapedSearch, $options: "i" } },
//                             { status: { $regex: escapedSearch, $options: "i" } },
//                             { vpp: { $regex: escapedSearch, $options: "i" } },
//                             { contenttype: { $regex: escapedSearch, $options: "i" } },
//                             { priority: { $regex: escapedSearch, $options: "i" } },
//                             { typing: { $regex: escapedSearch, $options: "i" } },
//                             { altmobile: { $regex: escapedSearch, $options: "i" } }
//                         );

//                         if (!isNaN(term)) {
//                             conditions.push(
//                                 { sl: parseInt(term) },
//                                 { weight: parseFloat(term) },
//                                 { cod: parseFloat(term) },
//                                 { insval: parseFloat(term) },
//                                 { l: parseFloat(term) },
//                                 { b: parseFloat(term) },
//                                 { h: parseFloat(term) }
//                             );
//                         }

//                         const searchDate = new Date(term);

//                         if (!isNaN(searchDate)) {
//                             conditions.push({
//                                 date: {
//                                     $gte: new Date(searchDate.setHours(0, 0, 0)),
//                                     $lt: new Date(searchDate.setHours(23, 59, 59))
//                                 }
//                             });
//                         }
//                     }
//                     return { $or: conditions };
//                 });

//                 if (combinedConditions.length > 0) {
//                     dataQuery = dataQuery.find({
//                         $and: combinedConditions
//                     });
//                 }
//             }

//             if (startDate && endDate) {
//                 const start = new Date(startDate).setHours(0, 0, 0, 0);
//                 const end = new Date(endDate).setHours(23, 59, 59, 999);
//                 if (!isNaN(start) && !isNaN(end)) {
//                     dateConditions.push({
//                         date: {
//                             $gte: new Date(start),
//                             $lte: new Date(end)
//                         }
//                     });
//                 }
//             }

//             if (searchConditions.length > 0 && dateConditions.length > 0) {
//                 dataQuery = dataQuery.find({
//                     $and: [
//                         ...searchConditions,
//                         ...dateConditions
//                     ]
//                 });
//             } else if (searchConditions.length > 0) {
//                 dataQuery = dataQuery.find({
//                     $and: searchConditions
//                 });
//             } else if (dateConditions.length > 0) {
//                 dataQuery = dataQuery.find({
//                     $and: dateConditions
//                 });
//             }

//         } else {
//             return res.status(403).json({ message: 'Access denied. Unauthorized role.' });
//         }

//         const totalData = await BookingData.countDocuments(dataQuery.getFilter());
//         const data = await dataQuery.skip((page - 1) * limit).limit(limit).exec();

//         res.status(200).json({
//             totalData,
//             totalPages: Math.ceil(totalData / limit),
//             currentPage: page,
//             data
//         });
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// };



exports.getPaginatedData = async (req, res) => {
    try {
        let { page, limit, search, startDate, endDate, filterByDuplicateBarcode ,filterByUnknownBarcode   } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        search = search ? search.trim() : "";
        filterByDuplicateBarcode = filterByDuplicateBarcode === 'true';
        filterByUnknownBarcode = filterByUnknownBarcode === 'true';

    

        let dataQuery;

        if (req.user.role === 'admin' || req.user.role === 'branchAdmin' || req.user.role === 'employee') {
            // Adjust data query based on user role
            dataQuery = BookingData.find();

            const searchConditions = [];
            const dateConditions = [];

            if (search) {
                // Split search terms by commas
                const searchTerms = search.split(',').map(term => term.trim());

                const combinedConditions = searchTerms.map(term => {
                    const conditions = [];
                    if (term) {
                        // Convert spaces to plus signs for product search
                        const formattedSearch = term.replace(/ /g, '+');

                        // Exact match for the product field
                        conditions.push({ product: formattedSearch });

                        // For other fields, use regex with escaped characters
                        const escapeRegex = (string) => {
                            return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
                        };
                        const escapedSearch = escapeRegex(term);

                        conditions.push(
                            { barcode: { $regex: escapedSearch, $options: "i" } },
                            { ref: { $regex: escapedSearch, $options: "i" } },
                            { city: { $regex: escapedSearch, $options: "i" } },
                            { pincode: { $regex: escapedSearch, $options: "i" } },
                            { name: { $regex: escapedSearch, $options: "i" } },
                            { add1: { $regex: escapedSearch, $options: "i" } },
                            { add2: { $regex: escapedSearch, $options: "i" } },
                            { add3: { $regex: escapedSearch, $options: "i" } },
                            { addremail: { $regex: escapedSearch, $options: "i" } },
                            { addrmobile: { $regex: escapedSearch, $options: "i" } },
                            { sendermobile: { $regex: escapedSearch, $options: "i" } },
                            { cr: { $regex: escapedSearch, $options: "i" } },
                            { branch: { $regex: escapedSearch, $options: "i" } },
                            { status: { $regex: escapedSearch, $options: "i" } },
                            { vpp: { $regex: escapedSearch, $options: "i" } },
                            { contenttype: { $regex: escapedSearch, $options: "i" } },
                            { priority: { $regex: escapedSearch, $options: "i" } },
                            { typing: { $regex: escapedSearch, $options: "i" } },
                            { altmobile: { $regex: escapedSearch, $options: "i" } }
                        );

                        if (!isNaN(term)) {
                            conditions.push(
                                { sl: parseInt(term) },
                                { weight: parseFloat(term) },
                                { cod: parseFloat(term) },
                                { insval: parseFloat(term) },
                                { l: parseFloat(term) },
                                { b: parseFloat(term) },
                                { h: parseFloat(term) }
                            );
                        }

                        const searchDate = new Date(term);

                        if (!isNaN(searchDate)) {
                            conditions.push({
                                date: {
                                    $gte: new Date(searchDate.setHours(0, 0, 0)),
                                    $lt: new Date(searchDate.setHours(23, 59, 59))
                                }
                            });
                        }
                    }
                    return { $or: conditions };
                });

                if (combinedConditions.length > 0) {
                    dataQuery = dataQuery.find({
                        $and: combinedConditions
                    });
                }
            }

            if (startDate && endDate) {
                const start = new Date(startDate).setHours(0, 0, 0, 0);
                const end = new Date(endDate).setHours(23, 59, 59, 999);
                if (!isNaN(start) && !isNaN(end)) {
                    dateConditions.push({
                        date: {
                            $gte: new Date(start),
                            $lte: new Date(end)
                        }
                    });
                }
            }

            if (searchConditions.length > 0 && dateConditions.length > 0) {
                dataQuery = dataQuery.find({
                    $and: [
                        ...searchConditions,
                        ...dateConditions
                    ]
                });
            } else if (searchConditions.length > 0) {
                dataQuery = dataQuery.find({
                    $and: searchConditions
                });
            } else if (dateConditions.length > 0) {
                dataQuery = dataQuery.find({
                    $and: dateConditions
                });
            }

            // Apply filterByDuplicateBarcode logic
            // if (filterByDuplicateBarcode) {
            //     const barcodeCounts = await BookingData.aggregate([
            //         { $group: { _id: "$barcode", count: { $sum: 1 } } },
            //         { $match: { count: { $gt: 1 } } },
            //         { $project: { _id: 1 } }
            //     ]);

            //     const duplicateBarcodes = barcodeCounts.map(bc => bc._id);

            //     dataQuery = dataQuery.find({
            //         barcode: { $in: duplicateBarcodes }
            //     });
            // }
            let totalSameDuplicateNumbers = 0;
            if (filterByDuplicateBarcode) {
                const barcodeCounts = await BookingData.aggregate([
                    { $group: { _id: "$barcode", count: { $sum: 1 } } },
                    { $match: { count: { $gt: 1 } } },
                    { $project: { _id: 1 } }
                ]);
      
                const duplicateBarcodes = barcodeCounts.map(bc => bc._id);
                dataQuery = dataQuery.find({ barcode: { $in: duplicateBarcodes } });
                totalSameDuplicateNumbers = barcodeCounts.length;
            }
      
           // Apply filterByUnknownBarcode logic
            let totalUnknownBarcodeNumbers = 0;
            if (filterByUnknownBarcode) {
                const unknownBarcodes = await BookingData.find({
                    $or: [
                        { product: { $exists: false } },
                        {
                            $and: [
                                { barcode: { $exists: true } },
                                { status: { $exists: true } },
                                { $expr: { $eq: [{ $size: { $objectToArray: "$$ROOT" } }, 3] } }
                            ]
                        }
                    ]
                });
      
                totalUnknownBarcodeNumbers = unknownBarcodes.length;
                dataQuery = dataQuery.find({
                    $or: [
                        { product: { $exists: false } },
                        {
                            $and: [
                                { barcode: { $exists: true } },
                                { status: { $exists: true } },
                                { $expr: { $eq: [{ $size: { $objectToArray: "$$ROOT" } }, 3] } }
                            ]
                        }
                    ]
                });
            }
            const totalData = await BookingData.countDocuments(dataQuery.getFilter());
            const data = await dataQuery.skip((page - 1) * limit).limit(limit).exec();

            res.status(200).json({
                totalData,
                totalPages: Math.ceil(totalData / limit),
                currentPage: page,
                data,
                totalSameDuplicateNumbers,
                totalUnknownBarcodeNumbers,
                
            });
        } else {
            return res.status(403).json({ message: 'Access denied. Unauthorized role.' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};



// Controller: Booking File Duplicates
// exports.getDuplicateBookingNumbers = async (req, res) => {
//     try {
//         let duplicates;

//         // Check user role
//         if (req.user.role === 'admin') {
//             // Admin can check for duplicates in all booking data
//             duplicates = await BookingData.aggregate([
//                 { $group: { _id: "$barcode", count: { $sum: 1 } } }, // Group by barcode
//                 { $match: { count: { $gt: 1 } } }, // Only keep duplicates
//                 { $project: { _id: 0, barcode: "$_id" } } // Project barcode instead of _id
//             ]);
//         } else if (req.user.role === 'branchAdmin' || req.user.role === 'employee') {
//             // Branch Admin and Employee can check for duplicates within their branch
//             const branch = req.user.branch; // Assuming branch information is stored in req.user
//             duplicates = await BookingData.aggregate([
//                 { $match: { branch: branch } }, // Filter by the user's branch
//                 { $group: { _id: "$barcode", count: { $sum: 1 } } }, // Group by barcode
//                 { $match: { count: { $gt: 1 } } }, // Only keep duplicates
//                 { $project: { _id: 0, barcode: "$_id" } } // Project barcode instead of _id
//             ]);
//         } else {
//             // Other roles are not authorized to access data
//             return res.status(403).json({ error: 'Access denied. Unauthorized role.' });
//         }

//         // Extract barcode numbers from the result
//         const barcodeNumbers = duplicates.map(duplicate => duplicate.barcode);

//         // Send success response
//         res.status(200).json({ duplicates: barcodeNumbers });
//     } catch (err) {
//         // Send error response
//         res.status(400).json({ error: err.message });
//     }
// };







// exports.getDuplicateBarcodes = async (req, res) => {
//     try {
//         let duplicates;

//         // Check user role
//         if (req.user.role === 'admin') {
//             // Admin can check for duplicates in all data
//             duplicates = await BookingData.aggregate([
//                 { $group: { _id: "$barcode", count: { $sum: 1 } } },
//                 { $match: { count: { $gt: 1 } } },
//                 { $project: { _id: 1 } }
//             ]);
//         } else if (req.user.role === 'branchAdmin' || req.user.role === 'employee') {
//             // Branch Admin and Employee can check for duplicates within their branch
//             const branch = req.user.branch; // Assuming branch information is stored in req.user
//             duplicates = await BookingData.aggregate([
//                 { $match: { branch: branch } },
//                 { $group: { _id: "$barcode", count: { $sum: 1 } } },
//                 { $match: { count: { $gt: 1 } } },
//                 { $project: { _id: 1 } }
//             ]);
//         } else {
//             // Other roles are not authorized to access data
//             return res.status(403).json({ error: 'Access denied. Unauthorized role.' });
//         }

//         // Extract barcode numbers from the result
//         const barcodes = duplicates.map(duplicate => duplicate._id);

//         // Send success response
//         res.status(200).json({ duplicates: barcodes });
//     } catch (err) {
//         // Send error response
//         res.status(400).json({ error: err.message });
//     }
// };





  
exports.getDuplicateBarcodes = async (req, res) => {

        let duplicates;
console.log("jfe",duplicates);
        // Check user role
        if (req.user.role === 'admin') {
            // Admin can check for duplicates in all data
            duplicates = await BookingData.aggregate([
                { $group: { _id: "$barcode", count: { $sum: 1 } } },
                { $match: { count: { $gt: 1 } } },
                { $project: { _id: 1 } }
            ]);
        } else if (req.user.role === 'branchAdmin' || req.user.role === 'employee') {
            // Branch Admin and Employee can check for duplicates within their branch
            const branch = req.user.branch; // Assuming branch information is stored in req.user
            duplicates = await BookingData.aggregate([
                { $match: { branch: branch } },
                { $group: { _id: "$barcode", count: { $sum: 1 } } },
                { $match: { count: { $gt: 1 } } },
                { $project: { _id: 1 } }
            ]);
        } else {
            // Other roles are not authorized to access data
            return res.status(403).json({ error: 'Access denied. Unauthorized role.' });
        }

        // Extract barcode numbers from the result
        const barcodes = duplicates.map(duplicate => duplicate._id);

        // Send success response
        res.status(200).json({ duplicates: barcodes });
    }; 
  
  


// controllers/helloController.js



// exports.getDuplicateBookingNumbers = async (req, res) => {
//     try {
//         const { barcode } = req.query;

//         console.log('Received request to get duplicate bookings');
//         console.log('Barcode:', barcode);

//         if (!barcode) {
//             console.log('Error: Barcode is required');
//             return res.status(400).json({ message: 'Barcode is required' });
//         }

//         // Ensure that barcode is a string and not an ObjectId
//         if (typeof barcode !== 'string') {
//             console.log('Error: Invalid barcode format');
//             return res.status(400).json({ message: 'Invalid barcode format' });
//         }

//         // Find all documents with the same barcode
//         const duplicateBookings = await BookingData.find({ barcode });

//         console.log('Found duplicate bookings:', duplicateBookings);

//         if (duplicateBookings.length === 0) {
//             console.log('No duplicates found');
//             return res.status(404).json({ message: 'No duplicates found' });
//         }

//         return res.status(200).json(duplicateBookings);
//     } catch (error) {
//         console.error('Error fetching duplicate bookings:', error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// };





  





// exports.getPaginatedData = async (req, res) => {
//     try {
//         let { page, limit, search, startDate, endDate } = req.query;
//         page = parseInt(page) || 1;
//         limit = parseInt(limit) || 10;
//         search = search ? search.trim() : "";

//         let dataQuery;

//         if (req.user.role === 'admin' || req.user.role === 'branchAdmin' || req.user.role === 'employee') {
//             dataQuery = BookingData.find();

//             const searchConditions = [];
//             const dateConditions = [];

//             if (search) {
//                 // Convert spaces to plus signs for product search
//                 const formattedSearch = search.replace(/ /g, '+');

//                 // Exact match for the product field
//                 searchConditions.push({ product: formattedSearch });

//                 // For other fields, use regex with escaped characters
//                 const escapeRegex = (string) => {
//                     return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
//                 };
//                 const escapedSearch = escapeRegex(search);

//                 searchConditions.push(
//                     { barcode: { $regex: escapedSearch, $options: "i" } },
//                     { ref: { $regex: escapedSearch, $options: "i" } },
//                     { city: { $regex: escapedSearch, $options: "i" } },
//                     { pincode: { $regex: escapedSearch, $options: "i" } },
//                     { name: { $regex: escapedSearch, $options: "i" } },
//                     { add1: { $regex: escapedSearch, $options: "i" } },
//                     { add2: { $regex: escapedSearch, $options: "i" } },
//                     { add3: { $regex: escapedSearch, $options: "i" } },
//                     { addremail: { $regex: escapedSearch, $options: "i" } },
//                     { addrmobile: { $regex: escapedSearch, $options: "i" } },
//                     { sendermobile: { $regex: escapedSearch, $options: "i" } },
//                     { cr: { $regex: escapedSearch, $options: "i" } },
//                     { branch: { $regex: escapedSearch, $options: "i" } },
//                     { status: { $regex: escapedSearch, $options: "i" } },
//                     { vpp: { $regex: escapedSearch, $options: "i" } },
//                     { contenttype: { $regex: escapedSearch, $options: "i" } },
//                     { priority: { $regex: escapedSearch, $options: "i" } },
//                     { typing: { $regex: escapedSearch, $options: "i" } },
//                     { altmobile: { $regex: escapedSearch, $options: "i" } }
//                 );

//                 if (!isNaN(search)) {
//                     searchConditions.push(
//                         { sl: parseInt(search) },
//                         { weight: parseFloat(search) },
//                         { cod: parseFloat(search) },
//                         { insval: parseFloat(search) },
//                         { l: parseFloat(search) },
//                         { b: parseFloat(search) },
//                         { h: parseFloat(search) }
//                     );
//                 }

//                 const searchDate = new Date(search);

//                 if (!isNaN(searchDate)) {
//                     searchConditions.push({
//                         date: {
//                             $gte: new Date(searchDate.setHours(0, 0, 0)),
//                             $lt: new Date(searchDate.setHours(23, 59, 59))
//                         }
//                     });
//                 }
//             }

//             if (startDate && endDate) {
//                 const start = new Date(startDate).setHours(0, 0, 0, 0);
//                 const end = new Date(endDate).setHours(23, 59, 59, 999);
//                 if (!isNaN(start) && !isNaN(end)) {
//                     dateConditions.push({
//                         date: {
//                             $gte: new Date(start),
//                             $lte: new Date(end)
//                         }
//                     });
//                 }
//             }

//             if (searchConditions.length > 0 && dateConditions.length > 0) {
//                 dataQuery = dataQuery.find({
//                     $and: [
//                         { $or: searchConditions },
//                         ...dateConditions
//                     ]
//                 });
//             } else if (searchConditions.length > 0) {
//                 dataQuery = dataQuery.find({
//                     $or: searchConditions
//                 });
//             } else if (dateConditions.length > 0) {
//                 dataQuery = dataQuery.find({
//                     $and: dateConditions
//                 });
//             }

//         } else {
//             return res.status(403).json({ message: 'Access denied. Unauthorized role.' });
//         }

//         const totalData = await BookingData.countDocuments(dataQuery.getFilter());
//         const data = await dataQuery.skip((page - 1) * limit).limit(limit).exec();

//         res.status(200).json({
//             totalData,
//             totalPages: Math.ceil(totalData / limit),
//             currentPage: page,
//             data
//         });
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// };


// exports.getPaginatedData = async (req, res) => {
//     try {
//         let { page, limit, search, startDate, endDate } = req.query;
//         page = parseInt(page) || 1;
//         limit = parseInt(limit) || 10;
//         search = search ? search.trim() : "";

//         let dataQuery;

//         if (req.user.role === 'admin' || req.user.role === 'branchAdmin' || req.user.role === 'employee') {
//             dataQuery = BookingData.find();

//             const searchConditions = [];

//             if (search) {
//                 // Convert spaces to plus signs for product search
//                 const formattedSearch = search.replace(/ /g, '+');

//                 // Exact match for the product field
//                 searchConditions.push({ product: formattedSearch });

//                 // For other fields, use regex with escaped characters
//                 const escapeRegex = (string) => {
//                     return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
//                 };
//                 const escapedSearch = escapeRegex(search);

//                 searchConditions.push(
//                     { ref: { $regex: escapedSearch, $options: "i" } },
//                     { city: { $regex: escapedSearch, $options: "i" } },
//                     { pincode: { $regex: escapedSearch, $options: "i" } },
//                     { name: { $regex: escapedSearch, $options: "i" } },
//                     { add1: { $regex: escapedSearch, $options: "i" } },
//                     { add2: { $regex: escapedSearch, $options: "i" } },
//                     { add3: { $regex: escapedSearch, $options: "i" } },
//                     { addremail: { $regex: escapedSearch, $options: "i" } },
//                     { addrmobile: { $regex: escapedSearch, $options: "i" } },
//                     { sendermobile: { $regex: escapedSearch, $options: "i" } },
//                     { cr: { $regex: escapedSearch, $options: "i" } },
//                     { branch: { $regex: escapedSearch, $options: "i" } },
//                     { status: { $regex: escapedSearch, $options: "i" } },
//                     { vpp: { $regex: escapedSearch, $options: "i" } },
//                     { contenttype: { $regex: escapedSearch, $options: "i" } },
//                     { priority: { $regex: escapedSearch, $options: "i" } },
//                     { typing: { $regex: escapedSearch, $options: "i" } },
//                     { altmobile: { $regex: escapedSearch, $options: "i" } }
//                 );

//                 if (!isNaN(search)) {
//                     searchConditions.push(
//                         { sl: parseInt(search) },
//                         { weight: parseFloat(search) },
//                         { cod: parseFloat(search) },
//                         { insval: parseFloat(search) },
//                         { l: parseFloat(search) },
//                         { b: parseFloat(search) },
//                         { h: parseFloat(search) }
//                     );
//                 }

//                 const searchDate = new Date(search);

//                 if (!isNaN(searchDate)) {
//                     searchConditions.push({
//                         date: {
//                             $gte: new Date(searchDate.setHours(0, 0, 0)),
//                             $lt: new Date(searchDate.setHours(23, 59, 59))
//                         }
//                     });
//                 }
//             }

//             if (startDate && endDate) {
//                 const start = new Date(startDate).setHours(0, 0, 0, 0);
//                 const end = new Date(endDate).setHours(23, 59, 59, 999);
//                 if (!isNaN(start) && !isNaN(end)) {
//                     searchConditions.push({
//                         date: {
//                             $gte: new Date(start),
//                             $lte: new Date(end)
//                         }
//                     });
//                 }
//             }

//             if (searchConditions.length > 0) {
//                 dataQuery = dataQuery.find({ $or: searchConditions });
//             }

//         } else {
//             return res.status(403).json({ message: 'Access denied. Unauthorized role.' });
//         }

//         const totalData = await BookingData.countDocuments(dataQuery.getFilter());
//         const data = await dataQuery.skip((page - 1) * limit).limit(limit).exec();

//         res.status(200).json({
//             totalData,
//             totalPages: Math.ceil(totalData / limit),
//             currentPage: page,
//             data
//         });
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// };



// exports.getPaginatedData = async (req, res) => {
//     try {
//         let { page, limit, search, startDate, endDate, filter } = req.query;
//         page = parseInt(page) || 1;
//         limit = parseInt(limit) || 10;
//         search = search ? search.trim() : "";

//         let dataQuery;

//         if (req.user.role === 'admin' || req.user.role === 'branchAdmin' || req.user.role === 'employee') {
//             // Step 1: Retrieve necessary data
//             const bookingdata = await BookingData.find({});
//             const paymentdata = await PaymentData.find({});
//             const pendingOrder = await PendingOrder.find({});
//             const returnAndPendingData = await ReturnAndPendingData.find({});

//             // Step 2: Apply filter condition using switch case
//             switch (filter) {
//                 case 'payment':
//                     dataQuery = bookingdata.filter(booking =>
//                         paymentdata.some(payment => payment.article_number === booking.barcode));
//                     break;
//                 case 'return':
//                     dataQuery = bookingdata.filter(booking =>
//                         returnAndPendingData.some(item => item.barcode === booking.barcode));
//                     break;
//                 case 'pending':
//                     dataQuery = bookingdata.filter(booking =>
//                         pendingOrder.some(item => item.barcode === booking.barcode));
//                     break;
//                 case undefined:
//                 case '':
//                     dataQuery = BookingData.find();
//                     break;
//                 default:
//                     return res.status(400).json({ message: 'Invalid filter value' });
//             }

//             const searchConditions = [];

//             if (search) {
//                 // Convert spaces to plus signs for product search
//                 const formattedSearch = search.replace(/ /g, '+');

//                 // Exact match for the product field
//                 searchConditions.push({ product: formattedSearch });

//                 // For other fields, use regex with escaped characters
//                 const escapeRegex = (string) => {
//                     return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
//                 };
//                 const escapedSearch = escapeRegex(search);

//                 searchConditions.push(
//                     { ref: { $regex: escapedSearch, $options: "i" } },
//                     { city: { $regex: escapedSearch, $options: "i" } },
//                     { pincode: { $regex: escapedSearch, $options: "i" } },
//                     { name: { $regex: escapedSearch, $options: "i" } },
//                     { add1: { $regex: escapedSearch, $options: "i" } },
//                     { add2: { $regex: escapedSearch, $options: "i" } },
//                     { add3: { $regex: escapedSearch, $options: "i" } },
//                     { addremail: { $regex: escapedSearch, $options: "i" } },
//                     { addrmobile: { $regex: escapedSearch, $options: "i" } },
//                     { sendermobile: { $regex: escapedSearch, $options: "i" } },
//                     { cr: { $regex: escapedSearch, $options: "i" } },
//                     { branch: { $regex: escapedSearch, $options: "i" } },
//                     { status: { $regex: escapedSearch, $options: "i" } },
//                     { vpp: { $regex: escapedSearch, $options: "i" } },
//                     { contenttype: { $regex: escapedSearch, $options: "i" } },
//                     { priority: { $regex: escapedSearch, $options: "i" } },
//                     { typing: { $regex: escapedSearch, $options: "i" } },
//                     { altmobile: { $regex: escapedSearch, $options: "i" } }
//                 );

//                 if (!isNaN(search)) {
//                     searchConditions.push(
//                         { sl: parseInt(search) },
//                         { weight: parseFloat(search) },
//                         { cod: parseFloat(search) },
//                         { insval: parseFloat(search) },
//                         { l: parseFloat(search) },
//                         { b: parseFloat(search) },
//                         { h: parseFloat(search) }
//                     );
//                 }

//                 const searchDate = new Date(search);

//                 if (!isNaN(searchDate)) {
//                     searchConditions.push({
//                         date: {
//                             $gte: new Date(searchDate.setHours(0, 0, 0)),
//                             $lt: new Date(searchDate.setHours(23, 59, 59))
//                         }
//                     });
//                 }
//             }

//             if (startDate && endDate) {
//                 const start = new Date(startDate).setHours(0, 0, 0, 0);
//                 const end = new Date(endDate).setHours(23, 59, 59, 999);
//                 if (!isNaN(start) && !isNaN(end)) {
//                     searchConditions.push({
//                         date: {
//                             $gte: new Date(start),
//                             $lte: new Date(end)
//                         }
//                     });
//                 }
//             }

//             if (searchConditions.length > 0) {
//                 if (Array.isArray(dataQuery)) {
//                     dataQuery = dataQuery.filter(item => searchConditions.some(condition => {
//                         return Object.keys(condition).some(key => {
//                             const value = condition[key];
//                             if (value.$regex) {
//                                 return value.$regex.test(item[key]);
//                             } else if (typeof value === 'object' && value.$gte && value.$lt) {
//                                 const dateValue = new Date(item[key]);
//                                 return dateValue >= value.$gte && dateValue < value.$lt;
//                             } else {
//                                 return item[key] === value;
//                             }
//                         });
//                     }));
//                 } else {
//                     dataQuery = dataQuery.find({ $or: searchConditions });
//                 }
//             }

//         } else {
//             return res.status(403).json({ message: 'Access denied. Unauthorized role.' });
//         }

//         // Step 3: Pagination and sending response
//         if (Array.isArray(dataQuery)) {
//             const totalData = dataQuery.length;
//             const paginatedData = dataQuery.slice((page - 1) * limit, page * limit);
//             res.status(200).json({
//                 totalData,
//                 totalPages: Math.ceil(totalData / limit),
//                 currentPage: page,
//                 data: paginatedData
//             });
//         } else {
//             const totalData = await BookingData.countDocuments(dataQuery.getFilter());
//             const data = await dataQuery.skip((page - 1) * limit).limit(limit).exec();
//             res.status(200).json({
//                 totalData,
//                 totalPages: Math.ceil(totalData / limit),
//                 currentPage: page,
//                 data
//             });
//         }
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// };


// exports.getPaginatedData = async (req, res) => {
//     try {
//         // Fetch all required data
//         const bookingdata = await BookingData.find({});
//         const paymentdata = await PaymentData.find({});
//         const pendingOrder = await PendingOrder.find({});
//         const returnAndPendingData = await ReturnAndPendingData.find({});

//         // Update bookingdata status based on matches
//         bookingdata.forEach((booking) => {
//             // Check for matching article_number in paymentdata
//             const matchedPayment = paymentdata.find((payment) => payment.article_number === booking.barcode);
//             if (matchedPayment) {
//                 booking.status = 'Completed';
//             }

//             // Check for matching barcode in pendingOrder
//             const matchedPendingOrder = pendingOrder.find((order) => order.barcode === booking.barcode);
//             if (matchedPendingOrder) {
//                 booking.status = 'Pending';
//             }

//             // Check for matching barcode in returnAndPendingData
//             const matchedReturnData = returnAndPendingData.find((data) => data.barcode === booking.barcode);
//             if (matchedReturnData) {
//                 booking.status = 'Returned';
//             }
//         });

//         // Save updated bookingdata (optional, depending on your application flow)

//         // Continue with existing pagination logic
//         let { page, limit, search, startDate, endDate } = req.query;
//         page = parseInt(page) || 1;
//         limit = parseInt(limit) || 10;
//         search = search ? search.trim() : "";

//         let dataQuery;

//         // Role-based access control logic
//         if (req.user.role === 'admin' || req.user.role === 'branchAdmin' || req.user.role === 'employee') {
//             dataQuery = BookingData.find();

//             const searchConditions = [];

//             if (search) {
//                 // Convert spaces to plus signs for product search
//                 const formattedSearch = search.replace(/ /g, '+');

//                 // Exact match for the product field
//                 searchConditions.push({ product: formattedSearch });

//                 // For other fields, use regex with escaped characters
//                 const escapeRegex = (string) => {
//                     return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
//                 };
//                 const escapedSearch = escapeRegex(search);

//                 searchConditions.push(
//                     { ref: { $regex: escapedSearch, $options: "i" } },
//                     { city: { $regex: escapedSearch, $options: "i" } },
//                     { pincode: { $regex: escapedSearch, $options: "i" } },
//                     { name: { $regex: escapedSearch, $options: "i" } },
//                     { add1: { $regex: escapedSearch, $options: "i" } },
//                     { add2: { $regex: escapedSearch, $options: "i" } },
//                     { add3: { $regex: escapedSearch, $options: "i" } },
//                     { addremail: { $regex: escapedSearch, $options: "i" } },
//                     { addrmobile: { $regex: escapedSearch, $options: "i" } },
//                     { sendermobile: { $regex: escapedSearch, $options: "i" } },
//                     { cr: { $regex: escapedSearch, $options: "i" } },
//                     { branch: { $regex: escapedSearch, $options: "i" } },
//                     { status: { $regex: escapedSearch, $options: "i" } },
//                     { vpp: { $regex: escapedSearch, $options: "i" } },
//                     { contenttype: { $regex: escapedSearch, $options: "i" } },
//                     { priority: { $regex: escapedSearch, $options: "i" } },
//                     { typing: { $regex: escapedSearch, $options: "i" } },
//                     { altmobile: { $regex: escapedSearch, $options: "i" } }
//                 );

//                 if (!isNaN(search)) {
//                     searchConditions.push(
//                         { sl: parseInt(search) },
//                         { weight: parseFloat(search) },
//                         { cod: parseFloat(search) },
//                         { insval: parseFloat(search) },
//                         { l: parseFloat(search) },
//                         { b: parseFloat(search) },
//                         { h: parseFloat(search) }
//                     );
//                 }

//                 const searchDate = new Date(search);

//                 if (!isNaN(searchDate)) {
//                     searchConditions.push({
//                         date: {
//                             $gte: new Date(searchDate.setHours(0, 0, 0)),
//                             $lt: new Date(searchDate.setHours(23, 59, 59))
//                         }
//                     });
//                 }
//             }

//             if (startDate && endDate) {
//                 const start = new Date(startDate).setHours(0, 0, 0, 0);
//                 const end = new Date(endDate).setHours(23, 59, 59, 999);
//                 if (!isNaN(start) && !isNaN(end)) {
//                     searchConditions.push({
//                         date: {
//                             $gte: new Date(start),
//                             $lte: new Date(end)
//                         }
//                     });
//                 }
//             }

//             if (searchConditions.length > 0) {
//                 dataQuery = dataQuery.find({ $or: searchConditions });
//             }

//         } else {
//             return res.status(403).json({ message: 'Access denied. Unauthorized role.' });
//         }

//         const totalData = await BookingData.countDocuments(dataQuery.getFilter());
//         const data = await dataQuery.skip((page - 1) * limit).limit(limit).exec();

//         res.status(200).json({
//             totalData,
//             totalPages: Math.ceil(totalData / limit),
//             currentPage: page,
//             data
//         });
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// };



