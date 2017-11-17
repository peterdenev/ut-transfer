var { filterElementTypes } = require('ut-front-react/components/GridToolBox/types');

module.exports = (gridStyle) => ({
    title: 'Transaction report',
    grid: {
        fields: [
            { name: 'transferId', title: 'TRANS#' },
            { name: 'cardNumber', title: 'CARD NUMBER' },
            { name: 'transferDateTime', title: 'DATE AND TIME OF TXN' },
            { name: 'sourceAccount', title: 'DEBIT ACCOUNT' },
            { name: 'destinationAccount', title: 'CREDIT ACCOUNT' },
            { name: 'description', title: 'DESCRIPTION' },
            { name: 'transferIdAcquirer', title: 'RRN' },
            { name: 'transferAmount', title: 'TRANSACTION AMOUNT' },
            { name: 'transferCurrency', title: 'CURRENCY' },
            { name: 'terminalId', title: 'DEVICE ID' },
            { name: 'terminalName', title: 'DEVICE LOCATION' },
            { name: 'responseCode', title: 'RESPONSE CODE' },
            { name: 'issuerTxStateName', title: 'ISSUER STATE' },
            { name: 'reversalCode', title: 'REVERSAL CODE' },
            { name: 'merchantName', title: 'Merchant' },
            { name: 'additionalInfo', title: 'ADDITIONAL INFO' },
            { name: 'alerts', title: 'ALERTS' }
        ],
        allowColumnConfig: true,
        method: 'db/transfer.report.transfer',
        resultsetName: 'transfers',
        rowStyleField: 'style',
        externalStyle: gridStyle
    },
    export: {
        method: 'db/transfer.report.transfer',
        resultsetName: 'transfers',
        maxSize: 20000
    },
    toolbox: {
        showAdvanced: true,
        maxVisibleInputs: 7,
        filterAutoFetch: false
    },
    filters: [
        { name: 'cardNumber', label: 'Card Number', placeholder: 'Card Number', type: filterElementTypes.searchBox },
        { name: 'accountNumber', label: 'Account Number', placeholder: 'Account Number', type: filterElementTypes.searchBox },
        { name: 'deviceId', label: 'Device ID', placeholder: 'Device ID', type: filterElementTypes.searchBox },
        {
            name: 'issuerTxState',
            label: 'Issuer response',
            placeholder: 'Issuer response',
            type: filterElementTypes.dropDown,
            canSelectPlaceholder: true,
            data: [
                { key: '1', name: 'requested' },
                { key: '2', name: 'confirmed' },
                { key: '3', name: 'denied' },
                { key: '4', name: 'timed out' },
                { key: '5', name: 'aborted' },
                { key: '6', name: 'error' },
                { key: '7', name: 'store requested' },
                { key: '8', name: 'store confirmed' },
                { key: '9', name: 'store timed out' },
                { key: '11', name: 'forward requested' },
                { key: '12', name: 'forward confirmed' },
                { key: '13', name: 'forward denied' },
                { key: '14', name: 'forward timed out' }
            ]
        },
        {
            name: 'processingCode',
            label: 'Transaction Type',
            placeholder: 'Transaction Type',
            type: filterElementTypes.dropDown,
            showAllOption: false,
            canSelectPlaceholder: true,
            dataFetch: {
                method: 'core.itemName.fetch',
                resultsetName: 'items',
                params: {alias: ['operation']},
                map: {display: 'display', value: 'value'}
            }
        },
        {
            labelFrom: 'Date from',
            labelTo: 'Date to',
            nameMap: { from: 'startDate', to: 'endDate' },
            type: filterElementTypes.dateTimePickerBetween,
            // timeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
            dateFormat: { day: 'numeric', month: 'numeric', year: 'numeric' },
            defaultValue: {
                from: new Date(),
                to: new Date()
            }
        },
        {
            type: filterElementTypes.clear, validateFilter: false
        }
    ],
    order: {
        single: true,
        by: []
    },
    pagination: {
        visiblePages: 10,
        pageSize: 25
    }
});
