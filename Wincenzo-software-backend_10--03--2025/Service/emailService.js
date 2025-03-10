const nodemailer = require('nodemailer');
const { Setting } = require("../models/settingpageModel");
// Create a transporter with placeholder values (they will be updated with actual values)
let transporter;

async function initializeTransporter() {
  const settings = await Setting.findOne(); // Assuming you have a single document with settings
  transporter = nodemailer.createTransport({
    service: 'gmail', // You can use any email service
    auth: {
      user: settings.SenderMail,
      pass: settings.SenderEmailPassword, // Ensure to store passwords securely
    },
  });
}

exports.sendMail = async (data) => {

  try {
    if (!transporter) {
      await initializeTransporter(); // Initialize transporter with actual values from the settings
    }

    const settings = await Setting.findOne(); // Fetch settings to get receiver email
    const tableRows = Object.entries(data.orderDetail).map(([key, value]) => `
      <tr>
        <td>${key}</td>
        <td>${value !== null ? value : ''}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: settings.SenderMail,
      to: data.sendTo, // Use the receiver email from settings
      subject: data.subject,
      html: `
        <table border="1" cellpadding="5" cellspacing="0">
          <tr>
            <th>Field</th>
            <th>Value</th>
          </tr>
          ${tableRows}
        </table>
        ${data.description}
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return {
      statusCode: 201,
      body: {
        message: 'Email sent successfully',
        data: info.response,
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: {
        message: error.message,
      }
    };
  }
};

// exports.sendMail = async (data) => {
//   console.log("Data to be sent in email:", data);
//   const tableRows = Object.entries(data).map(([key, value]) => `
//   <tr>
//     <td>${key}</td>
//     <td>${value !== null ? value : ''}</td>
//   </tr>
// `).join('');

//   const mailOptions = {
//     from: SenderMail,
//     to: RecieverMail, // The recipient's email
//     subject: 'Order Details',
//     html: `
//       <h3>Order Details</h3>
//       <table border="1" cellpadding="5" cellspacing="0">
//         <tr>
//           <th>Field</th>
//           <th>Value</th>
//         </tr>
//         ${tableRows}
//       </table>
//     `
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     return {
//       statusCode: 201,
//       body: {
//         message: 'Email sent successfully',
//         data: info.response,
//       }
//     };
//   } catch (error) {
//     return {
//       statusCode: 500,
//       body: {
//         message: error.message,
//       }
//     };
//   }
// };
