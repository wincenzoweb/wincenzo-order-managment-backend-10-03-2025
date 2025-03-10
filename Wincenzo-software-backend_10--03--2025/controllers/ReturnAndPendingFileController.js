// controllers/dataController.js
const ReturnAndPendingData = require("../models/ReturnAndPendingFileModel");
const BookingData = require("../models/bookingFileModel");

// exports.receiveData = async (req, res) => {
//   try {
//     // Check if the user has the 'admin' role
//     if (req.user.role !== "admin") {
//       return res
//         .status(403)
//         .json({ message: "Access denied. Only admins can insert data." });
//     }

//     const barcodes = req.body;

//     if (!Array.isArray(barcodes)) {
//       return res
//         .status(400)
//         .json({ error: "Data should be an array of barcodes" });
//     }

//     // Check if any unexpected fields are present in the request body
//     // const unexpectedFields = Object.keys(req.body).filter(key => key !== 'barcodes');
//     // if (unexpectedFields.length > 0) {
//     //     return res.status(400).json({ error: `Unexpected Column found` });
//     // }

//     // Check if all items in the array are valid barcodes (assuming barcode is a string)
//     const isValidBarcodes = barcodes.every(
//       (barcode) => typeof barcode === "string"
//     );
//     if (!isValidBarcodes) {
//       return res.status(400).json({ error: "Invalid barcode format" });
//     }

//     // Find booking data that matches the barcodes
//     const matchingData = await BookingData.find({ barcode: { $in: barcodes } });

//     if (matchingData.length === 0) {
//       return res.status(404).json({ error: "No matching booking data found" });
//     }

//     // Insert the matching data into ReturnAndPendingData
//     const savedData = await ReturnAndPendingData.insertMany(matchingData);

//     res
//       .status(200)
//       .json({ message: "Data received successfully", data: savedData });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };


// exports.receiveData = async (req, res) => {
//   try {
//     // Check if the user has the 'admin' role
//     if (req.user.role !== "admin") {
//       return res
//         .status(403)
//         .json({ message: "Access denied. Only admins can insert data." });
//     }

//     const barcodes = req.body;

//     if (!Array.isArray(barcodes)) {
//       return res
//         .status(400)
//         .json({ error: "Data should be an array of barcodes" });
//     }

//     // Check if all items in the array are valid barcodes (assuming barcode is a string)
//     const isValidBarcodes = barcodes.every(
//       (barcode) => typeof barcode === "string"
//     );
//     if (!isValidBarcodes) {
//       return res.status(400).json({ error: "Invalid barcode format" });
//     }

//     // Find booking data that matches the barcodes
//     const matchingData = await BookingData.find({ barcode: { $in: barcodes } });

//     if (matchingData.length === 0) {
//       return res.status(404).json({ error: "No matching booking data found" });
//     }

//     // Update status to 'returned' and save updated data back to BookingData
//     const updatedData = await Promise.all(
//       matchingData.map(async (data) => {
//         data.status = "Returned";
//         await data.save();
//         const { _id, __v, ...rest } = data.toObject();
//         return rest // Convert mongoose document to plain object
//       })
//     );

//     // Insert the updated data into ReturnAndPendingData
//     const savedData = await ReturnAndPendingData.insertMany(updatedData);

//     // Count the number of documents inserted into ReturnAndPendingData
//     const count = savedData.length;

//     res
//       .status(200)
//       .json({ message: `${count} Data received successfully`, data: savedData });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };


// exports.receiveData = async (req, res) => {
//   try {
//     // Check if the user has the 'admin' role
//     if (req.user.role !== "admin") {
//       return res
//         .status(403)
//         .json({ message: "Access denied. Only admins can insert data." });
//     }

//     const barcodes = req.body;

//     if (!Array.isArray(barcodes)) {
//       return res
//         .status(400)
//         .json({ error: "Data should be an array of barcodes" });
//     }

//     // Check if all items in the array are valid barcodes (assuming barcode is a string)
//     const isValidBarcodes = barcodes.every(
//       (barcode) => typeof barcode === "string"
//     );
//     if (!isValidBarcodes) {
//       return res.status(400).json({ error: "Invalid barcode format" });
//     }

//     // Find booking data that matches the barcodes
//     const matchingData = await BookingData.find({ barcode: { $in: barcodes } });

