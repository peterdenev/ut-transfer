import { filterElementTypes } from 'ut-front-react/components/GridToolBox/types';
import reportStyle from '../../assets/static/css/reportStyle.css';

let date = new Date();
date.setHours(0);
date.setMinutes(0);
date.setSeconds(0);
date.setMilliseconds(0);

module.exports = (gridStyle) => ({
    title: 'Settlement Details',
    export: {
        method: 'db/transfer.report.settlementDetails',
        resultsetName: 'settlementDetails',
        maxSize: 20000
    },
    grid: {
        fields: [
            { name: 'transferId', title: 'Trans#' },
            { name: 'cardNumber', title: 'Card Number' },
            { name: 'productName', title: 'Card Product' },
            { name: 'transferType', title: 'Transfer Type' },
            { name: 'transferDateTime', title: 'Transfer Date' },
            { name: 'localDate', title: 'Date' },
            { name: 'localTime', title: 'Time' },
            { name: 'processingCode', title: 'Processing Code' },
            { name: 'transferAmount', title: 'Transfer Amount' },
            { name: 'transferFee', title: 'Fee' },
            { name: 'transferCurrency', title: 'Currency' },
            { name: 'transferIdIssuer', title: 'Issuer Id' },
            { name: 'transferIdAcquirer', title: 'Acquirer Id' },
            { name: 'deviceId', title: 'Device Id' },
            { name: 'deviceName', title: 'Device Name' },
            { name: 'dueTo', title: 'Due To' }
        ],
        method: 'db/transfer.report.settlementDetails',
        resultsetName: 'settlementDetails',
        allowColumnConfig: true,
        externalStyle: {...reportStyle, ...gridStyle},
        rowStyleField: 'style'
    },
    toolbox: {
        showAdvanced: false,
        maxVisibleInputs: 3,
        filterAutoFetch: false
    },
    filters: [
        {
            label: 'Settlement Date',
            name: 'settlementDate',
            type: filterElementTypes.datePicker,
            defaultValue: date
        }
    ],
    order: {
        single: true,
        by: [
            'transferId',
            'cardNumber',
            'productName',
            'transferType',
            'localDate',
            'localTime',
            'processingCode',
            'transferAmount',
            'transferFee',
            'transferCurrency',
            'transferIdIssuer',
            'transferIdAcquirer',
            'deviceId',
            'deviceName',
            'dueTo'
        ]
    },
    pagination: {
        visiblePages: 10,
        pageSize: 25
    }
});
