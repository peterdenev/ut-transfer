import { filterElementTypes } from 'ut-front-react/components/GridToolBox/types';
import reportStyle from '../../assets/static/css/reportStyle.css';

let startDate = new Date();
startDate.setHours(0);
startDate.setMinutes(0);
startDate.setSeconds(0);
startDate.setMilliseconds(0);

let endDate = new Date();
endDate.setHours(23);
endDate.setMinutes(59);
endDate.setSeconds(59);
endDate.setMilliseconds(999);

module.exports = (gridStyle) => ({
    title: 'Transfer Report',
    export: {
        method: 'transfer.report.transfer',
        resultsetName: 'transfers',
        maxSize: 20000
    },
    grid: {
        fields: [
            { name: 'transferId', title: 'Trans#' },
            { name: 'transferIdIssuer', title: 'Auth code' },
            { name: 'cardNumber', title: 'Card Number' },
            { name: 'transferDateTime', title: 'Transaction Date' },
            { name: 'transferDateTime', title: 'Transaction Time' },
            { name: 'sourceAccount', title: 'Debit Account' },
            { name: 'destinationAccount', title: 'Credit Account' },
            { name: 'description', title: 'Transaction Type' },
            { name: 'rrn', title: 'RRN' },
            { name: 'stan', title: 'STAN' },
            { name: 'traceNumber', title: 'Trace Number' },
            { name: 'transferAmount', title: 'Transfer Amount' },
            { name: 'replacementAmount', title: 'Replacement Amount' },
            { name: 'actualAmount', title: 'Actual Amount' },
            { name: 'issuerFee', title: 'Issuer Fee' },
            { name: 'acquirerFee', title: 'Acquirer Fee' },
            { name: 'conveinienceFee', title: 'Convenience Fee' },
            { name: 'transferCurrency', title: 'Currency' },
            { name: 'terminalId', title: 'Device Id' },
            { name: 'terminalName', title: 'Device Location' },
            { name: 'responseCode', title: 'Response Code' },
            { name: 'responseDetails', title: 'Response Details' },
            { name: 'issuerTxStateName', title: 'Issuer State' },
            { name: 'reversalCode', title: 'Description' },
            { name: 'merchantName', title: 'Merchant' },
            { name: 'additionalInfo', title: 'Additional Info' },
            { name: 'alerts', title: 'Alerts' },
            { name: 'channelType', title: 'Channel Type' }
        ],
        allowColumnConfig: true,
        method: 'transfer.report.transfer',
        resultsetName: 'transfers',
        rowStyleField: 'style',
        externalStyle: {...reportStyle, ...gridStyle}
    },
    toolbox: {
        showAdvanced: true,
        maxVisibleInputs: 5,
        filterAutoFetch: false
    },
    filters: [
        { name: 'transferId', label: 'Trans#', placeholder: 'Trans#', type: filterElementTypes.searchBox },
        { name: 'cardNumber', label: 'Card Number', placeholder: 'Card Number', type: filterElementTypes.searchBox },
        { name: 'traceNumber', label: 'Trace Number', placeholder: 'Trace Number', type: filterElementTypes.searchBox },
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
            name: 'channelType',
            label: 'Channel Type',
            placeholder: 'Channel Type',
            type: filterElementTypes.dropDown,
            canSelectPlaceholder: true,
            data: [
                { key: 'atm', name: 'ATM' },
                { key: 'iso', name: 'ISO' }
            ]
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
        },
        {
            type: filterElementTypes.searchBtn, validateFilter: false
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
