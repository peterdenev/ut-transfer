module.exports = (gridStyle) => ({
    SettlementReport: require('./settlement')(gridStyle),
    TransferReport: require('./transfer')(gridStyle),
    TransferDetails: require('./transferDetails')(gridStyle),
    TransferHourOfDay: require('./transferHourOfDay')(gridStyle),
    TransferDayOfWeek: require('./transferDayOfWeek')(gridStyle),
    TransferWeekOfYear: require('./transferWeekOfYear')(gridStyle),
    TransferTypeStatistics: require('./transferTypeStatistics')(gridStyle)
});
