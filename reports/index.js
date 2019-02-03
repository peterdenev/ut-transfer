module.exports = (gridStyle) => ({
    SettlementReport: require('./settlement').default(gridStyle),
    SettlementDetails: require('./settlementDetails').default(gridStyle),
    TransferReport: require('./transfer').default(gridStyle),
    TransferDetails: require('./transferDetails').default(gridStyle),
    TransferHourOfDay: require('./transferHourOfDay').default(gridStyle),
    TransferDayOfWeek: require('./transferDayOfWeek').default(gridStyle),
    TransferWeekOfYear: require('./transferWeekOfYear').default(gridStyle),
    TransferTypeStatistics: require('./transferTypeStatistics').default(gridStyle)
});
