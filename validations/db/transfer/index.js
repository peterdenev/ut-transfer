module.exports = {
    'report.transfer': require('./any'), // todo
    'report.settlement': require('./any'), // todo
    'report.settlementDetails': require('./any'), // todo

    'transferDetails.get': require('./transferDetails.get'),
    'report.byTypeOfTransfer': require('./report.byTypeOfTransfer'),
    'report.byHourOfDay': require('./report.byHourOfDay'),
    'report.byDayOfWeek': require('./report.byDayOfWeek'),
    'report.byWeekOfYear': require('./report.byWeekOfYear'),
    'partner.fetch': require('./partner.fetch')
};
