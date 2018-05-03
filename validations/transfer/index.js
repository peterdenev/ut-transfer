module.exports = {
    'push.execute': require('./push.execute'),
    'transfer.get': require('./transfer.get'),
    'partner.fetch': require('./partner.fetch'),
    'partner.list': require('./partner.list'),
    'partner.add': require('./partner.add'),
    'partner.edit': require('./partner.edit'),
    'partner.get': require('./partner.get'),
    'reason.list': require('./reason.list'),
    'transferDetails.get': require('./transferDetails.get'),
    'report.byTypeOfTransfer': require('./report.byTypeOfTransfer'),
    'report.byHourOfDay': require('./report.byHourOfDay'),
    'report.byDayOfWeek': require('./report.byDayOfWeek'),
    'report.byWeekOfYear': require('./report.byWeekOfYear'),
    'report.transfer': require('./report.transfer'),
    'report.settlement': require('./report.settlement'),
    'report.settlementDetails': require('./report.settlementDetails')
};
