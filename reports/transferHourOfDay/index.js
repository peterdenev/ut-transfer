var { filterElementTypes } = require('ut-front-react/components/GridToolBox/types');

var startDate = new Date();
startDate.setHours(0);
startDate.setMinutes(0);
startDate.setSeconds(0);
startDate.setMilliseconds(0);

var endDate = new Date();
endDate.setHours(23);
endDate.setMinutes(59);
endDate.setSeconds(59);
endDate.setMilliseconds(999);

module.exports = (gridStyle) => ({
    title: 'Transfer Hour of Day Statistics ',
    export: {
        method: 'db/transfer.report.byHourOfDay',
        resultsetName: 'transferHourOfDay'
    },
    grid: {
        fields: [
            { name: 'agreatepredicate', title: 'Hour of Day' },
            { name: 'transferCount', title: 'Transfer Count' },
            { name: 'transferCountPercent', title: '%' },
            { name: 'amountBilling', title: 'Billing Amount' },
            { name: 'amountBillingPercent', title: '%' },
            { name: 'amountSettlement', title: 'Settlement Amount' },
            { name: 'amountSettlementPercent', title: '%' },
            { name: 'transferFee', title: 'Transfer Fee' },
            { name: 'transferFeePercent', title: '%' },
            { name: 'issuerFee', title: 'Issuer Fee' },
            { name: 'issuerFeePercent', title: '%' },
            { name: 'acquirerFee', title: 'Aquirer Fee' },
            { name: 'acquirerFeePercent', title: '%' },
            { name: 'transferCurrency', title: 'Currency' }
        ],
        method: 'db/transfer.report.byHourOfDay',
        resultsetName: 'transferHourOfDay',
        allowColumnConfig: true,
        externalStyle: gridStyle
    },
    toolbox: {
        showAdvanced: false,
        maxVisibleInputs: 3,
        filterAutoFetch: false
    },
    filters: [
        {
            name: 'transferCurrency',
            label: 'Currency',
            placeholder: 'Currency',
            type: filterElementTypes.dropDown,
            showAllOption: false,
            canSelectPlaceholder: true,
            dataFetch: {
                method: 'core.itemCode.fetch',
                resultsetName: 'items',
                params: {alias: ['currency']},
                map: {display: 'display', value: 'value'}
            }
        },
        {
            labelFrom: 'Transfer From',
            labelTo: 'Transfer To',
            nameMap: {from: 'startDate', to: 'endDate'},
            type: filterElementTypes.dateTimePickerBetween,
            defaultValue: {
                from: startDate,
                to: endDate
            }
        }
    ],
    order: {
        single: true,
        by: [
            'agreatepredicate',
            'transferCount',
            'transferCountPercent',
            'amountBilling',
            'amountBillingPercent',
            'amountSettlement',
            'amountSettlementPercent',
            'transferFee',
            'transferFeePercent',
            'issuerFee',
            'issuerFeePercent',
            'acquirerFee',
            'acquirerFeePercent'
        ]
    }
});
