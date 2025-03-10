const Branch = require('../models/branchModel');
const BookingData = require('../models/bookingFileModel');
const PaymentData = require('../models/paymentFileModel');
const UserPaymentData = require('../models/userPaymentDataModel');
const PendingOrder = require('../models/pendingOrderModel');
const ReturnAndPendingData = require('../models/ReturnAndPendingFileModel');
const User = require("../models/userModel");


// Controller function to get match counts
// exports.getMatchCounts = async (req, res) => {
//     try {
//         const bookingdata = await BookingData.aggregate([
//             {
//                 $lookup: {
//                     from: 'paymentdatas',
//                     localField: 'barcode',
//                     foreignField: 'article_number',
//                     as: 'paymentMatches'
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'pendingorders',
//                     let: { barcode: '$barcode' }, // Use `let` to reference the local field in `$lookup`
//                     pipeline: [
//                         { $match: { $expr: { $eq: ['$barcode', '$$barcode'] } } }, // Match documents based on the local field
//                         { $match: { status: 'Pending' } } // Filter documents by status
//                     ],
//                     as: 'pendingMatches'
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'returnandpendingdatas',
//                     localField: 'barcode',
//                     foreignField: 'barcode',
//                     as: 'returnMatches'
//                 }
//             },
//             {
//                 $project: {
//                     paymentMatches: { $size: '$paymentMatches' },
//                     pendingMatches: { $size: '$pendingMatches' },
//                     returnMatches: { $size: '$returnMatches' }
//                 }
//             },
//             {
//                 $group: {
//                     _id: null, // Group specification must include an _id
//                     paymentCount: { $sum: { $cond: [{ $gt: ['$paymentMatches', 0] }, 1, 0] } },
//                     pendingOrderCount: { $sum: { $cond: [{ $gt: ['$pendingMatches', 0] }, 1, 0] } },
//                     returnOrderCount: { $sum: { $cond: [{ $gt: ['$returnMatches', 0] }, 1, 0] } }
//                 }
//             }
//         ]);

//         res.status(200).json(bookingdata[0] || {
//             paymentCount: 0,
//             returnOrderCount: 0,
//             pendingOrderCount: 0
//         });
//     } catch (error) {
//         console.error('Error fetching data:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };





exports.getMatchCounts = async (req, res) => {
    try {
        const bookingdata = await BookingData.aggregate([
            {
                $lookup: {
                    from: 'paymentdatas',
                    localField: 'barcode',
                    foreignField: 'article_number',
                    as: 'paymentMatches'
                }
            },
            {
                $lookup: {
                    from: 'pendingorders',
                    localField: 'barcode',
                    foreignField: 'barcode',
                    as: 'pendingMatches'
                }
            },
            {
                $lookup: {
                    from: 'returnandpendingdatas',
                    localField: 'barcode',
                    foreignField: 'barcode',
                    as: 'returnMatches'
                }
            },
            {
                $project: {
                    paymentMatches: { $size: '$paymentMatches' },
                    pendingMatches: { $size: '$pendingMatches' },
                    returnMatches: { $size: '$returnMatches' }
                }
            },
            {
                $group: {
                    _id: null,
                    paymentCount: { $sum: { $cond: [{ $gt: ['$paymentMatches', 0] }, 1, 0] } },
                    pendingOrderCount: { $sum: { $cond: [{ $gt: ['$pendingMatches', 0] }, 1, 0] } },
                    returnOrderCount: { $sum: { $cond: [{ $gt: ['$returnMatches', 0] }, 1, 0] } }
                }
            }
        ]);

        console.log('Booking Data:', bookingdata); // Debugging
        res.status(200).json(bookingdata[0] || {
            paymentCount: 0,
            returnOrderCount: 0,
            pendingOrderCount: 0
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};














exports.getOrderStatistics = async (req, res) => {
    try {
        let { startDate, endDate } = req.query;

        let start = startDate ? new Date(startDate) : undefined;
        let end = endDate ? new Date(endDate) : undefined;
        if (end) end.setHours(23, 59, 59, 999);

        const branches = await Branch.find().lean();
        const branchNames = branches.map(branch => branch.branchName.toLowerCase());

        const matchDate = start && end ? { date: { $gte: start, $lte: end } } : {};
        const matchPaymentDate = start && end ? { payment_date: { $gte: start, $lte: end } } : {};

        // Aggregation with normalized branch names
        const [bookingDataAgg, paymentDataAgg, pendingOrderAgg, returnAndPendingDataAgg] = await Promise.all([
            BookingData.aggregate([
                { $addFields: { branch: { $trim: { input: "$branch" } } } },
                { $match: matchDate },
                { $group: { _id: "$branch", totalOrders: { $sum: 1 }, todaysOrders: { $sum: { $cond: [{ $eq: [{ $dayOfYear: "$date" }, { $dayOfYear: new Date() }] }, 1, 0] } } } }
            ]),
            PaymentData.aggregate([
                { $addFields: { branch: { $trim: { input: "$branch" } } } },
                { $match: matchPaymentDate },
                { $group: { _id: "$branch", totalRevenue: { $sum: "$net_payable" }, paymentCount: { $sum: 1 } } }
            ]),
            PendingOrder.aggregate([
                { $addFields: { branch: { $trim: { input: "$branch" } } } },
                { $match: matchDate },
                { $group: { _id: "$branch", pendingOrderCount: { $sum: 1 } } }
            ]),
            ReturnAndPendingData.aggregate([
                { $addFields: { branch: { $trim: { input: "$branch" } } } },
                { $match: matchDate },
                { $group: { _id: "$branch", returnAndPendingCount: { $sum: 1 } } }
            ])
        ]);

        const branchStatistics = branches.map(branch => {
            let branchName = branch.branchName.toLowerCase();

            let bookingData = bookingDataAgg.find(data => data._id?.toLowerCase() === branchName) || { totalOrders: 0, todaysOrders: 0 };
            let paymentData = paymentDataAgg.find(data => data._id?.toLowerCase() === branchName) || { totalRevenue: 0, paymentCount: 0 };
            let pendingOrderData = pendingOrderAgg.find(data => data._id?.toLowerCase() === branchName) || { pendingOrderCount: 0 };
            let returnAndPendingData = returnAndPendingDataAgg.find(data => data._id?.toLowerCase() === branchName) || { returnAndPendingCount: 0 };

            return {
                branchId: branch._id,
                branchName: branchName,
                totalRevenue: paymentData.totalRevenue,
                totalOrdersCount: bookingData.totalOrders,
                paymentDataCount: paymentData.paymentCount,
                returnAndPendingDataCount: returnAndPendingData.returnAndPendingCount,
                pendingOrderCount: pendingOrderData.pendingOrderCount,
                todaysOrdersCount: bookingData.todaysOrders
            };
        });

        let aggregatedStatistics = {
            totalRevenue: 0,
            totalOrdersCount: 0,
            paymentDataCount: 0,
            returnAndPendingDataCount: 0,
            pendingOrderCount: 0,
            todaysOrdersCount: 0
        };

        branchStatistics.forEach(stat => {
            aggregatedStatistics.totalRevenue += stat.totalRevenue;
            aggregatedStatistics.totalOrdersCount += stat.totalOrdersCount;
            aggregatedStatistics.paymentDataCount += stat.paymentDataCount;
            aggregatedStatistics.returnAndPendingDataCount += stat.returnAndPendingDataCount;
            aggregatedStatistics.pendingOrderCount += stat.pendingOrderCount;
            aggregatedStatistics.todaysOrdersCount += stat.todaysOrdersCount;
        });

        res.status(200).json({
            branchStatistics: branchStatistics,
            combinedStatistics: aggregatedStatistics
        });
    } catch (error) {
        console.error('Error fetching branch statistics:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


exports.getEmployeeStatistics = async (req, res) => {
    try {
        let { startDate, endDate } = req.query;

        // Parse dates if provided, otherwise leave them undefined
        let start = startDate ? new Date(startDate) : undefined;
        let end = endDate ? new Date(endDate) : undefined;
        if (end) end.setHours(23, 59, 59, 999); // Set time to the end of the day if endDate is provided

        // Get all employees
        const employees = await User.find({ role: 'employee' });

        const matchDate = start && end ? { date: { $gte: start, $lte: end } } : {};

        const bookingDataAgg = await BookingData.aggregate([
            { $match: matchDate },
            { $addFields: { cr: { $trim: { input: "$cr" } } } },
            { 
                $group: { 
                    _id: "$cr", 
                    totalOrders: { $sum: 1 }
                } 
            }
        ]);

        const paymentDataAgg = await UserPaymentData.aggregate([
            { $match: matchDate },
            { $addFields: { cr: { $trim: { input: "$cr" } } } },
            { 
                $group: { 
                    _id: "$cr", 
                    totalRevenue: { $sum: "$cod" },
                    paymentDataCount: { $sum: 1 }
                } 
            }
        ]);

        const returnAndPendingDataAgg = await ReturnAndPendingData.aggregate([
            { $match: matchDate },
            { $addFields: { cr: { $trim: { input: "$cr" } } } },
            { 
                $group: { 
                    _id: "$cr", 
                    returnAndPendingDataCount: { $sum: 1 }
                } 
            }
        ]);

        const pendingOrderAgg = await PendingOrder.aggregate([
            { $match: matchDate },
            { $addFields: { cr: { $trim: { input: "$cr" } } } },
            { 
                $group: { 
                    _id: "$cr", 
                    pendingOrderCount: { $sum: 1 }
                } 
            }
        ]);

        const allEmployeeData = employees.map(employee => {
            const username = employee.username ? employee.username.trim().toLowerCase() : '';

            const bookingData = bookingDataAgg.find(data => data._id?.trim().toLowerCase() === username) || { totalOrders: 0 };
            const paymentData = paymentDataAgg.find(data => data._id?.trim().toLowerCase() === username) || { totalRevenue: 0, paymentDataCount: 0 };
            const returnAndPendingData = returnAndPendingDataAgg.find(data => data._id?.trim().toLowerCase() === username) || { returnAndPendingDataCount: 0 };
            const pendingOrder = pendingOrderAgg.find(data => data._id?.trim().toLowerCase() === username) || { pendingOrderCount: 0 };

            return {
                username,
                totalRevenue: paymentData.totalRevenue,
                totalOrdersCount: bookingData.totalOrders,
                paymentDataCount: paymentData.paymentDataCount,
                returnAndPendingDataCount: returnAndPendingData.returnAndPendingDataCount,
                pendingOrderCount: pendingOrder.pendingOrderCount,
            };
        });

        // Calculate aggregated statistics for all employees
        const aggregatedEmployeeStatistics = allEmployeeData.reduce((acc, stat) => {
            acc.totalRevenue += stat.totalRevenue;
            acc.totalOrdersCount += stat.totalOrdersCount;
            acc.paymentDataCount += stat.paymentDataCount;
            acc.returnAndPendingDataCount += stat.returnAndPendingDataCount;
            acc.pendingOrderCount += stat.pendingOrderCount;

            return acc;
        }, {
            totalRevenue: 0,
            totalOrdersCount: 0,
            paymentDataCount: 0,
            returnAndPendingDataCount: 0,
            pendingOrderCount: 0,
        });

        res.status(200).json({
            allEmployeeData: allEmployeeData,
            aggregatedEmployeeStatistics: aggregatedEmployeeStatistics,
        });
    } catch (error) {
        console.error('Error fetching aggregated data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



// // Controller function to get match counts
// exports.getMatchCounts = async (req, res) => {
//     try {
//         // Fetch other datasets for match counts
//         const bookingdata = await BookingData.find({});
//         const paymentdata = await PaymentData.find({});
//         const pendingOrder = await PendingOrder.find({});
//         const returnAndPendingData = await ReturnAndPendingData.find({});

//         // Calculate the counts using the fetched data
//         const paymentCount = bookingdata.filter(booking =>
//             paymentdata.some(payment => payment.article_number === booking.barcode)
//         ).length;

//         const returnOrderCount = bookingdata.filter(booking =>
//             returnAndPendingData.some(item => item.barcode === booking.barcode)
//         ).length;

//         const pendingOrderCount = bookingdata.filter(booking =>
//             pendingOrder.some(item => item.barcode === booking.barcode)
//         ).length;

//         // Return the counts as JSON
//         res.status(200).json({
//             paymentCount,
//             returnOrderCount,
//             pendingOrderCount
//         });
//     } catch (error) {
//         console.error('Error fetching data:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };

// exports.getOrderStatistics = async (req, res) => {
//     try {
//         let { startDate, endDate } = req.query;

//         console.log("first", startDate, endDate)

//         // Parse dates if provided, otherwise leave them undefined
//         let start = startDate ? new Date(startDate) : undefined;
//         let end = endDate ? new Date(endDate) : undefined;
//         if (end) end.setHours(23, 59, 59, 999); // Set time to the end of the day if endDate is provided

//         const branches = await Branch.find();

//         const bookingdata = start && end
//             ? await BookingData.find({ date: { $gte: start, $lte: end } })
//             : await BookingData.find();

//         const paymentdata = start && end
//             ? await PaymentData.find({ payment_date: { $gte: start, $lte: end } })
//             : await PaymentData.find();

//         const pendingOrder = start && end
//             ? await PendingOrder.find({ date: { $gte: start, $lte: end } })
//             : await PendingOrder.find();

//         const returnAndPendingData = start && end
//             ? await ReturnAndPendingData.find({ date: { $gte: start, $lte: end } })
//             : await ReturnAndPendingData.find();


//         let branchStatistics = branches.map(branch => {
//             let branchName = branch.branchName.toLowerCase(); // Assuming branch has a branchName field
//             let branchBookingData = bookingdata.filter(data => data.branch?.toLowerCase() === branchName);
//             let branchPaymentData = paymentdata.filter(data => data.branch?.toLowerCase() === branchName);
//             let branchPendingOrder = pendingOrder.filter(data => data.branch?.toLowerCase() === branchName);
//             let branchReturnAndPendingData = returnAndPendingData.filter(data => data.branch?.toLowerCase() === branchName);

//             let totalRevenue = branchPaymentData.reduce((sum, payment) => sum + payment.net_payable, 0);
//             let totalOrdersCount = branchBookingData.length;
//             let paymentDataCount = branchPaymentData.length;
//             let returnAndPendingDataCount = branchReturnAndPendingData.length;
//             let pendingOrderCount = branchPendingOrder.length;
//             let todaysOrdersCount = branchBookingData.filter(data => {
//                 let orderDate = new Date(data.date);
//                 orderDate.setHours(0, 0, 0, 0); // Set time to the start of the day

//                 // Adjust for timezone offset (example: UTC+3)
//                 orderDate.setHours(orderDate.getHours() + 3);

//                 let compareDate = start ? start : new Date();

//                 return orderDate.getFullYear() === compareDate.getFullYear() &&
//                     orderDate.getMonth() === compareDate.getMonth() &&
//                     orderDate.getDate() === compareDate.getDate();
//             }).length;

//             return {
//                 branchId: branch._id,
//                 branchName: branchName,
//                 totalRevenue: totalRevenue,
//                 totalOrdersCount: totalOrdersCount,
//                 paymentDataCount: paymentDataCount,
//                 returnAndPendingDataCount: returnAndPendingDataCount,
//                 pendingOrderCount: pendingOrderCount,
//                 todaysOrdersCount: todaysOrdersCount
//             };
//         });

//         // Calculate aggregated statistics for all branches
//         let aggregatedStatistics = {
//             totalRevenue: 0,
//             totalOrdersCount: 0,
//             paymentDataCount: 0,
//             returnAndPendingDataCount: 0,
//             pendingOrderCount: 0,
//             todaysOrdersCount: 0
//         };

//         branchStatistics.forEach(stat => {
//             aggregatedStatistics.totalRevenue += stat.totalRevenue;
//             aggregatedStatistics.totalOrdersCount += stat.totalOrdersCount;
//             aggregatedStatistics.paymentDataCount += stat.paymentDataCount;
//             aggregatedStatistics.returnAndPendingDataCount += stat.returnAndPendingDataCount;
//             aggregatedStatistics.pendingOrderCount += stat.pendingOrderCount;
//             aggregatedStatistics.todaysOrdersCount += stat.todaysOrdersCount;
//         });

//         res.status(200).json({
//             branchStatistics: branchStatistics,
//             combinedStatistics: aggregatedStatistics
//         });
//     } catch (error) {
//         console.error('Error fetching branch statistics:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };

// exports.getEmployeeStatistics = async (req, res) => {
//     try {
//         let { startDate, endDate } = req.query;

//         // Parse dates if provided, otherwise leave them undefined
//         let start = startDate ? new Date(startDate) : undefined;
//         let end = endDate ? new Date(endDate) : undefined;
//         if (end) end.setHours(23, 59, 59, 999); // Set time to the end of the day if endDate is provided

//         // Get all employees
//         const employees = await User.find({ role: 'employee' });

//         const filterQuery = start && end
//             ? { date: { $gte: start, $lte: end } }
//             : {};

//         // Fetch data concurrently
//         const [bookings, paidUserData, returnAndPendings, pendingOrders] = await Promise.all([
//             BookingData.find(filterQuery),
//             UserPaymentData.find(filterQuery),
//             ReturnAndPendingData.find(filterQuery),
//             PendingOrder.find(filterQuery),
//         ]);

//         const allEmployeeData = employees.map(employee => {
//             const username = employee.username ? employee.username.trim().toLowerCase() : '';

//             const totalOrdersCount = bookings.filter(data => data.cr && data.cr.trim().toLowerCase() === username);
//             const paymentDataCount = paidUserData.filter(data => data.cr && data.cr.trim().toLowerCase() === username);
//             const returnAndPendingDataCount = returnAndPendings.filter(data => data.cr && data.cr.trim().toLowerCase() === username);
//             const pendingOrderCount = pendingOrders.filter(data => data.cr && data.cr.trim().toLowerCase() === username);

//             const totalRevenue = paymentDataCount.reduce((sum, payment) => sum + payment.cod, 0);

//             return {
//                 username,
//                 totalRevenue,
//                 totalOrdersCount: totalOrdersCount.length,
//                 paymentDataCount: paymentDataCount.length,
//                 returnAndPendingDataCount: returnAndPendingDataCount.length,
//                 pendingOrderCount: pendingOrderCount.length,
//             };
//         });

//         // Calculate aggregated statistics for all employees
//         const aggregatedEmployeeStatistics = allEmployeeData.reduce((acc, stat) => {
//             acc.totalRevenue += stat.totalRevenue;
//             acc.totalOrdersCount += stat.totalOrdersCount;
//             acc.paymentDataCount += stat.paymentDataCount;
//             acc.returnAndPendingDataCount += stat.returnAndPendingDataCount;
//             acc.pendingOrderCount += stat.pendingOrderCount;

//             return acc;
//         }, {
//             totalRevenue: 0,
//             totalOrdersCount: 0,
//             paymentDataCount: 0,
//             returnAndPendingDataCount: 0,
//             pendingOrderCount: 0,

//         });

//         res.status(200).json({
//             allEmployeeData: allEmployeeData,
//             aggregatedEmployeeStatistics: aggregatedEmployeeStatistics,
//         });
//     } catch (error) {
//         console.error('Error fetching aggregated data:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };

//#################### FOR BookingData ###############//

// const updateStatusToProcessing = async () => {
//     try {
//         const result = await BookingData.updateMany(
//             { status: { $exists: true } }, // Filter to select all documents where 'status' exists
//             { $set: { status: 'Processing' } } // Update the 'status' field to 'Processing'
//         );

//         console.log(`${result.modifiedCount} documents were updated.`);
//     } catch (err) {
//         console.error('Error updating documents:', err);
//     }
// };

// updateStatusToProcessing();

//#################### FOR ReturnAndPendingData ###############//

// const updateStatusForMatchingBarcodes = async () => {
//     try {
//         // Fetch distinct barcode values from ReturnAndPendingData where status is empty or not 'Returned'
//         const barcodes = await ReturnAndPendingData.distinct('barcode', {
//             $or: [
//                 { status: { $exists: true } },
//                 { status: { $eq: '' } },
//             ]
//         });

//         console.log("barcodes length", barcodes.length)

//         if (barcodes.length === 0) {
//             console.log('No matching barcodes found to update.');
//             return;
//         }

//         // Update status in BookingData
//         const bookingDataResult = await BookingData.updateMany(
//             { barcode: { $in: barcodes } }, // Filter to select documents with matching barcodes
//             { $set: { status: 'Returned' } } // Update the status to 'Returned'
//         );

//         // Update status in ReturnAndPendingData
//         const returnAndPendingResult = await ReturnAndPendingData.updateMany(
//             { barcode: { $in: barcodes } }, // Filter to select documents with matching barcodes
//             { $set: { status: 'Returned' } } // Update the status to 'Returned'
//         );

//         console.log(`${bookingDataResult.modifiedCount} documents were updated in BookingData.`);
//         console.log(`${returnAndPendingResult.modifiedCount} documents were updated in ReturnAndPendingData.`);
//     } catch (err) {
//         console.error('Error updating documents:', err);
//     }
// };

// updateStatusForMatchingBarcodes();

//#################### FOR PaymentData ###############//

// const updateStatusForMatchingArticleNumbers = async () => {
//     try {
//         // Fetch distinct article_number values from PaymentData
//         const articleNumbers = await PaymentData.distinct('article_number');
//         console.log("articleNumbers", articleNumbers.length)
//         if (articleNumbers.length === 0) {
//             console.log('No matching article numbers found to update.');
//             return;
//         }

//         // Update status in BookingData
//         const bookingDataResult = await BookingData.updateMany(
//             { barcode: { $in: articleNumbers } }, // Filter to select documents with matching barcodes
//             { $set: { status: 'Completed' } } // Update the status to 'Completed'
//         );

//         console.log(`${bookingDataResult.modifiedCount} documents were updated in BookingData.`);
//     } catch (err) {
//         console.error('Error updating documents:', err);
//     }
// };

// updateStatusForMatchingArticleNumbers();

//#################### FOR PendingOrder ###############//

// const updateStatusForMatchingBarcodesInPendingOrder = async () => {
//     try {
//         // Fetch distinct barcode values from ReturnAndPendingData where status is empty or not 'Returned'
//         const barcodes = await PendingOrder.distinct('barcode', {
//             $or: [
//                 { status: { $exists: true } },
//                 { status: { $eq: '' } },
//             ]
//         });

//         console.log("barcodes length", barcodes.length)

//         if (barcodes.length === 0) {
//             console.log('No matching barcodes found to update.');
//             return;
//         }

//         // Update status in BookingData
//         const bookingDataResult = await BookingData.updateMany(
//             { barcode: { $in: barcodes } }, // Filter to select documents with matching barcodes
//             { $set: { status: 'Pending' } } // Update the status to 'Returned'
//         );

//         // Update status in ReturnAndPendingData
//         const PendingOrderResult = await PendingOrder.updateMany(
//             { barcode: { $in: barcodes } }, // Filter to select documents with matching barcodes
//             { $set: { status: 'Pending' } } // Update the status to 'Returned'
//         );

//         console.log(`${bookingDataResult.modifiedCount} documents were updated in BookingData.`);
//         console.log(`${PendingOrderResult.modifiedCount} documents were updated in ReturnAndPendingData.`);
//     } catch (err) {
//         console.error('Error updating documents:', err);
//     }
// };

// updateStatusForMatchingBarcodesInPendingOrder();


//#################### FOR UserPaymentData ###############//

// const updateUserPaymentDataStatus = async () => {
//     try {
//         // Fetch distinct barcode values from BookingData
//         const barcodes = await BookingData.distinct('barcode');
        
//         if (barcodes.length === 0) {
//             console.log('No matching barcodes found to update.');
//             return;
//         }

//         // Update status in UserPaymentData
//         const userPaymentDataResult = await UserPaymentData.updateMany(
//             { barcode: { $in: barcodes } }, // Filter to select documents with matching barcodes
//             { $set: { status: 'Completed' } } // Update the status to 'Completed'
//         );

//         console.log(`${userPaymentDataResult.modifiedCount} documents were updated in UserPaymentData.`);
//     } catch (err) {
//         console.error('Error updating documents:', err);
//     }
// };

// updateUserPaymentDataStatus();