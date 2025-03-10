const emailService = require('../Service/emailService');

exports.sendEmail = async (req, res) => {
    try {
        const { data } = req.body;

        const result = await emailService.sendMail(data);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error.toString());
    }
};
