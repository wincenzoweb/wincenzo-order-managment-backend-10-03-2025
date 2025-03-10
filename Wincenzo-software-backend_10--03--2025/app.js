require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const connectDB = require("./db/connect");
const setupCronJobs = require('./middleware/cronJobs');
const morgan = require("morgan");
const path = require("path");
const bodyParser = require('body-parser');

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
const PORT = process.env.PORT || 5000;

const User = require('./routes/userRoutes');
const BookingFile = require('./routes/bookingFileRoute');
const PaymentFile = require("./routes/paymentFileRoute")
const ReturnAndPendingFile = require("./routes/returnAndPendingFileRoute");
const PendingOrderRoutes = require("./routes/pendingOrderRoutes")
const SettingRoute = require('./routes/settingRoutes')
const emailRoute = require('./routes/emailRoute');
const BranchRoutes = require('./routes/branchRoutes');
const UserPaymentDataRoutes = require('./routes/UserPaymentDataRoute');
const StatisticsRoutes = require('./routes/statisticsRoutes');
const shiproketRoute = require('./routes/shiproketRoute');


app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

app.get("/", (req, res) => {
  res.send("Hello, server Connected");
});

setupCronJobs();
app.use('/api/user', User);
app.use('/api/bookingfile', BookingFile);
app.use('/api/paymentfile', PaymentFile);
app.use('/api/returnandpendingfile', ReturnAndPendingFile);
app.use('/api/pendingorder', PendingOrderRoutes);
app.use('/api/setting', SettingRoute);
app.use('/api/mail', emailRoute);
app.use('/api/branch', BranchRoutes);
app.use('/api/user-payment-data', UserPaymentDataRoutes);
app.use('/api/statistics', StatisticsRoutes);
app.use('/api/shiprocket', shiproketRoute);

const start = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

start();
