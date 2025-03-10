const BookingData = require('../models/bookingFileModel');
const PendingOrder = require('../models/pendingOrderModel');
const { Setting } = require("../models/settingpageModel");
const cron = require('node-cron');
//latest code 
// const moveOldOrdersToPending = async () => {
//     try {
//         const settings = await Setting.findOne();

//         if (!settings) {
//             console.log('Settings document not found.');
//             return;
//         }

//         // Extract the MaxPendingDelay value from the settings document
//         const maxPendingDelay = settings.MaxPendingDelay;
//         console.log("day", maxPendingDelay);

//         // Calculate the cutoff date
//         const currentDate = new Date();
//         const cutoffDate = new Date(currentDate);
//         cutoffDate.setDate(cutoffDate.getDate() - (maxPendingDelay - 1));
//         cutoffDate.setHours(0, 0, 0, 0);  // Set time to 00:00:00.000
//         console.log("date", cutoffDate);

//         // Convert cutoffDate to ISO string to compare dates without time
//         const cutoffDateISO = cutoffDate.toISOString().split('T')[0];
//         console.log("ISO date", cutoffDateISO);

//         // Find orders with the same date (ignoring time)
//         const oldOrders = await BookingData.find({
//             date: {
//                 $gte: new Date(cutoffDateISO + "T00:00:00.000Z"),
//                 $lt: new Date(cutoffDateISO + "T23:59:59.999Z")
//                 // $gte: cutoffDate,
//                 // $lte: cutoffDate
//             }
//         });


//         if (oldOrders.length === 0) {
//             console.log('No old orders found to move.');
//             return;
//         }

//         // Update status to 'Pending' and save updated data back to BookingData
//         const updatedOldOrders = await Promise.all(
//             oldOrders.map(async (order) => {
//                 order.status = "Pending";
//                 await order.save();
//                 const { _id, __v, ...rest } = order.toObject(); // Convert Mongoose document to plain object and remove _id and __v
//                 return rest;
//             })
//         );



//         // Move updated old orders to the PendingOrder collection
//         await PendingOrder.insertMany(updatedOldOrders, { ordered: false });
//         console.log(`${updatedOldOrders.length} Old orders moved to pendingOrders collection.`);
//     } catch (error) {
//         if (error.code === 11000 && error.keyPattern && error.keyPattern._id) {
//             console.log('Duplicate key error: Skipping duplicate entries.');
//         } else {
//             console.error('Error moving old orders:', error);
//             throw error; // Re-throw the error to propagate it to the caller
//         }
//     }
// };







// const moveOldOrdersToPending = async () => {
//     try {
//         const settings = await Setting.findOne();

//         if (!settings) {
//             console.log('Settings document not found.');
//             return;
//         }

//         // Extract the MaxPendingDelay value from the settings document
//         const maxPendingDelay = settings.MaxPendingDelay;
//         console.log("day", maxPendingDelay);

//         // Calculate the cutoff date
//         const currentDate = new Date();
//         const cutoffDate = new Date(currentDate);
//         cutoffDate.setDate(cutoffDate.getDate() - maxPendingDelay);
//         cutoffDate.setHours(0, 0, 0, 0);  // Set time to 00:00:00.000
//         console.log("date", cutoffDate);

//         // Convert cutoffDate to ISO string to compare dates without time
//         const cutoffDateISO = cutoffDate.toISOString().split('T')[0];
//         console.log("ISO date", cutoffDateISO);

//         // Find orders older than the cutoff date and not already moved to Pending
//         const oldOrders = await BookingData.find({
//             date: { $lt: new Date(cutoffDateISO + "T00:00:00.000Z") },
//             status: 'Processing',
//             movedToPending: { $ne: true }  // Only pick orders that haven't been moved yet
//         });

//         if (oldOrders.length === 0) {
//             console.log('No old orders found to move.');
//             return;
//         }

//         console.log(`${oldOrders.length} old orders found to move.`);

//         // Update status to 'Pending' and mark as moved
//         const updatedOldOrders = oldOrders.map((order) => {
//             order.status = "Pending";
//             order.movedToPending = true; // Mark as moved
//             return { ...order.toObject(), movedAt: new Date() }; // Prepare the order for insertion
//         });

//         // Move updated old orders to the PendingOrder collection
//         await PendingOrder.insertMany(updatedOldOrders, { ordered: false });
//         console.log(`${updatedOldOrders.length} old orders moved to PendingOrder collection.`);

