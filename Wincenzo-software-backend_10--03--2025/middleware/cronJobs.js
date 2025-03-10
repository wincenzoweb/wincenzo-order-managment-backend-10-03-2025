const cron = require('node-cron');
const { moveOldOrdersToPending } = require("../controllers/pendingOrderController")

const setupCronJobs = () => {
    // Schedule task to run once a day at midnight
    cron.schedule('0 0 * * *', async () => {
        try {
            await moveOldOrdersToPending();
            console.log('Cron job executed: Old orders moved to pendingOrders collection.');
        } catch (error) {
            console.error('Error executing cron job:', error);
        }
    });

    // Initial update to move pending orders on server start
    (async () => {
        try {
            await moveOldOrdersToPending();
            console.log('Initial move of old orders to pendingOrders collection executed........');
        } catch (error) {
            console.error('Error executing initial move:', error);
        }
    })();

    //// Initial update to move pending orders after 1 minute of server
    // setTimeout(async () => {
    //     try {
    //         console.log('Initial move of old orders to pendingOrders collection executed after 1 minute.');
    //         await moveOldOrdersToPending();
    //     } catch (error) {
    //         console.error('Error executing initial move:', error);
    //     }
    // }, 10 * 1000); // 60 seconds = 1 minute
};

module.exports = setupCronJobs;
