module.exports = {
    'push.execute': require('./transfer/push.execute'),
    'transfer.get': require('./transfer/transfer.get'),
    'reason.list': require('./transfer/reason.list'),
    'partner.fetch': require('./partner/partner.fetch'),
    'partner.list': require('./partner/partner.list'),
    'partner.add': require('./partner/partner.add'),
    'partner.edit': require('./partner/partner.edit'),
    'partner.get': require('./partner/partner.get'),
    'transferDetails.get': require('./report/transferDetails.get'),
    'report.byTypeOfTransfer': require('./report/report.byTypeOfTransfer'),
    'report.byHourOfDay': require('./report/report.byHourOfDay'),
    'report.byDayOfWeek': require('./report/report.byDayOfWeek'),
    'report.byWeekOfYear': require('./report/report.byWeekOfYear'),
    'report.transfer': require('./report/report.transfer'),
    'report.settlement': require('./report/report.settlement'),
    'report.settlementDetails': require('./report/report.settlementDetails')
};