//         // Update the original orders in BookingData
//         await BookingData.updateMany(
//             { _id: { $in: oldOrders.map(order => order._id) } },
//             { $set: { status: 'Pending', movedToPending: true } }
//         );

//     } catch (error) {
//         if (error.code === 11000) {
//             console.log('Duplicate key error: Skipping duplicate entries.');
//         } else {
//             console.error('Error moving old orders:', error);
//             throw error; // Re-throw the error to propagate it to the caller
//         }
//     }
// };



// if status is Completed then remove order from pending 
// const moveOldOrdersToPending = async () => {
//     try {
//         const settings = await Setting.findOne();

//         if (!settings) {
//             console.log('Settings document not found.');
//             return;
//         }

//         // Extract the MaxPendingDelay value from the settings document
//         const maxPendingDelay = settings.MaxPendingDelay;
//         console.log("day", maxPendingDelay);

//         // Calculate the cutoff date
//         const currentDate = new Date();
//         const cutoffDate = new Date(currentDate);
//         cutoffDate.setDate(cutoffDate.getDate() - maxPendingDelay);
//         cutoffDate.setHours(0, 0, 0, 0);  // Set time to 00:00:00.000
//         console.log("date", cutoffDate);

//         // Convert cutoffDate to ISO string to compare dates without time
//         const cutoffDateISO = cutoffDate.toISOString().split('T')[0];
//         console.log("ISO date", cutoffDateISO);

//         // Find orders older than the cutoff date and not already moved to Pending
//         const oldOrders = await BookingData.find({
//             date: { $lt: new Date(cutoffDateISO + "T00:00:00.000Z") },
//             status: 'Processing',
//             movedToPending: { $ne: true }  // Only pick orders that haven't been moved yet
//         });

//         if (oldOrders.length === 0) {
//             console.log('No old orders found to move.');
//             return;
//         }

//         console.log(`${oldOrders.length} old orders found to move.`);

//         // Update status to 'Pending' and mark as moved
//         const updatedOldOrders = oldOrders.map((order) => {
//             order.status = "Pending";
//             order.movedToPending = true; // Mark as moved
//             return { ...order.toObject(), movedAt: new Date() }; // Prepare the order for insertion
//         });

//         // Move updated old orders to the PendingOrder collection
//         await PendingOrder.insertMany(updatedOldOrders, { ordered: false });
//         console.log(`${updatedOldOrders.length} old orders moved to PendingOrder collection.`);

//         // Update the original orders in BookingData
//         await BookingData.updateMany(
//             { _id: { $in: oldOrders.map(order => order._id) } },
//             { $set: { status: 'Pending', movedToPending: true } }
//         );

//         // Now check if any orders in PendingOrder are marked as completed in BookingData
//         const pendingOrders = await PendingOrder.find({});
//         const completedOrders = [];

//         for (const pendingOrder of pendingOrders) {
//             const bookingOrder = await BookingData.findOne({ _id: pendingOrder._id });

//             if (bookingOrder && bookingOrder.status === 'Completed') {
//                 completedOrders.push(pendingOrder._id); // Collect orders to be removed
//             }
//         }

//         if (completedOrders.length > 0) {
//             // Remove completed orders from PendingOrder collection
//             await PendingOrder.deleteMany({ _id: { $in: completedOrders } });
//             console.log(`${completedOrders.length} completed orders removed from PendingOrder collection.`);
//         } else {
//             console.log('No completed orders found to remove.');
//         }

//     } catch (error) {
//         if (error.code === 11000) {
//             console.log('Duplicate key error: Skipping duplicate entries.');
//         } else {
//             console.error('Error moving old orders:', error);
//             throw error; // Re-throw the error to propagate it to the caller
//         }
//     }
// };