//     // Update status to 'returned' for matching data and collect unmatched barcodes
//     const updatedData = await Promise.all(
//       barcodes.map(async (barcode) => {
//         const existingBooking = matchingData.find(data => data.barcode === barcode);
//         if (existingBooking) {
//           existingBooking.status = "Returned";
//           await existingBooking.save();
//           const { _id, __v, ...rest } = existingBooking.toObject();
//           return rest; // Convert mongoose document to plain object
//         } else {
//           return { barcode, status: "Returned" }; // Create new entry for unmatched barcode
//         }
//       })
//     );

//     // Insert all updated data into ReturnAndPendingData
//     const savedData = await ReturnAndPendingData.insertMany(updatedData);

//     // Count the number of documents inserted into ReturnAndPendingData
//     const count = savedData.length;

//     res
//       .status(200)
//       .json({ message: `${count} Data received successfully`, data: savedData });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };




exports.receiveData = async (req, res) => {
  try {
    // Check if the user has the 'admin' role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can insert data.' });
    }

    const barcodes = req.body;

    // Ensure the request body is an array
    if (!Array.isArray(barcodes)) {
      return res.status(400).json({ error: 'Data should be an array of barcodes' });
    }

    // Check if barcodes array is empty
    if (barcodes.length === 0) {
      return res.status(400).json({ error: 'Barcode is required.' });
    }
  
    // Validate each barcode: must be a non-empty string
    const invalidBarcodes = barcodes.filter(barcode => typeof barcode !== 'string' || barcode.trim() === '');
    if (invalidBarcodes.length > 0) {
      return res.status(400).json({ error: 'Barcode is required and must be a non-empty string.' });
    } 

    // Find matching booking data by barcode
    const matchingData = await BookingData.find({ barcode: { $in: barcodes } });

    // Update status to 'Returned' for all matching data
    const updatedBookingData = matchingData.map(data => {
      data.status = 'Returned';
      return data.save();
    });

    // Wait for all database updates to complete
    await Promise.all(updatedBookingData);

    // Prepare data for inserting into ReturnAndPendingData
    const updatedData = barcodes.map(barcode => {
      const existingBooking = matchingData.find(data => data.barcode === barcode);
      if (existingBooking) {
        const { _id, __v, ...rest } = existingBooking.toObject(); // Omit _id and __v fields
        return rest;
      } else {
        return { barcode, status: 'Returned' }; // New entry for unmatched barcodes
      }
    });

    // Insert updated data into ReturnAndPendingData
    const savedData = await ReturnAndPendingData.insertMany(updatedData);

    // Respond with success and number of records inserted
    const count = savedData.length;
    return res.status(200).json({ message: `${count} Data received successfully`, data: savedData });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};











//latest code
// exports.receiveData = async (req, res) => {
//   try {
//     // Check if the user has the 'admin' role
//     if (req.user.role !== 'admin') {
//       return res.status(403).json({ message: 'Access denied. Only admins can insert data.' });
//     }

//     const barcodes = req.body;

//     if (!Array.isArray(barcodes)) {
//       return res.status(400).json({ error: 'Data should be an array of barcodes' });
//     }

//     // Check if all items in the array are valid barcodes (assuming barcode is a string)
//     const isValidBarcodes = barcodes.every(barcode => typeof barcode === 'string');
//     if (!isValidBarcodes) {
//       return res.status(400).json({ error: 'Invalid barcode format' });
//     }

//     // Find booking data that matches the barcodes
//     const matchingData = await BookingData.find({ barcode: { $in: barcodes } });

//     // Update status to 'Returned' for matching data
//     const updatedBookingData = matchingData.map(data => {
//       data.status = 'Returned';
//       return data.save();
//     });

//     // Wait for all updates to complete
//     await Promise.all(updatedBookingData);

//     // Prepare the data for insertion into ReturnAndPendingData
//     const updatedData = barcodes.map(barcode => {
//       const existingBooking = matchingData.find(data => data.barcode === barcode);
//       if (existingBooking) {
//         const { _id, __v, ...rest } = existingBooking.toObject();
//         return rest; // Convert mongoose document to plain object
//       } else {
//         return { barcode, status: 'Returned' }; // Create new entry for unmatched barcode
//       }
//     });

