const axios = require("axios");
const sheetsUrl = process.env.SHEETS_URI;


async function createRecord(record) {
    if (!record) return;
    if (record.first_name && record.hospital && record.date && record.username && record.patient && record.procedure) {
        const options = {
            url: sheetsUrl,
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8'
            },
            data: record
        };
        await axios(options)
            .then((res) => res)
            .catch((err) => console.log(err));
        return true;
    }
    else {
        return false
    }
}

module.exports = {
    createRecord,
};