//latest code
const moveOldOrdersToPending = async () => {
    try {
        const settings = await Setting.findOne();

        if (!settings) {
            console.log('Settings document not found.');
            return;
        }

        // Extract the MaxPendingDelay value from the settings document
        const maxPendingDelay = settings.MaxPendingDelay;
        console.log("day", maxPendingDelay);

        // Calculate the cutoff date
        const currentDate = new Date();
        const cutoffDate = new Date(currentDate);
        cutoffDate.setDate(cutoffDate.getDate() - maxPendingDelay);
        cutoffDate.setHours(0, 0, 0, 0);  // Set time to 00:00:00.000
        console.log("date", cutoffDate);

        // Convert cutoffDate to ISO string to compare dates without time
        const cutoffDateISO = cutoffDate.toISOString().split('T')[0];
        console.log("ISO date", cutoffDateISO);

        // Find orders older than the cutoff date and not already moved to Pending
        const oldOrders = await BookingData.find({
            date: { $lt: new Date(cutoffDateISO + "T00:00:00.000Z") },
            status: 'Processing',
            movedToPending: { $ne: true }  // Only pick orders that haven't been moved yet
        });

        if (oldOrders.length === 0) {
            console.log('No old orders found to move.');
            // If no old orders found, proceed to check for completed orders in PendingOrder
            await checkAndRemoveCompletedOrders();
            return;
        }

        console.log(`${oldOrders.length} old orders found to move.`);

        // Update status to 'Pending' and mark as moved
        const updatedOldOrders = oldOrders.map((order) => {
            order.status = "Pending";
            order.movedToPending = true; // Mark as moved
            return { ...order.toObject(), movedAt: new Date() }; // Prepare the order for insertion
        });

        // Move updated old orders to the PendingOrder collection
        await PendingOrder.insertMany(updatedOldOrders, { ordered: false });
        console.log(`${updatedOldOrders.length} old orders moved to PendingOrder collection.`);

        // Update the original orders in BookingData
        await BookingData.updateMany(
            { _id: { $in: oldOrders.map(order => order._id) } },
            { $set: { status: 'Pending', movedToPending: true } }
        );
 
        // After moving, still check for completed orders in PendingOrder

    } catch (error) {
        if (error.code === 11000) {
            console.log('Duplicate key error: Skipping duplicate entries.');
        } else {
            console.error('Error moving old orders:', error);
            throw error; // Re-throw the error to propagate it to the caller
        }
    }
};





//call only one time in a day
const checkAndRemoveCompletedOrders = async () => {
    try {
        const batchSize = 15000; // Number of records to process in each batch
        const totalPendingOrders = await PendingOrder.countDocuments(); // Count total pending orders
        let processedCount = 0; // Keep track of how many records have been processed

        while (processedCount < totalPendingOrders) {
            // Retrieve the next batch of pending orders with only necessary fields
            const pendingOrders = await PendingOrder.find({}, { _id: 1 })
                .skip(processedCount)
                .limit(batchSize)
                .lean(); // Use lean() for faster read performance

            // Fetch corresponding booking orders with 'Completed' or 'Returned' status
            const bookingOrders = await BookingData.find({
                _id: { $in: pendingOrders.map(pendingOrder => pendingOrder._id) },
                status: { $in: ['Completed', 'Returned'] }
            }, { _id: 1 }).lean();

            const completedOrderIds = bookingOrders.map(order => order._id);

            // Remove completed orders from PendingOrder collection if any found
            if (completedOrderIds.length > 0) {
                await PendingOrder.deleteMany({ _id: { $in: completedOrderIds } });
                console.log(`${completedOrderIds.length} completed orders removed from PendingOrder collection.`);
            } else {
                // No completed orders found, stop further processing
                console.log('No completed orders found to remove in this batch.');
                break; // Exit the while loop if no completed orders are found
            }

            // Update the processed count
            processedCount += pendingOrders.length;

            // Show message for the current batch processed
            console.log(`Processed ${pendingOrders.length} orders. Total processed: ${processedCount} of ${totalPendingOrders}.`);
        }

        console.log('Finished processing pending orders.');
    } catch (error) {
        console.error('Error checking and removing completed orders:', error);
        throw error; // Re-throw error to propagate it to the caller
    }
};

// Schedule the job to run at 2:00 AM every day
cron.schedule('0 2 * * *', async () => {
    console.log('Running the scheduled task: check and remove completed orders.');
    await checkAndRemoveCompletedOrders();
}, {
    scheduled: true,
    timezone: 'Etc/UTC'  // Changed from UTC to Etc/UTC
});





