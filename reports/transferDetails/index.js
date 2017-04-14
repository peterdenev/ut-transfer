var { filterElementTypes } = require('ut-front-react/components/GridToolBox/types');

module.exports = (gridStyle) => ({
    title: 'Transfer Details',
    grid: {
        fields: [
            { name: 'transferId', title: 'Transfer Id' },
            { name: 'channelType', title: 'Device Type' },
            { name: 'channelId', title: 'Device Id' },
            { name: 'typeTransaction', title: 'Transaction Type' },
            { name: 'transferDateTime', title: 'Transfer Date' },
            { name: 'transferAmount', title: 'Transaction Amount' },
            { name: 'amountBilling', title: 'Billing Amount' },
            { name: 'amountSettlement', title: 'Settlement Amount' },
            { name: 'transferCurrency', title: 'Currency' }
        ],
        method: 'db/transfer.transferDetails.get',
        resultsetName: 'transferDetails',
        allowColumnConfig: true,
        externalStyle: gridStyle
    },
    toolbox: {
        showAdvanced: true,
        maxVisibleInputs: 3,
        filterAutoFetch: false
    },
    filters: [
        {
            label: 'Device Id',
            name: 'deviceID',
            type: filterElementTypes.searchBox
        },
        {
            name: 'deviceType',
            label: 'Device Type',
            placeholder: 'Device Type',
            type: filterElementTypes.dropDown,
            showAllOption: false,
            canSelectPlaceholder: true
            // dataFetch: {
            //     method: 'core.itemName.fetch',
            //     resultsetName: 'items',
            //     params: {alias: ['operation']},
            //     map: {display: 'display', value: 'value'}
            // }
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
            labelFrom: 'Transaction From',
            labelTo: 'Transaction To',
            nameMap: {from: 'startDate', to: 'endDate'},
            type: filterElementTypes.dateTimePickerBetween
        }
    ],
    order: {
        single: true,
        by: ['transferId', 'channelType', 'typeTransaction', 'transferDateTime', 'channelId', 'transferAmount', 'amountBilling', 'amountSettlement', 'transferCurrency']
    },
    pagination: {
        visiblePages: 10,
        pageSize: 25
    }
});
