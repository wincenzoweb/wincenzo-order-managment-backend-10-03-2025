

const mongoose = require("mongoose");
const BookingData = require("../models/bookingFileModel");
const CompletedBookingData = require("../models/userPaymentDataModel");
const nodeCron = require("node-cron");

// Retry operation definition
async function retryOperation(operation, retries = 3) {
  while (retries > 0) {
    try {
      return await operation();
    } catch (err) {
      retries--;
      console.error(`Retrying operation, attempts left: ${retries}. Error: ${err.message}`);
      if (retries === 0) throw err;
    }
  }
}

// Transfer all completed data function
exports.transferAllCompletedData = async () => {
  try {
    console.log("Data transfer process started...");

    const completedData = await BookingData.find({ status: "Completed" });
    console.log(`Found ${completedData.length} completed orders.`);

    if (!completedData.length) {
      console.log("No completed orders found. Skipping data transfer.");
      return;
    }

    const existingRecords = await CompletedBookingData.find({}, "_id barcode");
    const existingBarcodes = new Set(existingRecords.map((r) => r.barcode));
    const existingIds = new Set(existingRecords.map((r) => r._id.toString()));

    let skippedCount = 0;
    let transferredCount = 0;
    const bulkOps = [];

    for (let data of completedData) {
      if (!existingIds.has(data._id.toString()) && !existingBarcodes.has(data.barcode)) {
        bulkOps.push({ insertOne: { document: data.toObject() } });
        transferredCount++;
      } else {
        skippedCount++;
      }

      if (bulkOps.length >= 1000) {
        console.log(`Inserting batch of ${bulkOps.length} records...`);
        await retryOperation(() => CompletedBookingData.bulkWrite(bulkOps, { ordered: false }));
        bulkOps.length = 0; // Reset bulkOps
      }
    }

    if (bulkOps.length > 0) {
      console.log(`Inserting final batch of ${bulkOps.length} records...`);
      await retryOperation(() => CompletedBookingData.bulkWrite(bulkOps, { ordered: false }));
    }

    console.log(
      `Data transfer complete: ${transferredCount} records transferred, ${skippedCount} records skipped.`
    );
  } catch (err) {
    console.error("Error during data transfer:", err.message);
  }
};


// Scheduled cron job to transfer data every minute (adjust schedule as needed)
nodeCron.schedule(
  "*/1 * * * *",
  async () => {
    console.log("Scheduled data transfer started...");
    try {
      await exports.transferAllCompletedData();
      console.log("Scheduled data transfer completed successfully.");
    } catch (err) {
      console.error("Error during scheduled data transfer:", err.message);
    }
  },
  {
    scheduled: true,
    timezone: "UTC", // Adjust timezone if needed
  }
);