const getDuplicateBarcodeNumbers = async (req, res) => {

    try {
      let duplicates;
  
      
      // Check user role
      if (req.user.role === 'admin') {
        // Admin can check for duplicates in all data
        duplicates = await PendingOrder.aggregate([
          { $group: { _id: "$barcode", count: { $sum: 1 } } },
          { $match: { count: { $gt: 1 } } },
          { $project: { _id: 1 } }
        ]);
      } else if (req.user.role === 'branchAdmin' || req.user.role === 'employee') {
        // Branch Admin and Employee can check for duplicates within their branch
        const branch = req.user.branch; // Assuming branch information is stored in req.user
        duplicates = await PendingOrder.aggregate([
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








// 500data check
// const checkAndRemoveCompletedOrders = async () => {
//     try {
//         const batchSize = 15000; // Number of records to process in each batch
//         const totalPendingOrders = await PendingOrder.countDocuments(); // Count total pending orders
//         let processedCount = 0; // Keep track of how many records have been processed

//         while (processedCount < totalPendingOrders) {
//             // Retrieve the next batch of pending orders
//             const pendingOrders = await PendingOrder.find({})
//                 .skip(processedCount) // Skip already processed records
//                 .limit(batchSize); // Limit to the batch size

//             const completedOrders = [];

//             for (const pendingOrder of pendingOrders) {
//                 // Find corresponding booking order
//                 const bookingOrder = await BookingData.findOne({ _id: pendingOrder._id });

//                 if (bookingOrder && bookingOrder.status === 'Completed') {
//                     completedOrders.push(pendingOrder._id); // Collect orders to be removed
//                 }
//             }

//             // Remove completed orders from PendingOrder collection if any found
//             if (completedOrders.length > 0) {
//                 await PendingOrder.deleteMany({ _id: { $in: completedOrders } });
//                 console.log(`${completedOrders.length} completed orders removed from PendingOrder collection.`);
//             } else {
//                 console.log('No completed orders found to remove in this batch.');
//             }

//             // Update the processed count
//             processedCount += pendingOrders.length;

//             // Show message for the current batch processed
//             console.log(`Processed ${pendingOrders.length} orders. Total processed: ${processedCount} of ${totalPendingOrders}.`);

//             // Wait for 3 seconds before processing the next batch
//             await new Promise(resolve => setTimeout(resolve, 3000));
//         }

//         console.log('All pending orders have been checked and processed.');
//     } catch (error) {
//         console.error('Error checking and removing completed orders:', error);
//         throw error; // Re-throw error to propagate it to the caller
//     }
// };




// Function to check and remove completed orders from PendingOrder
// const checkAndRemoveCompletedOrders = async () => {
//     try {
//         // Retrieve all pending orders
//         const pendingOrders = await PendingOrder.find({});
//         const completedOrders = [];

//         for (const pendingOrder of pendingOrders) {
//             // Find corresponding booking order
//             const bookingOrder = await BookingData.findOne({ _id: pendingOrder._id });
 
//             if (bookingOrder && bookingOrder.status === 'Completed') {
//                 completedOrders.push(pendingOrder._id); // Collect orders to be removed
//             }
//         }  

//         if (completedOrders.length > 0) { 
//             // Remove completed orders from PendingOrder collection
//             await PendingOrder.deleteMany({ _id: { $in: completedOrders } });
//             console.log(`${completedOrders.length} completed orders removed from PendingOrder collection.`);
//         } else {
//             console.log('No completed orders found to remove.');
//         }
//     } catch (error) {
//         console.error('Error checking and removing completed orders:', error);
//         throw error; // Re-throw error to propagate it to the caller
//     }
// };
   



  

// const moveOldOrdersToPending = async () => {
//     try {
//         const settings = await Setting.findOne();

//         if (!settings) {
//             console.log('Settings document not found.');
//             return;
//         }

//         // Extract the MaxPendingDelay value from the settings document
//         const maxPendingDelay = settings.MaxPendingDelay;
//         console.log("day", maxPendingDelay);

//         // Calculate the cutoff date
//         const currentDate = new Date();
//         const cutoffDate = new Date(currentDate);
//         cutoffDate.setDate(cutoffDate.getDate() - (maxPendingDelay - 1));
//         cutoffDate.setHours(0, 0, 0, 0);  // Set time to 00:00:00.000
//         console.log("date", cutoffDate);

//         // Convert cutoffDate to ISO string to compare dates without time
//         const cutoffDateISO = cutoffDate.toISOString().split('T')[0];
//         console.log("ISO date", cutoffDateISO);

//         // Find orders with the same date (ignoring time)
//         const oldOrders = await BookingData.find({
//             date: {
//                 $gte: new Date(cutoffDateISO + "T00:00:00.000Z"),
//                 $lt: new Date(cutoffDateISO + "T23:59:59.999Z")
//             }
//         });
//         console.log("first", oldOrders);

//         if (oldOrders.length === 0) {
//             console.log('No old orders found to move.');
//             return;
//         }

//         // Move old orders to the PendingOrder collection
//         await PendingOrder.insertMany(oldOrders, { ordered: false });
//         console.log('Old orders moved to pendingOrders collection.');
//     } catch (error) {
//         if (error.code === 11000 && error.keyPattern && error.keyPattern._id) {
//             console.log('Duplicate key error: Skipping duplicate entries.');
//         } else {
//             console.error('Error moving old orders:', error);
//             throw error; // Re-throw the error to propagate it to the caller
//         }
//     }
// };

const getAllpendingOrder = async (req, res) => {
    try {
        let allData;
        let totalData;
        // Check user role
        if (req.user.role === 'admin') {
            // Admin can access all data
            allData = await PendingOrder.find();
            totalData = await PendingOrder.countDocuments();
        } else if (req.user.role === 'branchAdmin' || req.user.role === 'employee') {
            // Branch Admin and Employee can access data within their branch
            const branch = req.user.branch; // Assuming branch information is stored in req.user
            allData = await PendingOrder.find({ branch: branch });
            totalData = await PendingOrder.countDocuments({ branch: branch });
        } else {
            // Other roles are not authorized to access data
            return res.status(403).json({ error: 'Access denied. Unauthorized role.' });
        }
        // Send success response
        res.status(200).json({ totalData, pendingOrders: allData });
    } catch (err) {
        // Send error response
        res.status(400).json({ error: err.message });
    }
};

// const updatePendingOrderById = async (req, res) => {
//     try {
//         // Check if the user has the 'admin' role
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied. Only admins can insert data.' });
//         }

//         const data = await PendingOrder.findByIdAndUpdate(req.params.id, req.body,
//             { new: true, runValidators: true });
//         if (!data) {
//             return res.status(404).json({ message: 'Data not found' });
//         }
//         res.status(200).json({ message: 'Data Update successfully', data });
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// };



const updatePendingOrderById = async (req, res) => {
    try {
        // Check if the user has the 'admin' role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Only admins can update data.' });
        }

        const data = await PendingOrder.findByIdAndUpdate(req.params.id, req.body, {
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


const deletePendingOrderById = async (req, res) => {
    try {
        // Check if the user has the 'admin' role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Only admins can insert data.' });
        }
        const Id = req.params.id
        const data = await PendingOrder.findByIdAndDelete(Id);
        if (!data) {
            return res.status(404).json({ message: 'Data not found' });
        }
        res.status(200).json({ message: 'Data deleted successfully', data });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const deleteMultiplePendingOrder = async (req, res) => {

    try {
        // Check if the user has the 'admin' role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Only admins can insert data.' });
        }
        const ids = req.body.ids;

        if (!Array.isArray(ids)) {
            return res.status(400).json({ error: 'IDs should be an array of strings' });
        }

        const foundDocuments = await PendingOrder.find({ _id: { $in: ids } });

        if (foundDocuments.length !== ids.length) {
            const foundIds = foundDocuments.map(doc => doc._id.toString());
            const notFoundIds = ids.filter(id => !foundIds.includes(id));
            return res.status(404).json({ error: 'Some IDs were not found', notFoundIds });
        }

        const result = await PendingOrder.deleteMany({ _id: { $in: ids } });
        res.status(200).json({ message: 'Data deleted successfully', deletedCount: result.deletedCount, deletedData: foundDocuments });
    } catch (err) {

        res.status(400).json({ error: err.message });
    }
};

const getPaginatedPendingData = async (req, res) => {
    try {
        let { page, limit, search, startDate, endDate, filterByDuplicateBarcode, filterByUnknownBarcode } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        search = search ? search.trim() : "";
      filterByDuplicateBarcode = filterByDuplicateBarcode === 'true';
      filterByUnknownBarcode = filterByUnknownBarcode === 'true';


        let dataQuery;

        if (req.user.role === 'admin') {
            // Admin can access all data
            dataQuery = PendingOrder.find();
        } else if (req.user.role === 'branchAdmin' || req.user.role === 'employee') {
            // Branch Admin and Employee can access data within their branch
            dataQuery = PendingOrder.find({ branch: req.user.branch });
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
    let totalSameDuplicateNumbers = 0;
    if (filterByDuplicateBarcode) {
        const barcodeCounts = await PendingOrder.aggregate([
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
        const unknownBarcodes = await PendingOrder.find({
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



        const totalData = await PendingOrder.countDocuments(dataQuery.getFilter());
        const data = await dataQuery.skip((page - 1) * limit).limit(limit).exec();

await moveOldOrdersToPending();
await checkAndRemoveCompletedOrders();



        res.status(200).json({
            totalData,
            totalPages: Math.ceil(totalData / limit),
            currentPage: page,
            data,
            totalSameDuplicateNumbers,
            filterByUnknownBarcode, 
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


// const getPaginatedPendingData = async (req, res) => {
//     try {
//         let { page, limit, search, startDate, endDate } = req.query;
//         page = parseInt(page) || 1;
//         limit = parseInt(limit) || 10;
//         search = search ? search.trim() : "";

//         let dataQuery;

//         if (req.user.role === 'admin') {
//             // Admin can access all data
//             dataQuery = PendingOrder.find();
//         } else if (req.user.role === 'branchAdmin' || req.user.role === 'employee') {
//             // Branch Admin and Employee can access data within their branch
//             dataQuery = PendingOrder.find({ branch: req.user.branch });
//         } else {
//             return res.status(403).json({ message: 'Access denied. Unauthorized role.' });
//         }

//         const searchConditions = [];

//         if (search) {
//             // Convert spaces to plus signs for barcode search
//             const formattedSearch = search.replace(/ /g, '+');

//             // Exact match for the barcode field
//             searchConditions.push({ barcode: formattedSearch });

//             // For other fields, use regex with escaped characters
//             const escapeRegex = (string) => {
//                 return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
//             };
//             const escapedSearch = escapeRegex(search);

//             searchConditions.push(
//                 { ref: { $regex: escapedSearch, $options: "i" } },
//                 { city: { $regex: escapedSearch, $options: "i" } },
//                 { pincode: { $regex: escapedSearch, $options: "i" } },
//                 { name: { $regex: escapedSearch, $options: "i" } },
//                 { add1: { $regex: escapedSearch, $options: "i" } },
//                 { add2: { $regex: escapedSearch, $options: "i" } },
//                 { add3: { $regex: escapedSearch, $options: "i" } },
//                 { addremail: { $regex: escapedSearch, $options: "i" } },
//                 { addrmobile: { $regex: escapedSearch, $options: "i" } },
//                 { sendermobile: { $regex: escapedSearch, $options: "i" } },
//                 { cr: { $regex: escapedSearch, $options: "i" } },
//                 { branch: { $regex: escapedSearch, $options: "i" } },
//                 { status: { $regex: escapedSearch, $options: "i" } },
//                 { vpp: { $regex: escapedSearch, $options: "i" } },
//                 { contenttype: { $regex: escapedSearch, $options: "i" } },
//                 { priority: { $regex: escapedSearch, $options: "i" } },
//                 { typing: { $regex: escapedSearch, $options: "i" } },
//                 { altmobile: { $regex: escapedSearch, $options: "i" } }
//             );

//             if (!isNaN(search)) {
//                 searchConditions.push(
//                     { sl: parseInt(search) },
//                     { weight: parseFloat(search) },
//                     { cod: parseFloat(search) },
//                     { insval: parseFloat(search) },
//                     { l: parseFloat(search) },
//                     { b: parseFloat(search) },
//                     { h: parseFloat(search) }
//                 );
//             }

//             const searchDate = new Date(search);

//             if (!isNaN(searchDate)) {
//                 searchConditions.push({
//                     date: {
//                         $gte: new Date(searchDate.setHours(0, 0, 0)),
//                         $lt: new Date(searchDate.setHours(23, 59, 59))
//                     }
//                 });
//             }
//         }

//         if (startDate && endDate) {
//             const start = new Date(startDate).setHours(0, 0, 0, 0);
//             const end = new Date(endDate).setHours(23, 59, 59, 999);
//             if (!isNaN(start) && !isNaN(end)) {
//                 searchConditions.push({
//                     date: {
//                         $gte: new Date(start),
//                         $lte: new Date(end)
//                     }
//                 });
//             }
//         }

//         if (searchConditions.length > 0) {
//             dataQuery = dataQuery.find({ $or: searchConditions });
//         }

//         const totalData = await PendingOrder.countDocuments(dataQuery.getFilter());
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

module.exports = {
    moveOldOrdersToPending,
    getAllpendingOrder,
    updatePendingOrderById,
    
    deletePendingOrderById,
    getDuplicateBarcodeNumbers,
    deleteMultiplePendingOrder,
    getPaginatedPendingData,
};
