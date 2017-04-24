var { filterElementTypes } = require('ut-front-react/components/GridToolBox/types');

module.exports = (gridStyle) => ({
    title: 'Transfer Type Statistics ',
    grid: {
        fields: [
            { name: 'agreatepredicate', title: 'Transaction Type' },
            { name: 'transferCount', title: 'Transaction Count' },
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
        method: 'db/transfer.report.byTypeOfTransfer',
        resultsetName: 'transferTransactyonType',
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
            labelFrom: 'Transaction From',
            labelTo: 'Transaction To',
            nameMap: {from: 'startDate', to: 'endDate'},
            type: filterElementTypes.dateTimePickerBetween
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
