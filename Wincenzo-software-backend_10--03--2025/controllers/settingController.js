const { Setting, ReceiverMail } = require("../models/settingpageModel");


// Create Setting (ensuring only one document exists)
exports.createSetting = async (req, res) => {
  try {
    const { SenderMail, SenderEmailPassword, MaxPendingDelay } = req.body;


    // Check if any document already exists
    const existingSetting = await Setting.findOne();

    if (existingSetting) {
      return res.status(400).json({
        message: "A setting already exists. Only one setting is allowed."
      });
    }

    // Create a new setting if no document exists
    const newSetting = new Setting({
      SenderMail,
      SenderEmailPassword,
      MaxPendingDelay
    });

    await newSetting.save();

    res.status(201).json(newSetting);
  } catch (error) {
    res.status(500).json({
      message: "Server error, please try again later.",
      error: error.message,
    });
  }
};


// Get the single Setting document
exports.getSetting = async (req, res) => {
  try {
    const setting = await Setting.findOne();
    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }
    res.status(200).json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Setting (ensuring only one document exists)
exports.updateSetting = async (req, res) => {
  try {
    // Find the single setting document
    let setting = await Setting.findOne();

    // If no setting document exists, return error
    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }

    // Update only the specified fields with the new data
    const { SenderMail, SenderEmailPassword, MaxPendingDelay } = req.body;

    // Update fields if they exist in the request body
    if (SenderMail) {
      setting.SenderMail = SenderMail;
    }
    if (SenderEmailPassword) {
      setting.SenderEmailPassword = SenderEmailPassword;
    }
    if (MaxPendingDelay) {
      setting.MaxPendingDelay = MaxPendingDelay;
    }

    // Save the updated setting
    await setting.save();
    res.status(200).json({ message: "Setting updated successfully", setting }); // Send success message
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete the single Setting document
exports.deleteSetting = async (req, res) => {
  try {
    const setting = await Setting.findOneAndDelete();
    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }
    res.status(200).json({ message: "Setting deleted successfully", setting });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new ReceiverMail
exports.addNewReceiverMail = async (req, res) => {
  try {
    const { receiverMail } = req.body;


    const newReceiverMail = new ReceiverMail({ receiverMail });
    await newReceiverMail.save();

    res.status(201).json({ message: 'Add New ReceiverMail successfully', RecieverMail: newReceiverMail });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all ReceiverMails
exports.getAllReceiverMails = async (req, res) => {
  try {
    const receiverMails = await ReceiverMail.find();
    res.status(200).json(receiverMails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update ReceiverMail email by ID
exports.updateReceiverMail = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    const { receiverMail } = req.body;
    console.log(req.body)
    const updatedReceiverMail = await ReceiverMail.findByIdAndUpdate(id, { receiverMail }, { new: true });
    if (!updatedReceiverMail) {
      return res.status(404).json({ message: 'ReceiverMail not found' });
    }
    res.status(200).json({ message: 'ReceiverMail updated successfully', receiverMail: updatedReceiverMail });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a ReceiverMail by ID
exports.deleteReceiverMail = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedReceiverMail = await ReceiverMail.findByIdAndDelete(id);
    if (!deletedReceiverMail) {
      return res.status(404).json({ message: 'ReceiverMail not found' });
    }
    res.status(200).json({ message: 'ReceiverMail deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};





// const Setting = require("../models/settingpageModel"); // Adjust the path as needed

// // Function to create a new setting
// const createSetting = async (req, res) => {
//   try {
//     const { SenderMail, SenderEmailPassword, RecieverMail, MaxPendingDelay } = req.body;

//     // Check if any document already exists
//     const existingSetting = await Setting.findOne();

//     if (existingSetting) {
//       return res.status(400).json({
//         message: "A setting already exists. Only one setting is allowed."
//       });
//     }

//     // Create a new setting if no document exists
//     const newSetting = new Setting({
//       SenderMail,
//       SenderEmailPassword,
//       RecieverMail,
//       MaxPendingDelay
//     });

//     await newSetting.save();

//     res.status(201).json(newSetting);
//   } catch (error) {
//     res.status(500).json({
//       message: "Server error, please try again later.",
//       error: error.message,
//     });
//   }
// };


// const getSetting = async (req, res) => {
//   try {
//     const setting = await Setting.find();
//     res.status(200).json(setting);
//   } catch (error) {
//     res.status(500).json({
//       message: "Server error, please try again later.",
//       error: error.message,
//     });
//   }
// }
// const updateSetting = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { SenderMail, SenderEmailPassword, RecieverMail, MaxPendingDelay } = req.body;

//     // Check for existing entries with the same values excluding the current document
//     const existingSetting = await Setting.findOne({
//       _id: { $ne: id },
//       $or: [
//         { SenderMail },
//         { SenderEmailPassword },
//         { RecieverMail },
//         { MaxPendingDelay }
//       ]
//     });

//     if (existingSetting) {
//       return res.status(400).json({
//         message: "One or more fields have values that already exist."
//       });
//     };

//     // Update the setting
//     const updatedSetting = await Setting.findByIdAndUpdate(
//       id,
//       { SenderMail, SenderEmailPassword, RecieverMail, MaxPendingDelay },
//       { new: true }
//     );

//     if (!updatedSetting) {
//       return res.status(404).json({ message: "Setting not found" });
//     }

//     res.status(200).json(updatedSetting);
//   } catch (error) {
//     res.status(500).json({
//       message: "Server error, please try again later.",
//       error: error.message,
//     });
//   }
// };

// // Function to delete a setting
// const deleteSetting = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deletedSetting = await Setting.findByIdAndDelete(id);

//     if (!deletedSetting) {
//       return res.status(404).json({ message: "Setting not found" });
//     }

//     res.status(200).json({ message: "Setting deleted successfully" });
//   } catch (error) {
//     res.status(500).json({
//       message: "Server error, please try again later.",
//       error: error.message,
//     });
//   }
// };

// module.exports = {
//   createSetting,
//   deleteSetting,
//   getSetting,
//   updateSetting
// };
