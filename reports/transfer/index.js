var { filterElementTypes } = require('ut-front-react/components/GridToolBox/types');

var startDate = new Date();
startDate.setHours(0);
startDate.setMinutes(0);
startDate.setSeconds(0);

var endDate = new Date();
endDate.setHours(23);
endDate.setMinutes(59);
endDate.setSeconds(59);

module.exports = (gridStyle) => ({
    title: 'Transfer report',
    grid: {
        fields: [
            { name: 'transferId', title: 'Trans#' },
            { name: 'cardNumber', title: 'Card Number' },
            { name: 'transferDateTime', title: 'Date and Time of TXN' },
            { name: 'sourceAccount', title: 'Debit Account' },
            { name: 'destinationAccount', title: 'Credit Account' },
            { name: 'description', title: 'Description' },
            { name: 'transferIdAcquirer', title: 'RRN' },
            { name: 'transferAmount', title: 'Transfer Amount' },
            { name: 'transferCurrency', title: 'Currency' },
            { name: 'terminalId', title: 'Device Id' },
            { name: 'terminalName', title: 'Device Location' },
            { name: 'responseCode', title: 'Response Code' },
            { name: 'issuerTxStateName', title: 'Issuer State' },
            { name: 'reversalCode', title: 'Reversal Code' },
            { name: 'merchantName', title: 'Merchant' },
            { name: 'additionalInfo', title: 'Additional Info' },
            { name: 'alerts', title: 'Alerts' }
        ],
        allowColumnConfig: true,
        method: 'db/transfer.report.transfer',
        resultsetName: 'transfers',
        rowStyleField: 'style',
        externalStyle: gridStyle
    },
    // export: {
    //     method: 'your.exportMethod.here', // TODO replace with transfer report strored procedure
    //     maxSize: 20000
    // },
    toolbox: {
        showAdvanced: true,
        maxVisibleInputs: 5,
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
            label: 'Transfer Type',
            placeholder: 'Transfer Type',
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
            timeFormat: 'HH:mm',
            dateFormat: 'YYYY-MM-DD',
            defaultValue: {
                from: startDate,
                to: endDate
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