//     // Insert all updated data into ReturnAndPendingData
//     const savedData = await ReturnAndPendingData.insertMany(updatedData);

//     // Count the number of documents inserted into ReturnAndPendingData
//     const count = savedData.length;

//     res.status(200).json({ message: `${count} Data received successfully`, data: savedData });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };


exports.getAllData = async (req, res) => {
  try {
    let allData;
    let totalData;
    // Check user role
    if (req.user.role === "admin") {
      // Admin can access all data
      allData = await ReturnAndPendingData.find();
      totalData = await ReturnAndPendingData.countDocuments();
    } else if (
      req.user.role === "branchAdmin" ||
      req.user.role === "employee"
    ) {
      // Branch Admin and Employee can access data within their branch
      const branch = req.user.branch; // Assuming branch information is stored in req.user
      allData = await ReturnAndPendingData.find({ branch: branch });
      totalData = await ReturnAndPendingData.countDocuments({ branch: branch });
    } else {
      // Other roles are not authorized to access data
      return res
        .status(403)
        .json({ error: "Access denied. Unauthorized role." });
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
    const data = await ReturnAndPendingData.findById(req.params.id);
    if (!data) {
      return res.status(404).json({ message: "Data not found" });
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateDataById = async (req, res) => {
  try {
    // Check if the user has the 'admin' role
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Only admins can Update data." });
    }

    const data = await ReturnAndPendingData.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!data) {
      return res.status(404).json({ message: "Data not found" });
    }
    res.status(200).json({ message: "Data Update successfully", data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteDataById = async (req, res) => {
  try {
    // Check if the user has the 'admin' role
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Only admins can delete data." });
    }
    const bookingId = req.params.id;
    const data = await ReturnAndPendingData.findByIdAndDelete(bookingId);
    if (!data) {
      return res.status(404).json({ message: "Data not found" });
    }
    res.status(200).json({ message: "Data deleted successfully", data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteMultipleData = async (req, res) => {
  try {
    // Check if the user has the 'admin' role
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Only admins can delete data." });
    }
    const ids = req.body.ids;

    if (!Array.isArray(ids)) {
      return res
        .status(400)
        .json({ error: "IDs should be an array of strings" });
    }

    const foundDocuments = await ReturnAndPendingData.find({
      _id: { $in: ids },
    });

    if (foundDocuments.length !== ids.length) {
      const foundIds = foundDocuments.map((doc) => doc._id.toString());
      const notFoundIds = ids.filter((id) => !foundIds.includes(id));
      return res
        .status(404)
        .json({ error: "Some IDs were not found", notFoundIds });
    }

    const result = await ReturnAndPendingData.deleteMany({ _id: { $in: ids } });
    res
      .status(200)
      .json({
        message: "Data deleted successfully",
        deletedCount: result.deletedCount,
        deletedData: foundDocuments,
      });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getDuplicateBarcodeNumbers = async (req, res) => {

  try {
    let duplicates;

    
    // Check user role
    if (req.user.role === 'admin') {
      // Admin can check for duplicates in all data
      duplicates = await ReturnAndPendingData.aggregate([
        { $group: { _id: "$barcode", count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
        { $project: { _id: 1 } }
      ]);
    } else if (req.user.role === 'branchAdmin' || req.user.role === 'employee') {
      // Branch Admin and Employee can check for duplicates within their branch
      const branch = req.user.branch; // Assuming branch information is stored in req.user
      duplicates = await ReturnAndPendingData.aggregate([
        { $match: { branch: branch } },
        { $group: { _id: "$barcode", count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
        { $project: { _id: 1 } }
      ]);
    } else {
      // Other roles are not authorized to access data
      return res.status(403).json({ error: 'Access denied. Unauthorized role.' });
    }

    // Extract article numbers from the result
    const barcodeNumbers = duplicates.map(duplicate => duplicate._id);

    // Send success response
    res.status(200).json({ duplicates: barcodeNumbers });
  } catch (err) {
    // Send error response
    res.status(400).json({ error: err.message });
  }
};





exports.getPaginatedReturnData = async (req, res) => {
  try {
      let { page, limit, search, startDate, endDate, filterByDuplicateBarcode, filterByUnknownBarcode } = req.query;
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
      search = search ? search.trim() : "";
      filterByDuplicateBarcode = filterByDuplicateBarcode === 'true';
      filterByUnknownBarcode = filterByUnknownBarcode === 'true';

      let dataQuery;
      // Define dataQuery based on user role
      if (req.user.role === 'admin') {
          dataQuery = ReturnAndPendingData.find();
      } else if (req.user.role === 'branchAdmin' || req.user.role === 'employee') {
          dataQuery = ReturnAndPendingData.find({ branch: req.user.branch });
      } else {
          return res.status(403).json({ message: 'Access denied. Unauthorized role.' });
      }

      const searchConditions = [];
      const dateConditions = [];

      // Apply search filters
      if (search) {
          const searchTerms = search.split(',').map(term => term.trim());
          const combinedConditions = searchTerms.map(term => {
              const conditions = [];
              if (term) {
                  const formattedSearch = term.replace(/ /g, '+');
                  conditions.push({ product: formattedSearch });

                  const escapeRegex = (string) => string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
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
              dataQuery = dataQuery.find({ $and: combinedConditions });
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
          dataQuery = dataQuery.find({ $and: [...searchConditions, ...dateConditions] });
      } else if (searchConditions.length > 0) {
          dataQuery = dataQuery.find({ $and: searchConditions });
      } else if (dateConditions.length > 0) {
          dataQuery = dataQuery.find({ $and: dateConditions });
      }

      // Apply filterByDuplicateBarcode logic
      let totalSameDuplicateNumbers = 0;
      if (filterByDuplicateBarcode) {
          const barcodeCounts = await ReturnAndPendingData.aggregate([
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
          const unknownBarcodes = await ReturnAndPendingData.find({
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

      const totalData = await ReturnAndPendingData.countDocuments(dataQuery.getFilter());
      const data = await dataQuery.skip((page - 1) * limit).limit(limit).exec();

      res.status(200).json({
          totalData,
          totalPages: Math.ceil(totalData / limit),
          currentPage: page,
          data,
          totalSameDuplicateNumbers,
          totalUnknownBarcodeNumbers
      });
  } catch (err) {
      res.status(400).json({ message: err.message });
  }
};
















// exports.getPaginatedReturnData = async (req, res) => {
//   try {
//     let { page, limit, search, startDate, endDate, filterByDuplicateBarcode, filterByUnknownBarcode } = req.query;
//     page = parseInt(page) || 1;
//     limit = parseInt(limit) || 10;
//     search = search ? search.trim() : "";
//     filterByDuplicateBarcode = filterByDuplicateBarcode === 'true'; // Convert to boolean
//     filterByUnknownBarcode = filterByUnknownBarcode === 'true'; // Convert to boolean

//     let dataQuery;

//     if (req.user.role === 'admin') {
//       // Admin can access all data
//       dataQuery = ReturnAndPendingData.find();
//     } else if (req.user.role === 'branchAdmin' || req.user.role === 'employee') {
//       // Branch Admin and Employee can access data within their branch
//       dataQuery = ReturnAndPendingData.find({ branch: req.user.branch });
//     } else {
//       return res.status(403).json({ message: 'Access denied. Unauthorized role.' });
//     }

//     const searchConditions = [];
//     const dateConditions = [];

//     if (search) {
//       // Split search terms by commas
//       const searchTerms = search.split(',').map(term => term.trim());

//       const combinedConditions = searchTerms.map(term => {
//         const conditions = [];
//         if (term) {
//           // Convert spaces to plus signs for product search
//           const formattedSearch = term.replace(/ /g, '+');

//           // Exact match for the product field
//           conditions.push({ product: formattedSearch });

//           // For other fields, use regex with escaped characters
//           const escapeRegex = (string) => {
//             return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
//           };
//           const escapedSearch = escapeRegex(term);

//           conditions.push(
//             { barcode: { $regex: escapedSearch, $options: "i" } },
//             { ref: { $regex: escapedSearch, $options: "i" } },
//             { city: { $regex: escapedSearch, $options: "i" } },
//             { pincode: { $regex: escapedSearch, $options: "i" } },
//             { name: { $regex: escapedSearch, $options: "i" } },
//             { add1: { $regex: escapedSearch, $options: "i" } },
//             { add2: { $regex: escapedSearch, $options: "i" } },
//             { add3: { $regex: escapedSearch, $options: "i" } },
//             { addremail: { $regex: escapedSearch, $options: "i" } },
//             { addrmobile: { $regex: escapedSearch, $options: "i" } },
//             { sendermobile: { $regex: escapedSearch, $options: "i" } },
//             { cr: { $regex: escapedSearch, $options: "i" } },
//             { branch: { $regex: escapedSearch, $options: "i" } },
//             { status: { $regex: escapedSearch, $options: "i" } },
//             { vpp: { $regex: escapedSearch, $options: "i" } },
//             { contenttype: { $regex: escapedSearch, $options: "i" } },
//             { priority: { $regex: escapedSearch, $options: "i" } },
//             { typing: { $regex: escapedSearch, $options: "i" } },
//             { altmobile: { $regex: escapedSearch, $options: "i" } }
//           );

//           if (!isNaN(term)) {
//             conditions.push(
//               { sl: parseInt(term) },
//               { weight: parseFloat(term) },
//               { cod: parseFloat(term) },
//               { insval: parseFloat(term) },
//               { l: parseFloat(term) },
//               { b: parseFloat(term) },
//               { h: parseFloat(term) }
//             );
//           }

//           const searchDate = new Date(term);

//           if (!isNaN(searchDate)) {
//             conditions.push({
//               date: {
//                 $gte: new Date(searchDate.setHours(0, 0, 0)),
//                 $lt: new Date(searchDate.setHours(23, 59, 59))
//               }
//             });
//           }
//         }
//         return { $or: conditions };
//       });

//       if (combinedConditions.length > 0) {
//         dataQuery = dataQuery.find({
//           $and: combinedConditions
//         });
//       }
//     }

//     if (startDate && endDate) {
//       const start = new Date(startDate).setHours(0, 0, 0, 0);
//       const end = new Date(endDate).setHours(23, 59, 59, 999);
//       if (!isNaN(start) && !isNaN(end)) {
//         dateConditions.push({
//           date: {
//             $gte: new Date(start),
//             $lte: new Date(end)
//           }
//         });
//       }
//     }

//     if (searchConditions.length > 0 && dateConditions.length > 0) {
//       dataQuery = dataQuery.find({
//         $and: [
//           ...searchConditions,
//           ...dateConditions
//         ]
//       });
//     } else if (searchConditions.length > 0) {
//       dataQuery = dataQuery.find({
//         $and: searchConditions
//       });
//     } else if (dateConditions.length > 0) {
//       dataQuery = dataQuery.find({
//         $and: dateConditions
//       });
//     }

//     // Apply filterByDuplicateBarcode logic
//     if (filterByDuplicateBarcode) {
//       const barcodeCounts = await ReturnAndPendingData.aggregate([
//         { $group: { _id: "$barcode", count: { $sum: 1 } } },
//         { $match: { count: { $gt: 1 } } },
//         { $project: { _id: 1 } }
//       ]);

//       const duplicateBarcodes = barcodeCounts.map(bc => bc._id);

//       dataQuery = dataQuery.find({
//         barcode: { $in: duplicateBarcodes }
//       });
//     }

//     // Apply filterByUnknownBarcode logic

//     if (filterByUnknownBarcode) {
//       dataQuery = dataQuery.find({
//         $or: [
//           { product: { $exists: false } },
//           {
//             $and: [
//               { barcode: { $exists: true } },
//               { status: { $exists: true } },
//               { $expr: { $eq: [{ $size: { $objectToArray: "$$ROOT" } }, 3] } }
//             ]
//           }
//         ]
//       });
//     }

//     const totalData = await ReturnAndPendingData.countDocuments(dataQuery.getFilter());
//     const data = await dataQuery.skip((page - 1) * limit).limit(limit).exec();

//     res.status(200).json({
//       totalData,
//       totalPages: Math.ceil(totalData / limit),
//       currentPage: page,
//       data
//     });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };



// exports.getPaginatedReturnData = async (req, res) => {
//   try {
//     let { page, limit, search, startDate, endDate } = req.query;
//     page = parseInt(page) || 1;
//     limit = parseInt(limit) || 10;
//     search = search ? search.trim() : "";

//     let dataQuery;

//     if (req.user.role === 'admin') {
//       // Admin can access all data
//       dataQuery = ReturnAndPendingData.find();
//     } else if (req.user.role === 'branchAdmin' || req.user.role === 'employee') {
//       // Branch Admin and Employee can access data within their branch
//       dataQuery = ReturnAndPendingData.find({ branch: req.user.branch });
//     } else {
//       return res.status(403).json({ message: 'Access denied. Unauthorized role.' });
//     }

//     const searchConditions = [];
//     const dateConditions = [];

//     if (search) {
//       // Split search terms by commas
//       const searchTerms = search.split(',').map(term => term.trim());

//       const combinedConditions = searchTerms.map(term => {
//         const conditions = [];
//         if (term) {
//           // Convert spaces to plus signs for product search
//           const formattedSearch = term.replace(/ /g, '+');

//           // Exact match for the product field
//           conditions.push({ product: formattedSearch });

//           // For other fields, use regex with escaped characters
//           const escapeRegex = (string) => {
//             return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
//           };
//           const escapedSearch = escapeRegex(term);

//           conditions.push(
//             { barcode: { $regex: escapedSearch, $options: "i" } },
//             { ref: { $regex: escapedSearch, $options: "i" } },
//             { city: { $regex: escapedSearch, $options: "i" } },
//             { pincode: { $regex: escapedSearch, $options: "i" } },
//             { name: { $regex: escapedSearch, $options: "i" } },
//             { add1: { $regex: escapedSearch, $options: "i" } },
//             { add2: { $regex: escapedSearch, $options: "i" } },
//             { add3: { $regex: escapedSearch, $options: "i" } },
//             { addremail: { $regex: escapedSearch, $options: "i" } },
//             { addrmobile: { $regex: escapedSearch, $options: "i" } },
//             { sendermobile: { $regex: escapedSearch, $options: "i" } },
//             { cr: { $regex: escapedSearch, $options: "i" } },
//             { branch: { $regex: escapedSearch, $options: "i" } },
//             { status: { $regex: escapedSearch, $options: "i" } },
//             { vpp: { $regex: escapedSearch, $options: "i" } },
//             { contenttype: { $regex: escapedSearch, $options: "i" } },
//             { priority: { $regex: escapedSearch, $options: "i" } },
//             { typing: { $regex: escapedSearch, $options: "i" } },
//             { altmobile: { $regex: escapedSearch, $options: "i" } }
//           );

//           if (!isNaN(term)) {
//             conditions.push(
//               { sl: parseInt(term) },
//               { weight: parseFloat(term) },
//               { cod: parseFloat(term) },
//               { insval: parseFloat(term) },
//               { l: parseFloat(term) },
//               { b: parseFloat(term) },
//               { h: parseFloat(term) }
//             );
//           }

//           const searchDate = new Date(term);

//           if (!isNaN(searchDate)) {
//             conditions.push({
//               date: {
//                 $gte: new Date(searchDate.setHours(0, 0, 0)),
//                 $lt: new Date(searchDate.setHours(23, 59, 59))
//               }
//             });
//           }
//         }
//         return { $or: conditions };
//       });

//       if (combinedConditions.length > 0) {
//         dataQuery = dataQuery.find({
//           $and: combinedConditions
//         });
//       }
//     }

//     if (startDate && endDate) {
//       const start = new Date(startDate).setHours(0, 0, 0, 0);
//       const end = new Date(endDate).setHours(23, 59, 59, 999);
//       if (!isNaN(start) && !isNaN(end)) {
//         dateConditions.push({
//           date: {
//             $gte: new Date(start),
//             $lte: new Date(end)
//           }
//         });
//       }
//     }

//     if (searchConditions.length > 0 && dateConditions.length > 0) {
//       dataQuery = dataQuery.find({
//         $and: [
//           ...searchConditions,
//           ...dateConditions
//         ]
//       });
//     } else if (searchConditions.length > 0) {
//       dataQuery = dataQuery.find({
//         $and: searchConditions
//       });
//     } else if (dateConditions.length > 0) {
//       dataQuery = dataQuery.find({
//         $and: dateConditions
//       });
//     }

//     const totalData = await ReturnAndPendingData.countDocuments(dataQuery.getFilter());
//     const data = await dataQuery.skip((page - 1) * limit).limit(limit).exec();

//     res.status(200).json({
//       totalData,
//       totalPages: Math.ceil(totalData / limit),
//       currentPage: page,
//       data
//     });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };


// exports.getPaginatedReturnData = async (req, res) => {
//   try {
//     let { page, limit, search, startDate, endDate } = req.query;
//     page = parseInt(page) || 1;
//     limit = parseInt(limit) || 10;
//     search = search ? search.trim() : "";

//     let dataQuery;

//     if (req.user.role === 'admin') {
//       // Admin can access all data
//       dataQuery = ReturnAndPendingData.find();
//     } else if (req.user.role === 'branchAdmin' || req.user.role === 'employee') {
//       // Branch Admin and Employee can access data within their branch
//       dataQuery = ReturnAndPendingData.find({ branch: req.user.branch });
//     } else {
//       return res.status(403).json({ message: 'Access denied. Unauthorized role.' });
//     }

//     const searchConditions = [];
//     const dateConditions = [];

//     if (search) {
//       // Convert spaces to plus signs for product search
//       const formattedSearch = search.replace(/ /g, '+');

//       // Exact match for the barcode field
//       searchConditions.push({ product: formattedSearch });

//       // For other fields, use regex with escaped characters
//       const escapeRegex = (string) => {
//         return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
//       };
//       const escapedSearch = escapeRegex(search);

//       searchConditions.push(
//         { barcode: { $regex: escapedSearch, $options: "i" } },
//         { ref: { $regex: escapedSearch, $options: "i" } },
//         { city: { $regex: escapedSearch, $options: "i" } },
//         { pincode: { $regex: escapedSearch, $options: "i" } },
//         { name: { $regex: escapedSearch, $options: "i" } },
//         { add1: { $regex: escapedSearch, $options: "i" } },
//         { add2: { $regex: escapedSearch, $options: "i" } },
//         { add3: { $regex: escapedSearch, $options: "i" } },
//         { addremail: { $regex: escapedSearch, $options: "i" } },
//         { addrmobile: { $regex: escapedSearch, $options: "i" } },
//         { sendermobile: { $regex: escapedSearch, $options: "i" } },
//         { cr: { $regex: escapedSearch, $options: "i" } },
//         { branch: { $regex: escapedSearch, $options: "i" } },
//         { status: { $regex: escapedSearch, $options: "i" } },
//         { vpp: { $regex: escapedSearch, $options: "i" } },
//         { contenttype: { $regex: escapedSearch, $options: "i" } },
//         { priority: { $regex: escapedSearch, $options: "i" } },
//         { typing: { $regex: escapedSearch, $options: "i" } },
//         { altmobile: { $regex: escapedSearch, $options: "i" } }
//       );

//       if (!isNaN(search)) {
//         searchConditions.push(
//           { sl: parseInt(search) },
//           { weight: parseFloat(search) },
//           { cod: parseFloat(search) },
//           { insval: parseFloat(search) },
//           { l: parseFloat(search) },
//           { b: parseFloat(search) },
//           { h: parseFloat(search) }
//         );
//       }

//       const searchDate = new Date(search);

//       if (!isNaN(searchDate)) {
//         searchConditions.push({
//           date: {
//             $gte: new Date(searchDate.setHours(0, 0, 0)),
//             $lt: new Date(searchDate.setHours(23, 59, 59))
//           }
//         });
//       }
//     }

//     if (startDate && endDate) {
//       const start = new Date(startDate).setHours(0, 0, 0, 0);
//       const end = new Date(endDate).setHours(23, 59, 59, 999);
//       if (!isNaN(start) && !isNaN(end)) {
//         dateConditions.push({
//           date: {
//             $gte: new Date(start),
//             $lte: new Date(end)
//           }
//         });
//       }
//     }

//     if (searchConditions.length > 0 && dateConditions.length > 0) {
//       dataQuery = dataQuery.find({
//         $and: [
//           { $or: searchConditions },
//           ...dateConditions
//         ]
//       });
//     } else if (searchConditions.length > 0) {
//       dataQuery = dataQuery.find({
//         $or: searchConditions
//       });
//     } else if (dateConditions.length > 0) {
//       dataQuery = dataQuery.find({
//         $and: dateConditions
//       });
//     }

//     const totalData = await ReturnAndPendingData.countDocuments(dataQuery.getFilter());
//     const data = await dataQuery.skip((page - 1) * limit).limit(limit).exec();

//     res.status(200).json({
//       totalData,
//       totalPages: Math.ceil(totalData / limit),
//       currentPage: page,
//       data
//     });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };


// exports.getPaginatedReturnData = async (req, res) => {
//   try {
//     let { page, limit, search, startDate, endDate } = req.query;
//     page = parseInt(page) || 1;
//     limit = parseInt(limit) || 10;
//     search = search ? search.trim() : "";

//     let dataQuery;

//     if (req.user.role === 'admin') {
//       // Admin can access all data
//       dataQuery = ReturnAndPendingData.find();
//     } else if (req.user.role === 'branchAdmin' || req.user.role === 'employee') {
//       // Branch Admin and Employee can access data within their branch
//       dataQuery = ReturnAndPendingData.find({ branch: req.user.branch });
//     } else {
//       return res.status(403).json({ message: 'Access denied. Unauthorized role.' });
//     }

//     const searchConditions = [];

//     if (search) {
//       // Convert spaces to plus signs for barcode search
//       const formattedSearch = search.replace(/ /g, '+');

//       // Exact match for the barcode field
//       searchConditions.push({ barcode: formattedSearch });

//       // For other fields, use regex with escaped characters
//       const escapeRegex = (string) => {
//         return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
//       };
//       const escapedSearch = escapeRegex(search);

//       searchConditions.push(
//         { ref: { $regex: escapedSearch, $options: "i" } },
//         { city: { $regex: escapedSearch, $options: "i" } },
//         { pincode: { $regex: escapedSearch, $options: "i" } },
//         { name: { $regex: escapedSearch, $options: "i" } },
//         { add1: { $regex: escapedSearch, $options: "i" } },
//         { add2: { $regex: escapedSearch, $options: "i" } },
//         { add3: { $regex: escapedSearch, $options: "i" } },
//         { addremail: { $regex: escapedSearch, $options: "i" } },
//         { addrmobile: { $regex: escapedSearch, $options: "i" } },
//         { sendermobile: { $regex: escapedSearch, $options: "i" } },
//         { cr: { $regex: escapedSearch, $options: "i" } },
//         { branch: { $regex: escapedSearch, $options: "i" } },
//         { status: { $regex: escapedSearch, $options: "i" } },
//         { vpp: { $regex: escapedSearch, $options: "i" } },
//         { contenttype: { $regex: escapedSearch, $options: "i" } },
//         { priority: { $regex: escapedSearch, $options: "i" } },
//         { typing: { $regex: escapedSearch, $options: "i" } },
//         { altmobile: { $regex: escapedSearch, $options: "i" } }
//       );

//       if (!isNaN(search)) {
//         searchConditions.push(
//           { sl: parseInt(search) },
//           { weight: parseFloat(search) },
//           { cod: parseFloat(search) },
//           { insval: parseFloat(search) },
//           { l: parseFloat(search) },
//           { b: parseFloat(search) },
//           { h: parseFloat(search) }
//         );
//       }

//       const searchDate = new Date(search);

//       if (!isNaN(searchDate)) {
//         searchConditions.push({
//           date: {
//             $gte: new Date(searchDate.setHours(0, 0, 0)),
//             $lt: new Date(searchDate.setHours(23, 59, 59))
//           }
//         });
//       }
//     }

//     if (startDate && endDate) {
//       const start = new Date(startDate).setHours(0, 0, 0, 0);
//       const end = new Date(endDate).setHours(23, 59, 59, 999);
//       if (!isNaN(start) && !isNaN(end)) {
//         searchConditions.push({
//           date: {
//             $gte: new Date(start),
//             $lte: new Date(end)
//           }
//         });
//       }
//     }

//     if (searchConditions.length > 0) {
//       dataQuery = dataQuery.find({ $or: searchConditions });
//     }

//     const totalData = await ReturnAndPendingData.countDocuments(dataQuery.getFilter());
//     const data = await dataQuery.skip((page - 1) * limit).limit(limit).exec();

//     res.status(200).json({
//       totalData,
//       totalPages: Math.ceil(totalData / limit),
//       currentPage: page,
//       data
//     });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };





