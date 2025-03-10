const PaymentData = require('../models/paymentFileModel');
const BookingData = require('../models/bookingFileModel');
const UserPaymentData = require('../models/userPaymentDataModel');
const Joi = require('joi');
const moment = require('moment');
const paymentDataSchemaKeys = Joi.object().keys({
    amount_lc_1: Joi.any(), // Changed to any type
    amount_lc_2: Joi.any(), // Changed to any type
    article_number: Joi.any(),
    article_type: Joi.any(),
    booking_date: Joi.any(),
    booking_office_id: Joi.any(),
    booking_office_name: Joi.any(),
    booking_office_pin: Joi.any(),
    booking_time: Joi.any(),
    commission: Joi.any(),
    delivery_date: Joi.any(),
    delivery_office_id: Joi.any(),
    delivery_office_name: Joi.any(),
    delivery_office_pin: Joi.any(),
    gross_amount: Joi.any(),
    liability_document: Joi.any(),
    net_payable: Joi.any(),
    payment_cheque_no: Joi.any(),
    payment_date: Joi.any(),
    payment_document_no: Joi.any(),
    payment_office_id: Joi.any(),
    payment_office_name: Joi.any(),
    round_off_amount: Joi.any(),
    rts: Joi.any(),
    system_postings: Joi.any(),
    branch: Joi.any(),
    status: Joi.any(),
});


// exports.receiveData = async (req, res) => {
//     try {
//         // Check if the user has the 'admin' role
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied. Only admins can insert data.' });
//         }

//         const dataArray = req.body;
//         if (!Array.isArray(dataArray)) {
//             return res.status(400).json({ message: 'Data should be an array of objects' });
//         }

//         // Validate keys of each object in the array against the schema keys
//         for (const data of dataArray) {
//             const dataKeys = Object.keys(data);
//             const schemaKeys = Object.keys(paymentDataSchemaKeys.describe().keys);

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

//             // Validate the data against the Joi schema
//             const { error } = paymentDataSchemaKeys.validate(data);
//             if (error) {
//                 return res.status(400).json({ message: `Validation error: ${error.details[0].message}` });
//             }
//         }

//         // Insert data into PaymentData
//         const savedPaymentData = await PaymentData.insertMany(dataArray);

//         // Extract article_numbers from dataArray
//         const articleNumbers = dataArray.map(item => item.article_number);

//         // Find matching booking data using article_numbers
//         const matchingData = await BookingData.find({ barcode: { $in: articleNumbers } });

//         let savedUserPaymentData = [];
//         let message = 'Data received successfully';

//         if (matchingData.length > 0) {
//             // Modify matchingData to remove the _id field
//             const modifiedMatchingData = matchingData.map(data => {
//                 const { _id, __v, ...rest } = data.toObject(); // Convert Mongoose document to plain JavaScript object
//                 return rest;
//             });

//             // Insert the modified matching data directly into UserPaymentData
//             savedUserPaymentData = await UserPaymentData.insertMany(modifiedMatchingData);
//         } else {
//             message = 'Paid user detail not found, but data received successfully';
//         }

//         res.status(200).json({
//             message: message,
//             paymentData: savedPaymentData,
//             userPaymentData: savedUserPaymentData
//         });

//         // if (matchingData.length === 0) {
//         //     return res.status(404).json({ message: 'No matching booking data found' });
//         // }
//         // // Modify matchingData to remove the _id field
//         // const modifiedMatchingData = matchingData.map(data => {
//         //     const { _id, __v, ...rest } = data.toObject(); // Convert Mongoose document to plain JavaScript object
//         //     return rest;
//         // });

//         // // Insert the modified matching data directly into UserPaymentData
//         // const savedUserPaymentData = await UserPaymentData.insertMany(modifiedMatchingData);
//         // // Insert the matching data directly into UserPaymentData
//         // // const savedUserPaymentData = await UserPaymentData.insertMany(matchingData);

//         // res.status(200).json({
//         //     message: 'Data received successfully',
//         //     paymentData: savedPaymentData,
//         //     userPaymentData: savedUserPaymentData
//         // });
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// };

// exports.receiveData = async (req, res) => {
//     try {
//         // Check if the user has the 'admin' role
//         if (req.user.role !== "admin") {
//             return res
//                 .status(403)
//                 .json({ message: "Access denied. Only admins can insert data." });
//         }

//         const dataArray = req.body;
//         if (!Array.isArray(dataArray)) {
//             return res
//                 .status(400)
//                 .json({ message: "Data should be an array of objects" });
//         }

//         // Validate keys of each object in the array against the schema keys
//         for (const data of dataArray) {
//             const dataKeys = Object.keys(data);
//             const schemaKeys = Object.keys(paymentDataSchemaKeys.describe().keys);

//             // Check if all keys in data are in schema
//             const extraKeys = dataKeys.filter((key) => !schemaKeys.includes(key));
//             if (extraKeys.length > 0) {
//                 return res
//                     .status(400)
//                     .json({
//                         message: `File Validation error: Extra Column found : ${extraKeys.join(
//                             ", "
//                         )}`,
//                     });
//             }