// Function to get the completed booking data with filters (Paginated)
exports.getCompletedDataWithFilters = async (req, res) => {
  try {
    let {
      page,
      limit,
      search,
      startDate,
      endDate,
      filterByDuplicateBarcode,
      filterByUnknownBarcode,
    } = req.query;

    // Set default pagination values
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    search = search ? search.trim() : "";
    filterByDuplicateBarcode = filterByDuplicateBarcode === "true";
    filterByUnknownBarcode = filterByUnknownBarcode === "true";

    let queryFilter = { status: "Completed" };

    // Apply search filter if provided
    if (search) {
      queryFilter = {
        ...queryFilter,
        $or: [
          { barcode: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Apply date range filter if provided
    if (startDate && endDate) {
      queryFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Filter by duplicate barcodes if requested
    if (filterByDuplicateBarcode) {
      const duplicates = await CompletedBookingData.aggregate([
        { $match: { status: "Completed" } },
        { $group: { _id: "$barcode", count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
      ]);

      const duplicateBarcodes = duplicates.map((item) => item._id);
      queryFilter.barcode = { $in: duplicateBarcodes };
    }

    // Filter by unknown barcodes if requested
    if (filterByUnknownBarcode) {
      const knownBarcodes = await CompletedBookingData.find().select("barcode");
      const knownBarcodeList = knownBarcodes.map((item) => item.barcode);

      queryFilter.barcode = { $nin: knownBarcodeList };
    }

    const skip = (page - 1) * limit;
    const completedData = await CompletedBookingData.find(queryFilter)
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 });

    const totalRecords = await CompletedBookingData.countDocuments(queryFilter);

    res.status(200).json({
      message: "Completed booking data fetched successfully.",
      page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      data: completedData,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// exports.getDuplicateBarcodes = async (req, res) => {
//   try {
//     let { page, limit } = req.query;

//     // Set default pagination values
//     page = parseInt(page) || 1;
//     limit = parseInt(limit) || 10;

//     const skip = (page - 1) * limit;

//     // Aggregate pipeline to find duplicate barcodes
//     const duplicatesPipeline = [
//       {
//         $match: { status: "Completed" }, // Filter for completed records
//       },
//       {
//         $group: {
//           _id: "$barcode", // Group by barcode
//           count: { $sum: 1 }, // Count occurrences of each barcode
//           records: { $push: "$$ROOT" }, // Keep all documents with the same barcode
//         },
//       },
//       {
//         $match: { count: { $gt: 1 } }, // Filter groups with more than one occurrence
//       },
//       {
//         $sort: { count: -1 }, // Sort by the count of duplicates (descending)
//       },
//       {
//         $skip: skip, // Apply pagination
//       },
//       {
//         $limit: limit,
//       },
//     ];

//     // Execute the aggregation to get duplicates
//     const duplicateRecords = await CompletedBookingData.aggregate(duplicatesPipeline);

//     // Get the total number of duplicates
//     const totalDuplicates = await CompletedBookingData.aggregate([
//       { $match: { status: "Completed" } },
//       {
//         $group: {
//           _id: "$barcode",
//           count: { $sum: 1 },
//         },
//       },
//       { $match: { count: { $gt: 1 } } },
//     ]);

//     const totalRecords = totalDuplicates.length;

//     // Flatten the results to match the first API's response structure
//     const flattenedData = duplicateRecords.flatMap(item => item.records);

//     // Prepare and send the response
//     res.status(200).json({
//       message: "Duplicate barcodes fetched successfully.",
//       page,
//       totalPages: Math.ceil(totalRecords / limit),
//       totalRecords,
//       data: flattenedData,
//     });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };


exports.getDuplicateBarcodes = async (req, res) => {
  try {
    // Aggregate pipeline to find duplicate barcodes
    const duplicatesPipeline = [
      {
        $match: { status: "Completed" }, // Filter for completed records
      },
      {
        $group: {
          _id: "$barcode", // Group by barcode
          count: { $sum: 1 }, // Count occurrences of each barcode
        },
      },
      {
        $match: { count: { $gt: 1 } }, // Filter groups with more than one occurrence
      },
      {
        $sort: { count: -1 }, // Sort by the count of duplicates (descending)
      },
    ];

    // Execute the aggregation to get duplicates
    const duplicateRecords = await CompletedBookingData.aggregate(duplicatesPipeline);

    // Extract only the barcode numbers from the duplicates
    const barcodeNumbers = duplicateRecords.map(item => item._id);

    // Prepare and send the response
    res.status(200).json({
      duplicates: barcodeNumbers, // Return only the barcode numbers
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};





exports.deleteMultipleBookingData = async (req, res) => {
  try {
    const ids = req.body.ids;
    console.log("Received ids:", ids);

    if (!Array.isArray(ids) || !ids.length) {
      console.log("Invalid ids:", ids);
      return res
        .status(400)
        .json({ message: "Please provide an array of data IDs to delete" });
    }

    const completedBooking = await CompletedBookingData.find({
      _id: { $in: ids },
    });
    console.log(completedBooking);
    if (!completedBooking.length) {
      return res
        .status(404)
        .json({ message: "No Completed Bookings found for the given IDs" });
    }

    const result = await CompletedBookingData.deleteMany({ _id: { $in: ids } });
    res.json({
      message: `${result.deletedCount} Completed Bookings deleted successfully`,
      completedBookings: completedBooking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};










// exports.deleteMultipleBookingData = async (req, res) => {
//   try {
//     const ids = req.body.ids; 
//     console.log("igudgs",ids);
//     if (!Array.isArray(ids) || !ids.length) {
//       console.log(ids);
//       return res
//         .status(400)
//         .json({ message: "Please provide an array of data IDs to delete" });
//     }

//     const completedBooking = await CompletedBookingData.find({
//       _id: { $in: ids },
//     });
//     console.log(completedBooking);
//     if (!completedBooking.length) {
//       return res
//         .status(404)
//         .json({ message: "No Completed Bookings found for the given IDs" });
//     }

//     const result = await CompletedBookingData.deleteMany({ _id: { $in: ids } });
//     res.json({
//       message: `${result.deletedCount} Completed Bookings deleted successfully`,
//       completedBookings: completedBooking,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

























//old code
// const UserPaymentData = require('../models/userPaymentDataModel');

// const mongoose = require("mongoose");
// const BookingData = require("../models/bookingFileModel");
// const CompletedBookingData = require("../models/userPaymentDataModel");
// const nodeCron = require("node-cron");

// // // Function to transfer completed booking data
// // exports.transferAllCompletedData = async () => {
// //   try {
// //     console.log("Data transfer process started...");

// //     // Step 1: Fetch all completed orders
// //     const completedData = await BookingData.find({ status: "Completed" });
// //     console.log(`Found ${completedData.length} completed orders.`);

// //     if (!completedData.length) {
// //       console.log("No completed orders found. Skipping data transfer.");
// //       return;
// //     }

// //     // Step 2: Fetch existing barcodes from CompletedBookingData
// //     const existingRecords = await CompletedBookingData.find({}, "barcode");
// //     const existingBarcodes = new Set(
// //       existingRecords.map((record) => record.barcode)
// //     );
// //     console.log(
// //       `Found ${existingBarcodes.size} existing records in CompletedBookingData.`
// //     );

// //     let skippedCount = 0;
// //     let transferredCount = 0;
// //     const bulkOps = [];

// //     // Step 3: Prepare bulk operations for new records
// //     for (let data of completedData) {
// //       if (!existingBarcodes.has(data.barcode)) {
// //         bulkOps.push({ insertOne: { document: data.toObject() } });
// //         transferredCount++;
// //       } else {
// //         skippedCount++;
// //       }

// //       // Insert records in batches of 1000
// //       if (bulkOps.length >= 10000) {
// //         console.log(
// //           `Inserting a batch of ${bulkOps.length} records into CompletedBookingData...`
// //         );
// //         await CompletedBookingData.bulkWrite(bulkOps);
// //         bulkOps.length = 0; // Reset bulkOps array
// //       }
// //     }

// //     // Step 4: Insert any remaining records
// //     if (bulkOps.length > 0) {
// //       console.log(
// //         `Inserting final batch of ${bulkOps.length} records into CompletedBookingData...`
// //       );
// //       await CompletedBookingData.bulkWrite(bulkOps);
// //     }

// //     // Final log
// //     console.log(
// //       `Data transfer complete: ${transferredCount} records transferred, ${skippedCount} records skipped.`
// //     );
// //   } catch (err) {
// //     console.error("Error during data transfer:", err.message);
// //   }
// // };

// // // Scheduled cron job to transfer data every minute (adjust schedule as needed)
// // nodeCron.schedule(
// //   "*/1    ",
// //   async () => {
// //     console.log("Scheduled data transfer started...");
// //     try {
// //       await exports.transferAllCompletedData();
// //       console.log("Scheduled data transfer completed successfully.");
// //     } catch (err) {
// //       console.error("Error during scheduled data transfer:", err.message);
// //     }
// //   },
// //   {
// //     scheduled: true,
// //     timezone: "UTC", // Adjust timezone if needed
// //   }
// // );

// // // Function to get the completed booking data with filters (Paginated)
// // exports.getCompletedDataWithFilters = async (req, res) => {
// //   try {
// //     let {
// //       page,
// //       limit,
// //       search,
// //       startDate,
// //       endDate,
// //       filterByDuplicateBarcode,
// //       filterByUnknownBarcode,
// //     } = req.query;

// //     // Set default pagination values
// //     page = parseInt(page) || 1;
// //     limit = parseInt(limit) || 10;
// //     search = search ? search.trim() : "";
// //     filterByDuplicateBarcode = filterByDuplicateBarcode === "true";
// //     filterByUnknownBarcode = filterByUnknownBarcode === "true";

// //     let queryFilter = { status: "Completed" };

// //     // Apply search filter if provided
// //     if (search) {
// //       queryFilter = {
// //         ...queryFilter,
// //         $or: [
// //           { barcode: { $regex: search, $options: "i" } },
// //           { name: { $regex: search, $options: "i" } },
// //         ],
// //       };
// //     }

// //     // Apply date range filter if provided
// //     if (startDate && endDate) {
// //       queryFilter.date = {
// //         $gte: new Date(startDate),
// //         $lte: new Date(endDate),
// //       };
// //     }

// //     // Filter by duplicate barcodes if requested
// //     if (filterByDuplicateBarcode) {
// //       const duplicates = await BookingData.aggregate([
// //         { $match: { status: "Completed" } },
// //         { $group: { _id: "$barcode", count: { $sum: 1 } } },
// //         { $match: { count: { $gt: 1 } } },
// //       ]);

// //       const duplicateBarcodes = duplicates.map((item) => item._id);
// //       queryFilter.barcode = { $in: duplicateBarcodes };
// //     }

// //     // Filter by unknown barcodes if requested
// //     if (filterByUnknownBarcode) {
// //       const knownBarcodes = await CompletedBookingData.find().select("barcode");
// //       const knownBarcodeList = knownBarcodes.map((item) => item.barcode);

// //       queryFilter.barcode = { $nin: knownBarcodeList };
// //     }

// //     const skip = (page - 1) * limit;
// //     const completedData = await BookingData.find(queryFilter)
// //       .skip(skip)
// //       .limit(limit)
// //       .sort({ date: -1 });

// //     const totalRecords = await BookingData.countDocuments(queryFilter);

// //     res.status(200).json({
// //       message: "Completed booking data fetched successfully.",
// //       page,
// //       totalPages: Math.ceil(totalRecords / limit),
// //       totalRecords,
// //       data: completedData,
// //     });
// //   } catch (err) {
// //     res.status(400).json({ error: err.message });
// //   }
// // };

// // exports.transferDuplicateData = async (req, res) => {
// //   try {
// //     // 1. Query to find duplicate barcodes
// //     const duplicates = await BookingData.aggregate([
// //       { $match: { status: "Completed" } }, // We only want 'Completed' bookings
// //       {
// //         $group: {
// //           _id: "$barcode",
// //           count: { $sum: 1 },
// //           records: { $push: "$$ROOT" },
// //         },
// //       }, // Group by barcode, count occurrences, and gather records
// //       { $match: { count: { $gt: 1 } } }, // Filter for barcodes with more than 1 occurrence
// //     ]);

// //     // 2. Flatten the results to just the data you need
// //     const duplicateData = duplicates.reduce((acc, item) => {
// //       acc.push(...item.records); // Push all records of a duplicated barcode
// //       return acc;
// //     }, []);

// //     if (duplicateData.length === 0) {
// //       return res.status(404).json({ message: "No duplicate data found." });
// //     }

// //     // 3. Return the response
// //     res.status(200).json({
// //       message: "Duplicate booking data fetched successfully.",
// //       totalDuplicates: duplicateData.length,
// //       data: duplicateData,
// //     });
// //   } catch (err) {
// //     res.status(400).json({ error: err.message });
// //   }
// // };

// // exports.deleteMultipleBookingData = async (req, res) => {
// //   try {
// //     const ids = req.body.ids; 
// //     if (!Array.isArray(ids) || !ids.length) {
// //       console.log(ids);
// //       return res
// //         .status(400)
// //         .json({ message: "Please provide an array of data IDs to delete" });
// //     }

// //     const completedBooking = await CompletedBookingData.find({
// //       _id: { $in: ids },
// //     });
// //     console.log(completedBooking);
// //     if (!completedBooking.length) {
// //       return res
// //         .status(404)
// //         .json({ message: "No Completed Bookings found for the given IDs" });
// //     }

// //     const result = await CompletedBookingData.deleteMany({ _id: { $in: ids } });
// //     res.json({
// //       message: `${result.deletedCount} Completed Bookings deleted successfully`,
// //       completedBookings: completedBooking,
// //     });
// //   } catch (error) {
// //     res.status(500).json({ message: error.message });
// //   }
// // };








// exports.getUserPaymentData = async (req, res) => {
//     try {
//         let allData;
//         let totalData;

//         // Check user role
//         if (req.user.role === 'admin') {
//             // Admin can access all data
//             allData = await UserPaymentData.find();
//             totalData = await UserPaymentData.countDocuments();
//         } else if (req.user.role === 'branchAdmin' || req.user.role === 'employee') {
//             // Branch Admin and Employee can access data within their branch
//             const branch = req.user.branch; // Assuming branch information is stored in req.user
//             allData = await UserPaymentData.find({ branch: branch });
//             totalData = await UserPaymentData.countDocuments({ branch: branch });
//         } else {
//             // Other roles are not authorized to access data
//             return res.status(403).json({ error: 'Access denied. Unauthorized role.' });
//         }

//         // Send success response
//         res.status(200).json({ totalData, data: allData });
//     } catch (err) {
//         // Send error response
//         res.status(400).json({ error: err.message });
//     }
// };


// exports.updateUserPaymentDataById = async (req, res) => {
//     try {
//         // Check if the user has the 'admin' role
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied. Only admins can update data.' });
//         }

//         const data = await UserPaymentData.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
//         if (!data) {
//             return res.status(404).json({ message: 'Data not found' });
//         }

//         res.status(200).json({ message: 'Data updated successfully', data });
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// };


// exports.deleteUserPaymentDataById = async (req, res) => {
//     try {
//         // Check if the user has the 'admin' role
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied. Only admins can delete data.' });
//         }

//         const data = await UserPaymentData.findByIdAndDelete(req.params.id);
//         if (!data) {
//             return res.status(404).json({ message: 'Data not found' });
//         }

//         res.status(200).json({ message: 'Data deleted successfully', data });
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// };


// exports.deleteMultipleUserPaymentData = async (req, res) => {
//     try {
//         // Check if the user has the 'admin' role
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied. Only admins can delete data.' });
//         }

//         const ids = req.body.ids;
//         if (!Array.isArray(ids)) {
//             return res.status(400).json({ error: 'IDs should be an array of strings' });
//         }

//         const foundDocuments = await UserPaymentData.find({ _id: { $in: ids } });
//         if (foundDocuments.length !== ids.length) {
//             const foundIds = foundDocuments.map(doc => doc._id.toString());
//             const notFoundIds = ids.filter(id => !foundIds.includes(id));
//             return res.status(404).json({ error: 'Some IDs were not found', notFoundIds });
//         }

//         const result = await UserPaymentData.deleteMany({ _id: { $in: ids } });
//         res.status(200).json({ message: 'Data deleted successfully', deletedCount: result.deletedCount, deletedData: foundDocuments });
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// };

// exports.getDuplicateBarcodeNumbers = async (req, res) => {

//     try {
//         let duplicates;

//         // Check user role
//         if (req.user.role === 'admin') {
//             // Admin can check for duplicates in all data
//             duplicates = await UserPaymentData.aggregate([
//                 { $group: { _id: "$barcode", count: { $sum: 1 } } },
//                 { $match: { count: { $gt: 1 } } },
//                 { $project: { _id: 1 } }
//             ]);
//         } else if (req.user.role === 'branchAdmin' || req.user.role === 'employee') {
//             // Branch Admin and Employee can check for duplicates within their branch
//             const branch = req.user.branch; // Assuming branch information is stored in req.user
//             duplicates = await UserPaymentData.aggregate([
//                 { $match: { branch: branch } },
//                 { $group: { _id: "$barcode", count: { $sum: 1 } } },
//                 { $match: { count: { $gt: 1 } } },
//                 { $project: { _id: 1 } }
//             ]);
//         } else {
//             // Other roles are not authorized to access data
//             return res.status(403).json({ error: 'Access denied. Unauthorized role.' });
//         }

//         // Extract article numbers from the result
//         const barcodeNumbers = duplicates.map(duplicate => duplicate._id);

//         // Send success response
//         res.status(200).json({ duplicates: barcodeNumbers });
//     } catch (err) {
//         // Send error response
//         res.status(400).json({ error: err.message });
//     }
// };

// exports.getPaginatedPaidUserInfos = async (req, res) => {
//     try {
//         let { page, limit, search, startDate, endDate, filterByDuplicateBarcode } = req.query;
//         page = parseInt(page) || 1;
//         limit = parseInt(limit) || 10;
//         search = search ? search.trim() : "";
//         filterByDuplicateBarcode = filterByDuplicateBarcode === 'true';

//         let dataQuery;

//         if (req.user.role === 'admin') {
//             // Admin can access all data
//             dataQuery = UserPaymentData.find();
//         } else if (req.user.role === 'branchAdmin' || req.user.role === 'employee') {
//             // Branch Admin and Employee can access data within their branch
//             dataQuery = UserPaymentData.find({ branch: req.user.branch });
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
//                     // Convert spaces to plus signs for product search
//                     const formattedSearch = term.replace(/ /g, '+');

//                     // Exact match for the product field
//                     conditions.push({ product: formattedSearch });

//                     // For other fields, use regex with escaped characters
//                     const escapeRegex = (string) => {
//                         return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
//                     };
//                     const escapedSearch = escapeRegex(term);

//                     conditions.push(
//                         { barcode: { $regex: escapedSearch, $options: "i" } },
//                         { ref: { $regex: escapedSearch, $options: "i" } },
//                         { city: { $regex: escapedSearch, $options: "i" } },
//                         { pincode: { $regex: escapedSearch, $options: "i" } },
//                         { name: { $regex: escapedSearch, $options: "i" } },
//                         { add1: { $regex: escapedSearch, $options: "i" } },
//                         { add2: { $regex: escapedSearch, $options: "i" } },
//                         { add3: { $regex: escapedSearch, $options: "i" } },
//                         { addremail: { $regex: escapedSearch, $options: "i" } },
//                         { addrmobile: { $regex: escapedSearch, $options: "i" } },
//                         { sendermobile: { $regex: escapedSearch, $options: "i" } },
//                         { cr: { $regex: escapedSearch, $options: "i" } },
//                         { branch: { $regex: escapedSearch, $options: "i" } },
//                         { status: { $regex: escapedSearch, $options: "i" } },
//                         { vpp: { $regex: escapedSearch, $options: "i" } },
//                         { contenttype: { $regex: escapedSearch, $options: "i" } },
//                         { priority: { $regex: escapedSearch, $options: "i" } },
//                         { typing: { $regex: escapedSearch, $options: "i" } },
//                         { altmobile: { $regex: escapedSearch, $options: "i" } }
//                     );

//                     if (!isNaN(term)) {
//                         conditions.push(
//                             { sl: parseInt(term) },
//                             { weight: parseFloat(term) },
//                             { cod: parseFloat(term) },
//                             { insval: parseFloat(term) },
//                             { l: parseFloat(term) },
//                             { b: parseFloat(term) },
//                             { h: parseFloat(term) }
//                         );
//                     }

//                     const searchDate = new Date(term);

//                     if (!isNaN(searchDate)) {
//                         conditions.push({
//                             date: {
//                                 $gte: new Date(searchDate.setHours(0, 0, 0)),
//                                 $lt: new Date(searchDate.setHours(23, 59, 59))
//                             }
//                         });
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
//                     date: {
//                         $gte: new Date(start),
//                         $lte: new Date(end)
//                     }
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

//         // Apply filterByDuplicateBarcode logic
//         if (filterByDuplicateBarcode) {
//             const barcodeCounts = await UserPaymentData.aggregate([
//                 { $group: { _id: "$barcode", count: { $sum: 1 } } },
//                 { $match: { count: { $gt: 1 } } },
//                 { $project: { _id: 1 } }
//             ]);

//             const duplicateBarcodes = barcodeCounts.map(bc => bc._id);

//             dataQuery = dataQuery.find({
//                 barcode: { $in: duplicateBarcodes }
//             });
//         }

//         const totalData = await UserPaymentData.countDocuments(dataQuery.getFilter());
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


// // exports.getPaginatedPaidUserInfos = async (req, res) => {
// //     try {
// //         let { page, limit, search, startDate, endDate } = req.query;
// //         page = parseInt(page) || 1;
// //         limit = parseInt(limit) || 10;
// //         search = search ? search.trim() : "";

// //         let dataQuery;

// //         if (req.user.role === 'admin') {
// //             // Admin can access all data
// //             dataQuery = UserPaymentData.find();
// //         } else if (req.user.role === 'branchAdmin' || req.user.role === 'employee') {
// //             // Branch Admin and Employee can access data within their branch
// //             dataQuery = UserPaymentData.find({ branch: req.user.branch });
// //         } else {
// //             return res.status(403).json({ message: 'Access denied. Unauthorized role.' });
// //         }

// //         const searchConditions = [];

// //         if (search) {
// //             // Convert spaces to plus signs for product search
// //             const formattedSearch = search.replace(/ /g, '+');

// //             // Exact match for the barcode field
// //             searchConditions.push({ product: formattedSearch });

// //             // For other fields, use regex with escaped characters
// //             const escapeRegex = (string) => {
// //                 return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
// //             };
// //             const escapedSearch = escapeRegex(search);

// //             searchConditions.push(
// //                 { barcode: { $regex: escapedSearch, $options: "i" } },
// //                 { ref: { $regex: escapedSearch, $options: "i" } },
// //                 { city: { $regex: escapedSearch, $options: "i" } },
// //                 { pincode: { $regex: escapedSearch, $options: "i" } },
// //                 { name: { $regex: escapedSearch, $options: "i" } },
// //                 { add1: { $regex: escapedSearch, $options: "i" } },
// //                 { add2: { $regex: escapedSearch, $options: "i" } },
// //                 { add3: { $regex: escapedSearch, $options: "i" } },
// //                 { addremail: { $regex: escapedSearch, $options: "i" } },
// //                 { addrmobile: { $regex: escapedSearch, $options: "i" } },
// //                 { sendermobile: { $regex: escapedSearch, $options: "i" } },
// //                 { cr: { $regex: escapedSearch, $options: "i" } },
// //                 { branch: { $regex: escapedSearch, $options: "i" } },
// //                 { status: { $regex: escapedSearch, $options: "i" } },
// //                 { vpp: { $regex: escapedSearch, $options: "i" } },
// //                 { contenttype: { $regex: escapedSearch, $options: "i" } },
// //                 { priority: { $regex: escapedSearch, $options: "i" } },
// //                 { typing: { $regex: escapedSearch, $options: "i" } },
// //                 { altmobile: { $regex: escapedSearch, $options: "i" } }
// //             );

// //             if (!isNaN(search)) {
// //                 searchConditions.push(
// //                     { sl: parseInt(search) },
// //                     { weight: parseFloat(search) },
// //                     { cod: parseFloat(search) },
// //                     { insval: parseFloat(search) },
// //                     { l: parseFloat(search) },
// //                     { b: parseFloat(search) },
// //                     { h: parseFloat(search) }
// //                 );
// //             }

// //             const searchDate = new Date(search);

// //             if (!isNaN(searchDate)) {
// //                 searchConditions.push({
// //                     date: {
// //                         $gte: new Date(searchDate.setHours(0, 0, 0)),
// //                         $lt: new Date(searchDate.setHours(23, 59, 59))
// //                     }
// //                 });
// //             }
// //         }

// //         if (startDate && endDate) {
// //             const start = new Date(startDate).setHours(0, 0, 0, 0);
// //             const end = new Date(endDate).setHours(23, 59, 59, 999);
// //             if (!isNaN(start) && !isNaN(end)) {
// //                 searchConditions.push({
// //                     date: {
// //                         $gte: new Date(start),
// //                         $lte: new Date(end)
// //                     }
// //                 });
// //             }
// //         }

// //         if (searchConditions.length > 0) {
// //             dataQuery = dataQuery.find({ $or: searchConditions });
// //         }

// //         const totalData = await UserPaymentData.countDocuments(dataQuery.getFilter());
// //         const data = await dataQuery.skip((page - 1) * limit).limit(limit).exec();

// //         res.status(200).json({
// //             totalData,
// //             totalPages: Math.ceil(totalData / limit),
// //             currentPage: page,
// //             data
// //         });
// //     } catch (err) {
// //         res.status(400).json({ message: err.message });
// //     }
// // };
