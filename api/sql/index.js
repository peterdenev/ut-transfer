var path = require('path');

var { handleExportResponse } = require('ut-report/assets/script/common');

module.exports = [
    'byHourOfDay',
    'byDayOfWeek',
    'byWeekOfYear',
    'byTypeOfTransfer',
    'settlement',
    'settlementDetails',
    'transfer',
    'transferDetails'
].reduce((accum, cur) => {
    accum[`report.${cur}.response.receive`] = function(msg, $meta) {
        if ($meta.fileConfig) {
            return handleExportResponse(msg, $meta);
        }

        return msg;
    };

    return accum;
}, {
    schema: [{path: path.join(__dirname, 'schema'), linkSP: true}]
});