//             // Check if all keys in schema are in data
//             const missingKeys = schemaKeys.filter((key) => !dataKeys.includes(key));
//             if (missingKeys.length > 0) {
//                 return res
//                     .status(400)
//                     .json({
//                         message: `File Validation error: Missing Column : ${missingKeys.join(
//                             ", "
//                         )}`,
//                     });
//             }

//             // Validate the data against the Joi schema
//             const { error } = paymentDataSchemaKeys.validate(data);
//             if (error) {
//                 return res
//                     .status(400)
//                     .json({
//                         message: `Validation error: ${error.details[0].message}`,
//                     });
//             }
//         }

//         // Insert data into PaymentData
//         const savedPaymentData = await PaymentData.insertMany(dataArray);

//         const count = savedPaymentData.length

//         // Extract article_numbers from dataArray
//         const articleNumbers = dataArray.map((item) => item.article_number);

//         // Find matching booking data using article_numbers
//         const matchingData = await BookingData.find({
//             barcode: { $in: articleNumbers },
//         });

//         let savedUserPaymentData = [];
//         let message = `${count} Data received successfully`;

//         if (matchingData.length > 0) {
//             // Update status to 'Returned', save updated data back to BookingData, and prepare data for insertion
//             const updatedData = await Promise.all(
//                 matchingData.map(async (data) => {
//                     data.status = "Completed";
//                     await data.save();
//                     const { _id, __v, ...rest } = data.toObject(); // Convert Mongoose document to plain object and remove _id and __v
//                     return rest;
//                 })
//             );

//             // Insert the modified updated data directly into UserPaymentData
//             savedUserPaymentData = await UserPaymentData.insertMany(updatedData);

//         } else {
//             message = `Paid user detail not found, but ${count} data received successfully`;
//         }

//         res.status(200).json({
//             message: message,
//             paymentData: savedPaymentData,
//             userPaymentData: savedUserPaymentData,
//         });
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// };






// exports.receiveData = async (req, res) => {
//     try {
//         // Check if the user has the 'admin' role
//         if (req.user.role !== "admin") {
//             return res
//                 .status(403)
//                 .json({ message: "Access denied. Only admins can insert data." });
//         }

//         const dataArray = req.body;
//         if (!Array.isArray(dataArray)) {
//             return res
//                 .status(400)
//                 .json({ message: "Data should be an array of objects" });
//         }

//         // Function to convert date format to ISO 8601
//         const convertToISODate = (dateString) => {
//             // Assuming date format is dd-MM-yyyy
//             return moment(dateString, 'DD-MM-YYYY').toISOString();
//         };

//         // Validate each object in the array
//         for (const data of dataArray) {
//             const dataKeys = Object.keys(data);
//             const schemaKeys = Object.keys(paymentDataSchemaKeys.describe().keys);

//             // Check if all keys in data are in schema
//             const extraKeys = dataKeys.filter((key) => !schemaKeys.includes(key));
//             if (extraKeys.length > 0) {
//                 return res
//                     .status(400)
//                     .json({
//                         message: `File Validation error: Extra Column found : ${extraKeys.join(
//                             ", "
//                         )}`,
//                     });
//             }

//             // Check if all keys in schema are in data
//             const missingKeys = schemaKeys.filter((key) => !dataKeys.includes(key));
//             if (missingKeys.length > 0) {
//                 return res
//                     .status(400)
//                     .json({
//                         message: `File Validation error: Missing Column : ${missingKeys.join(
//                             ", "
//                         )}`,
//                     });
//             }

//             // Check if article_number is present and not empty
//             if (!data.article_number || data.article_number.trim() === "") {
//                 return res
//                     .status(400)
//                     .json({ message: "Validation error: Please enter article number." });
//             }

//             // Convert date fields to ISO format if they exist in data
//             ['booking_date', 'delivery_date', 'payment_date'].forEach(field => {
//                 if (data[field]) {
//                     data[field] = convertToISODate(data[field]);
//                 }
//             });

//             // Validate the data against the Joi schema
//             const { error } = paymentDataSchemaKeys.validate(data);
//             if (error) {
//                 return res
//                     .status(400)
//                     .json({
//                         message: `Validation error: ${error.details[0].message}`,
//                     });
//             }
//         }

//         // Insert data into PaymentData
//         const savedPaymentData = await PaymentData.insertMany(dataArray);
//         const count = savedPaymentData.length;

//         // Extract article_numbers from dataArray
//         const articleNumbers = dataArray.map((item) => item.article_number);

//         // Find matching booking data using article_numbers
//         const matchingData = await BookingData.find({
//             barcode: { $in: articleNumbers },
//         });

//         let savedUserPaymentData = [];
//         let message = `${count} Data received successfully`;

//         if (matchingData.length > 0) {
//             // Update status to 'Completed' for matching data
//             const updatedBookingData = matchingData.map(data => {
//                 data.status = 'Completed';
//                 return data.save();
//             });

//             // Wait for all updates to complete
//             await Promise.all(updatedBookingData);

//             // Prepare the data for insertion into UserPaymentData
//             const updatedData = articleNumbers.map(articleNumber => {
//                 const existingBooking = matchingData.find(data => data.barcode === articleNumber);
//                 if (existingBooking) {
//                     const { _id, __v, ...rest } = existingBooking.toObject();
//                     return rest; // Convert Mongoose document to plain object
//                 }
//             });

//             // Insert the modified updated data directly into UserPaymentData
//             savedUserPaymentData = await UserPaymentData.insertMany(updatedData);

//         } else {
//             message = `Paid user detail not found, but ${count} data received successfully`;
//         }

//         res.status(200).json({
//             message: message,
//             paymentData: savedPaymentData,
//             userPaymentData: savedUserPaymentData,
//         });
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// };














// latestcode 
exports.receiveData = async (req, res) => {
    try {
        // Check if the user has the 'admin' role
        if (req.user.role !== "admin") {
            return res
                .status(403)
                .json({ message: "Access denied. Only admins can insert data." });
        }

        const dataArray = req.body;
        if (!Array.isArray(dataArray)) {
            return res
                .status(400)
                .json({ message: "Data should be an array of objects" });
        }

        // Function to convert date format to ISO 8601
        const convertToISODate = (dateString) => {
            // Assuming date format is dd-MM-yyyy
            return moment(dateString, 'DD-MM-YYYY').toISOString();
        };

        // Validate keys of each object in the array against the schema keys
        for (const data of dataArray) {
            const dataKeys = Object.keys(data);
            const schemaKeys = Object.keys(paymentDataSchemaKeys.describe().keys);

            // Check if all keys in data are in schema
            const extraKeys = dataKeys.filter((key) => !schemaKeys.includes(key));
            if (extraKeys.length > 0) {
                return res
                    .status(400)
                    .json({
                        message: `File Validation error: Extra Column found : ${extraKeys.join(
                            ", "
                        )}`,
                    });
            }

            // Check if all keys in schema are in data
            const missingKeys = schemaKeys.filter((key) => !dataKeys.includes(key));
            if (missingKeys.length > 0) {
                return res
                    .status(400)
                    .json({
                        message: `File Validation error: Missing Column : ${missingKeys.join(
                            ", "
                        )}`,
                    });
            }

            // Convert date fields to ISO format if they exist in data
            // ['booking_date', 'delivery_date', 'payment_date'].forEach(field => {
            //     if (data[field]) {
            //         data[field] = convertToISODate(data[field]);
            //     }
            // });

            // Validate the data against the Joi schema
            const { error } = paymentDataSchemaKeys.validate(data);
            if (error) {
                return res
                    .status(400)
                    .json({
                        message: `Validation error: ${error.details[0].message}`,
                    });
            }
        }

        // Insert data into PaymentData
        const savedPaymentData = await PaymentData.insertMany(dataArray);
        const count = savedPaymentData.length;

        // Extract article_numbers from dataArray
        const articleNumbers = dataArray.map((item) => item.article_number);

        // Find matching booking data using article_numbers
        const matchingData = await BookingData.find({
            barcode: { $in: articleNumbers },
        });

        let savedUserPaymentData = [];
        let message = `${count} Data received successfully`;

        if (matchingData.length > 0) {
            // Update status to 'Completed' for matching data
            const updatedBookingData = matchingData.map(data => {
                data.status = 'Completed';
                return data.save();
            });

            // Wait for all updates to complete
            await Promise.all(updatedBookingData);

            // Prepare the data for insertion into UserPaymentData
            const updatedData = articleNumbers.map(articleNumber => {
                const existingBooking = matchingData.find(data => data.barcode === articleNumber);
                if (existingBooking) {
                    const { _id, __v, ...rest } = existingBooking.toObject();
                    return rest; // Convert Mongoose document to plain object
                }
            });

            // Insert the modified updated data directly into UserPaymentData
            savedUserPaymentData = await UserPaymentData.insertMany(updatedData);

        } else {
            message = `Paid user detail not found, but ${count} data received successfully`;
        }

        res.status(200).json({
            message: message,
            paymentData: savedPaymentData,
            userPaymentData: savedUserPaymentData,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};




// exports.receiveData = async (req, res) => {
//     try {
//         // Check if the user has the 'admin' role
//         if (req.user.role !== "admin") {
//             return res
//                 .status(403)
//                 .json({ message: "Access denied. Only admins can insert data." });
//         }

//         const dataArray = req.body;
//         if (!Array.isArray(dataArray)) {
//             return res
//                 .status(400)
//                 .json({ message: "Data should be an array of objects" });
//         }

//         // Validate keys of each object in the array against the schema keys
//         for (const data of dataArray) {
//             const dataKeys = Object.keys(data);
//             const schemaKeys = Object.keys(paymentDataSchemaKeys.describe().keys);

//             // Check if all keys in data are in schema
//             const extraKeys = dataKeys.filter((key) => !schemaKeys.includes(key));
//             if (extraKeys.length > 0) {
//                 return res
//                     .status(400)
//                     .json({
//                         message: `File Validation error: Extra Column found : ${extraKeys.join(
//                             ", "
//                         )}`,
//                     });
//             }

//             // Check if all keys in schema are in data
//             const missingKeys = schemaKeys.filter((key) => !dataKeys.includes(key));
//             if (missingKeys.length > 0) {
//                 return res
//                     .status(400)
//                     .json({
//                         message: `File Validation error: Missing Column : ${missingKeys.join(
//                             ", "
//                         )}`,
//                     });
//             }

//             // Validate the data against the Joi schema
//             const { error } = paymentDataSchemaKeys.validate(data);
//             if (error) {
//                 return res
//                     .status(400)
//                     .json({
//                         message: `Validation error: ${error.details[0].message}`,
//                     });
//             }
//         }

//         // Insert data into PaymentData
//         const savedPaymentData = await PaymentData.insertMany(dataArray);

//         const count = savedPaymentData.length

//         // Extract article_numbers from dataArray
//         const articleNumbers = dataArray.map((item) => item.article_number);

//         // Find matching booking data using article_numbers
//         const matchingData = await BookingData.find({
//             barcode: { $in: articleNumbers },
//         });

//         let savedUserPaymentData = [];
//         let message = `${count} Data received successfully`;

//         if (matchingData.length > 0) {
//             // Update status to 'Completed' for matching data
//             const updatedBookingData = matchingData.map(data => {
//                 data.status = 'Completed';
//                 return data.save();
//             });

//             // Wait for all updates to complete
//             await Promise.all(updatedBookingData);

//             // Prepare the data for insertion into UserPaymentData
//             const updatedData = articleNumbers.map(articleNumber => {
//                 const existingBooking = matchingData.find(data => data.barcode === articleNumber);
//                 if (existingBooking) {
//                     const { _id, __v, ...rest } = existingBooking.toObject();
//                     return rest; // Convert Mongoose document to plain object
//                 }
//             })

//             // Insert the modified updated data directly into UserPaymentData
//             savedUserPaymentData = await UserPaymentData.insertMany(updatedData);

//         } else {
//             message = `Paid user detail not found, but ${count} data received successfully`;
//         }

//         res.status(200).json({
//             message: message,
//             paymentData: savedPaymentData,
//             userPaymentData: savedUserPaymentData,
//         });
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// };




exports.getAllData = async (req, res) => {
    try {
        let allData;
        let totalData;
        // Check user role
        if (req.user.role === 'admin') {
            // Admin can access all data
            allData = await PaymentData.find();
            totalData = await PaymentData.countDocuments();
        } else if (req.user.role === 'branchAdmin' || req.user.role === 'employee') {
            // Branch Admin and Employee can access data within their branch
            const branch = req.user.branch; // Assuming branch information is stored in req.user
            allData = await PaymentData.find({ branch: branch });
            totalData = await PaymentData.countDocuments({ branch: branch });
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
        const data = await PaymentData.findById(req.params.bookingid);
        if (!data) {
            return res.status(404).json({ message: 'Data not found' });
        }
        res.status(200).json(data);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateDataById = async (req, res) => {
    try {
        // Check if the user has the 'admin' role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Only admins can update data.' });
        }
        const data = await PaymentData.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!data) {
            return res.status(404).json({ message: 'Data not found' });
        }
        res.status(200).json({ message: 'Data Update successfully', data });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteDataById = async (req, res) => {
    try {
        // Check if the user has the 'admin' role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Only admins can delete data.' });
        }
        const bookingId = req.params.id
        const data = await PaymentData.findByIdAndDelete(bookingId);
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
            return res.status(403).json({ message: 'Access denied. Only admins can delete data.' });
        }
        const ids = req.body.ids;

        if (!Array.isArray(ids)) {
            return res.status(400).json({ error: 'IDs should be an array of strings' });
        }

        const foundDocuments = await PaymentData.find({ _id: { $in: ids } });

        if (foundDocuments.length !== ids.length) {
            const foundIds = foundDocuments.map(doc => doc._id.toString());
            const notFoundIds = ids.filter(id => !foundIds.includes(id));
            return res.status(404).json({ error: 'Some IDs were not found', notFoundIds });
        }

        const result = await PaymentData.deleteMany({ _id: { $in: ids } });
        res.status(200).json({ message: 'Data deleted successfully', deletedCount: result.deletedCount, deletedData: foundDocuments });
    } catch (err) {

        res.status(400).json({ error: err.message });
    }
};

exports.getDuplicateArticleNumbers = async (req, res) => {
    try {
        let duplicates;

        // Check user role
        if (req.user.role === 'admin') {
            // Admin can check for duplicates in all data
            duplicates = await PaymentData.aggregate([
                { $group: { _id: "$article_number", count: { $sum: 1 } } },
                { $match: { count: { $gt: 1 } } },
                { $project: { _id: 1 } }
            ]);
        } else if (req.user.role === 'branchAdmin' || req.user.role === 'employee') {
            // Branch Admin and Employee can check for duplicates within their branch
            const branch = req.user.branch; // Assuming branch information is stored in req.user
            duplicates = await PaymentData.aggregate([
                { $match: { branch: branch } },
                { $group: { _id: "$article_number", count: { $sum: 1 } } },
                { $match: { count: { $gt: 1 } } },
                { $project: { _id: 1 } }
            ]);
        } else {
            // Other roles are not authorized to access data
            return res.status(403).json({ error: 'Access denied. Unauthorized role.' });
        }

        // Extract article numbers from the result
        const articleNumbers = duplicates.map(duplicate => duplicate._id);

        // Send success response
        res.status(200).json({ duplicates: articleNumbers });
    } catch (err) {
        // Send error response
        res.status(400).json({ error: err.message });
    }
};




exports.getPaginatedPaymentData = async (req, res) => {
    try {
        let { page, limit, search, startDate, endDate, filterByDuplicateArticalNumber } = req.query;
        console.log("first", req.query);
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        search = search ? search.trim() : "";
        filterByDuplicateArticalNumber = filterByDuplicateArticalNumber === 'true'; // Convert to boolean

        let dataQuery;

        if (req.user.role === 'admin') {
            // Admin can access all data
            dataQuery = PaymentData.find();
        } else if (req.user.role === 'branchAdmin' || req.user.role === 'employee') {
            // Branch Admin and Employee can access data within their branch
            dataQuery = PaymentData.find({ branch: req.user.branch });
        } else {
            return res.status(403).json({ message: 'Access denied. Unauthorized role.' });
        }

        const searchConditions = [];
        const dateConditions = [];

        if (search) {
            // Split search terms by commas
            const searchTerms = search.split(',').map(term => term.trim());

            const combinedConditions = searchTerms.map(term => {
                const conditions = [];
                if (term) {
                    // For other fields, use regex with escaped characters
                    const escapeRegex = (string) => {
                        return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
                    };
                    const escapedSearch = escapeRegex(term);

                    conditions.push(
                        { article_number: { $regex: escapedSearch, $options: "i" } },
                        { article_type: { $regex: escapedSearch, $options: "i" } },
                        { booking_office_id: { $regex: escapedSearch, $options: "i" } },
                        { booking_office_name: { $regex: escapedSearch, $options: "i" } },
                        { booking_office_pin: { $regex: escapedSearch, $options: "i" } },
                        { delivery_office_id: { $regex: escapedSearch, $options: "i" } },
                        { delivery_office_name: { $regex: escapedSearch, $options: "i" } },
                        { delivery_office_pin: { $regex: escapedSearch, $options: "i" } },
                        { liability_document: { $regex: escapedSearch, $options: "i" } },
                        { payment_cheque_no: { $regex: escapedSearch, $options: "i" } },
                        { payment_document_no: { $regex: escapedSearch, $options: "i" } },
                        { payment_office_id: { $regex: escapedSearch, $options: "i" } },
                        { payment_office_name: { $regex: escapedSearch, $options: "i" } },
                        { rts: { $regex: escapedSearch, $options: "i" } },
                        { system_postings: { $regex: escapedSearch, $options: "i" } },
                        { branch: { $regex: escapedSearch, $options: "i" } },
                        { status: { $regex: escapedSearch, $options: "i" } }
                    );

                    if (!isNaN(term)) {
                        conditions.push(
                            { amount_lc_1: parseFloat(term) },
                            { amount_lc_2: parseFloat(term) },
                            { commission: parseFloat(term) },
                            { gross_amount: parseFloat(term) },
                            { net_payable: parseFloat(term) },
                            { round_off_amount: parseFloat(term) }
                        );
                    }

                    const searchDate = new Date(term);

                    if (!isNaN(searchDate)) {
                        conditions.push(
                            {
                                booking_date: {
                                    $gte: new Date(searchDate.setHours(0, 0, 0)),
                                    $lt: new Date(searchDate.setHours(23, 59, 59))
                                }
                            },
                            {
                                delivery_date: {
                                    $gte: new Date(searchDate.setHours(0, 0, 0)),
                                    $lt: new Date(searchDate.setHours(23, 59, 59))
                                }
                            },
                            {
                                payment_date: {
                                    $gte: new Date(searchDate.setHours(0, 0, 0)),
                                    $lt: new Date(searchDate.setHours(23, 59, 59))
                                }
                            }
                        );
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
                    $or: [
                        {
                            booking_date: {
                                $gte: new Date(start),
                                $lte: new Date(end)
                            }
                        },
                        {
                            delivery_date: {
                                $gte: new Date(start),
                                $lte: new Date(end)
                            }
                        },
                        {
                            payment_date: {
                                $gte: new Date(start),
                                $lte: new Date(end)
                            }
                        }
                    ]
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

        // Apply filterByDuplicateArticalNumber logic
        if (filterByDuplicateArticalNumber) {
            const articleNumberCounts = await PaymentData.aggregate([
                { $group: { _id: "$article_number", count: { $sum: 1 } } },
                { $match: { count: { $gt: 1 } } },
                { $project: { _id: 1 } }
            ]);

            const duplicateArticleNumbers = articleNumberCounts.map(an => an._id);

            dataQuery = dataQuery.find({
                article_number: { $in: duplicateArticleNumbers }
            });
        }

        const totalData = await PaymentData.countDocuments(dataQuery.getFilter());
        const data = await dataQuery.skip((page - 1) * limit).limit(limit).exec();

        res.status(200).json({
            totalData,
            totalPages: Math.ceil(totalData / limit),
            currentPage: page,
            data
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


// exports.getPaginatedPaymentData = async (req, res) => {
//     try {
//         let { page, limit, search, startDate, endDate } = req.query;
//         console.log("first", req.query);
//         page = parseInt(page) || 1;
//         limit = parseInt(limit) || 10;
//         search = search ? search.trim() : "";

//         let dataQuery;

//         if (req.user.role === 'admin') {
//             // Admin can access all data
//             dataQuery = PaymentData.find();
//         } else if (req.user.role === 'branchAdmin' || req.user.role === 'employee') {
//             // Branch Admin and Employee can access data within their branch
//             dataQuery = PaymentData.find({ branch: req.user.branch });
//         } else {
//             return res.status(403).json({ message: 'Access denied. Unauthorized role.' });
//         }

//         const searchConditions = [];
//         const dateConditions = [];

//         if (search) {
//             // Split search terms by commas
//             const searchTerms = search.split(',').map(term => term.trim());

//             const combinedConditions = searchTerms.map(term => {
//                 const conditions = [];
//                 if (term) {

//                     // For other fields, use regex with escaped characters
//                     const escapeRegex = (string) => {
//                         return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
//                     };
//                     const escapedSearch = escapeRegex(term);

//                     conditions.push(
//                         { article_number: { $regex: escapedSearch, $options: "i" } },
//                         { article_type: { $regex: escapedSearch, $options: "i" } },
//                         { booking_office_id: { $regex: escapedSearch, $options: "i" } },
//                         { booking_office_name: { $regex: escapedSearch, $options: "i" } },
//                         { booking_office_pin: { $regex: escapedSearch, $options: "i" } },
//                         { delivery_office_id: { $regex: escapedSearch, $options: "i" } },
//                         { delivery_office_name: { $regex: escapedSearch, $options: "i" } },
//                         { delivery_office_pin: { $regex: escapedSearch, $options: "i" } },
//                         { liability_document: { $regex: escapedSearch, $options: "i" } },
//                         { payment_cheque_no: { $regex: escapedSearch, $options: "i" } },
//                         { payment_document_no: { $regex: escapedSearch, $options: "i" } },
//                         { payment_office_id: { $regex: escapedSearch, $options: "i" } },
//                         { payment_office_name: { $regex: escapedSearch, $options: "i" } },
//                         { rts: { $regex: escapedSearch, $options: "i" } },
//                         { system_postings: { $regex: escapedSearch, $options: "i" } },
//                         { branch: { $regex: escapedSearch, $options: "i" } },
//                         { status: { $regex: escapedSearch, $options: "i" } }
//                     );

//                     if (!isNaN(term)) {
//                         conditions.push(
//                             { amount_lc_1: parseFloat(term) },
//                             { amount_lc_2: parseFloat(term) },
//                             { commission: parseFloat(term) },
//                             { gross_amount: parseFloat(term) },
//                             { net_payable: parseFloat(term) },
//                             { round_off_amount: parseFloat(term) }
//                         );
//                     }

//                     const searchDate = new Date(term);

//                     if (!isNaN(searchDate)) {
//                         conditions.push(
//                             {
//                                 booking_date: {
//                                     $gte: new Date(searchDate.setHours(0, 0, 0)),
//                                     $lt: new Date(searchDate.setHours(23, 59, 59))
//                                 }
//                             },
//                             {
//                                 delivery_date: {
//                                     $gte: new Date(searchDate.setHours(0, 0, 0)),
//                                     $lt: new Date(searchDate.setHours(23, 59, 59))
//                                 }
//                             },
//                             {
//                                 payment_date: {
//                                     $gte: new Date(searchDate.setHours(0, 0, 0)),
//                                     $lt: new Date(searchDate.setHours(23, 59, 59))
//                                 }
//                             }
//                         );
//                     }
//                 }
//                 return { $or: conditions };
//             });

//             if (combinedConditions.length > 0) {
//                 dataQuery = dataQuery.find({
//                     $and: combinedConditions
//                 });
//             }
//         }

//         if (startDate && endDate) {
//             const start = new Date(startDate).setHours(0, 0, 0, 0);
//             const end = new Date(endDate).setHours(23, 59, 59, 999);
//             if (!isNaN(start) && !isNaN(end)) {
//                 dateConditions.push({
//                     $or: [
//                         {
//                             booking_date: {
//                                 $gte: new Date(start),
//                                 $lte: new Date(end)
//                             }
//                         },
//                         {
//                             delivery_date: {
//                                 $gte: new Date(start),
//                                 $lte: new Date(end)
//                             }
//                         },
//                         {
//                             payment_date: {
//                                 $gte: new Date(start),
//                                 $lte: new Date(end)
//                             }
//                         }
//                     ]
//                 });
//             }
//         }

//         if (searchConditions.length > 0 && dateConditions.length > 0) {
//             dataQuery = dataQuery.find({
//                 $and: [
//                     ...searchConditions,
//                     ...dateConditions
//                 ]
//             });
//         } else if (searchConditions.length > 0) {
//             dataQuery = dataQuery.find({
//                 $and: searchConditions
//             });
//         } else if (dateConditions.length > 0) {
//             dataQuery = dataQuery.find({
//                 $and: dateConditions
//             });
//         }

//         const totalData = await PaymentData.countDocuments(dataQuery.getFilter());
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


// exports.getPaginatedPaymentData = async (req, res) => {
//     try {
//         let { page, limit, search, startDate, endDate } = req.query;
//         console.log("first", req.query);
//         page = parseInt(page) || 1;
//         limit = parseInt(limit) || 10;
//         search = search ? search.trim() : "";

//         let dataQuery;

//         if (req.user.role === 'admin') {
//             // Admin can access all data
//             dataQuery = PaymentData.find();
//         } else if (req.user.role === 'branchAdmin' || req.user.role === 'employee') {
//             // Branch Admin and Employee can access data within their branch
//             dataQuery = PaymentData.find({ branch: req.user.branch });
//         } else {
//             return res.status(403).json({ message: 'Access denied. Unauthorized role.' });
//         }

//         const searchConditions = [];
//         const dateConditions = [];

//         if (search) {
//             // Convert spaces to plus signs for article_number search
//             // const formattedSearch = search.replace(/ /g, '+');

//             // Exact match for the article_number field
//             // searchConditions.push({ article_number: formattedSearch });

//             // For other fields, use regex with escaped characters
//             const escapeRegex = (string) => {
//                 return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
//             };
//             const escapedSearch = escapeRegex(search);

//             searchConditions.push(
//                 { article_number: { $regex: escapedSearch, $options: "i" } },
//                 { article_type: { $regex: escapedSearch, $options: "i" } },
//                 { booking_office_id: { $regex: escapedSearch, $options: "i" } },
//                 { booking_office_name: { $regex: escapedSearch, $options: "i" } },
//                 { booking_office_pin: { $regex: escapedSearch, $options: "i" } },
//                 { delivery_office_id: { $regex: escapedSearch, $options: "i" } },
//                 { delivery_office_name: { $regex: escapedSearch, $options: "i" } },
//                 { delivery_office_pin: { $regex: escapedSearch, $options: "i" } },
//                 { liability_document: { $regex: escapedSearch, $options: "i" } },
//                 { payment_cheque_no: { $regex: escapedSearch, $options: "i" } },
//                 { payment_document_no: { $regex: escapedSearch, $options: "i" } },
//                 { payment_office_id: { $regex: escapedSearch, $options: "i" } },
//                 { payment_office_name: { $regex: escapedSearch, $options: "i" } },
//                 { rts: { $regex: escapedSearch, $options: "i" } },
//                 { system_postings: { $regex: escapedSearch, $options: "i" } },
//                 { branch: { $regex: escapedSearch, $options: "i" } },
//                 { status: { $regex: escapedSearch, $options: "i" } }
//             );

//             if (!isNaN(search)) {
//                 searchConditions.push(
//                     { amount_lc_1: parseFloat(search) },
//                     { amount_lc_2: parseFloat(search) },
//                     { commission: parseFloat(search) },
//                     { gross_amount: parseFloat(search) },
//                     { net_payable: parseFloat(search) },
//                     { round_off_amount: parseFloat(search) }
//                 );
//             }

//             const searchDate = new Date(search);

//             if (!isNaN(searchDate)) {
//                 searchConditions.push(
//                     {
//                         booking_date: {
//                             $gte: new Date(searchDate.setHours(0, 0, 0)),
//                             $lt: new Date(searchDate.setHours(23, 59, 59))
//                         }
//                     },
//                     {
//                         delivery_date: {
//                             $gte: new Date(searchDate.setHours(0, 0, 0)),
//                             $lt: new Date(searchDate.setHours(23, 59, 59))
//                         }
//                     },
//                     {
//                         payment_date: {
//                             $gte: new Date(searchDate.setHours(0, 0, 0)),
//                             $lt: new Date(searchDate.setHours(23, 59, 59))
//                         }
//                     }
//                 );
//             }
//         }

//         if (startDate && endDate) {
//             const start = new Date(startDate).setHours(0, 0, 0, 0);
//             const end = new Date(endDate).setHours(23, 59, 59, 999);
//             if (!isNaN(start) && !isNaN(end)) {
//                 dateConditions.push({
//                     $or: [
//                         {
//                             booking_date: {
//                                 $gte: new Date(start),
//                                 $lte: new Date(end)
//                             }
//                         },
//                         {
//                             delivery_date: {
//                                 $gte: new Date(start),
//                                 $lte: new Date(end)
//                             }
//                         },
//                         {
//                             payment_date: {
//                                 $gte: new Date(start),
//                                 $lte: new Date(end)
//                             }
//                         }
//                     ]
//                 });
//             }
//         }

//         if (searchConditions.length > 0 && dateConditions.length > 0) {
//             dataQuery = dataQuery.find({
//                 $and: [
//                     { $or: searchConditions },
//                     ...dateConditions
//                 ]
//             });
//         } else if (searchConditions.length > 0) {
//             dataQuery = dataQuery.find({
//                 $or: searchConditions
//             });
//         } else if (dateConditions.length > 0) {
//             dataQuery = dataQuery.find({
//                 $and: dateConditions
//             });
//         }

//         const totalData = await PaymentData.countDocuments(dataQuery.getFilter());
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


// exports.getPaginatedPaymentData = async (req, res) => {
//     try {
//         let { page, limit, search, startDate, endDate } = req.query;
//         console.log("first",req.query)
//         page = parseInt(page) || 1;
//         limit = parseInt(limit) || 10;
//         search = search ? search.trim() : "";

//         let dataQuery;

//         if (req.user.role === 'admin') {
//             // Admin can access all data
//             dataQuery = PaymentData.find();
//         } else if (req.user.role === 'branchAdmin' || req.user.role === 'employee') {
//             // Branch Admin and Employee can access data within their branch
//             dataQuery = PaymentData.find({ branch: req.user.branch });
//         } else {
//             return res.status(403).json({ message: 'Access denied. Unauthorized role.' });
//         }

//         const searchConditions = [];

//         if (search) {
//             // Convert spaces to plus signs for article_number search
//             const formattedSearch = search.replace(/ /g, '+');

//             // Exact match for the article_number field
//             searchConditions.push({ article_number: formattedSearch });

//             // For other fields, use regex with escaped characters
//             const escapeRegex = (string) => {
//                 return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
//             };
//             const escapedSearch = escapeRegex(search);

//             searchConditions.push(
//                 { article_type: { $regex: escapedSearch, $options: "i" } },
//                 { booking_office_id: { $regex: escapedSearch, $options: "i" } },
//                 { booking_office_name: { $regex: escapedSearch, $options: "i" } },
//                 { booking_office_pin: { $regex: escapedSearch, $options: "i" } },
//                 { delivery_office_id: { $regex: escapedSearch, $options: "i" } },
//                 { delivery_office_name: { $regex: escapedSearch, $options: "i" } },
//                 { delivery_office_pin: { $regex: escapedSearch, $options: "i" } },
//                 { liability_document: { $regex: escapedSearch, $options: "i" } },
//                 { payment_cheque_no: { $regex: escapedSearch, $options: "i" } },
//                 { payment_document_no: { $regex: escapedSearch, $options: "i" } },
//                 { payment_office_id: { $regex: escapedSearch, $options: "i" } },
//                 { payment_office_name: { $regex: escapedSearch, $options: "i" } },
//                 { rts: { $regex: escapedSearch, $options: "i" } },
//                 { system_postings: { $regex: escapedSearch, $options: "i" } },
//                 { branch: { $regex: escapedSearch, $options: "i" } },
//                 { status: { $regex: escapedSearch, $options: "i" } }
//             );

//             if (!isNaN(search)) {
//                 searchConditions.push(
//                     { amount_lc_1: parseFloat(search) },
//                     { amount_lc_2: parseFloat(search) },
//                     { commission: parseFloat(search) },
//                     { gross_amount: parseFloat(search) },
//                     { net_payable: parseFloat(search) },
//                     { round_off_amount: parseFloat(search) }
//                 );
//             }

//             const searchDate = new Date(search);

//             if (!isNaN(searchDate)) {
//                 searchConditions.push(
//                     {
//                         booking_date: {
//                             $gte: new Date(searchDate.setHours(0, 0, 0)),
//                             $lt: new Date(searchDate.setHours(23, 59, 59))
//                         }
//                     },
//                     {
//                         delivery_date: {
//                             $gte: new Date(searchDate.setHours(0, 0, 0)),
//                             $lt: new Date(searchDate.setHours(23, 59, 59))
//                         }
//                     },
//                     {
//                         payment_date: {
//                             $gte: new Date(searchDate.setHours(0, 0, 0)),
//                             $lt: new Date(searchDate.setHours(23, 59, 59))
//                         }
//                     }
//                 );
//             }
//         }

//         if (startDate && endDate) {
//             const start = new Date(startDate).setHours(0, 0, 0, 0);
//             const end = new Date(endDate).setHours(23, 59, 59, 999);
//             if (!isNaN(start) && !isNaN(end)) {
//                 searchConditions.push({
//                     $or: [
//                         {
//                             booking_date: {
//                                 $gte: new Date(start),
//                                 $lte: new Date(end)
//                             }
//                         },
//                         {
//                             delivery_date: {
//                                 $gte: new Date(start),
//                                 $lte: new Date(end)
//                             }
//                         },
//                         {
//                             payment_date: {
//                                 $gte: new Date(start),
//                                 $lte: new Date(end)
//                             }
//                         }
//                     ]
//                 });
//             }
//         }

//         if (searchConditions.length > 0) {
//             dataQuery = dataQuery.find({ $or: searchConditions });
//         }

//         const totalData = await PaymentData.countDocuments(dataQuery.getFilter());
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


