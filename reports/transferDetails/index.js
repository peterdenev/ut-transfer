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
    title: 'Transfer Details',
    export: {
        method: 'db/transfer.transferDetails.get',
        resultsetName: 'transferDetails'
    },
    grid: {
        fields: [
            { name: 'transferId', title: 'Trans#' },
            { name: 'channelType', title: 'Device Type' },
            { name: 'channelId', title: 'Device Id' },
            { name: 'typeTransaction', title: 'Transfer Type' },
            { name: 'transferDateTime', title: 'Transfer Date' },
            { name: 'transferAmount', title: 'Transfer Amount' },
            { name: 'amountBilling', title: 'Billing Amount' },
            { name: 'amountSettlement', title: 'Settlement Amount' },
            { name: 'transferCurrency', title: 'Currency' }
        ],
        method: 'db/transfer.transferDetails.get',
        resultsetName: 'transferDetails',
        allowColumnConfig: true,
        externalStyle: {...reportStyle, ...gridStyle}
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
            labelFrom: 'Transfer From',
            labelTo: 'Transfer To',
            nameMap: {from: 'startDate', to: 'endDate'},
            type: filterElementTypes.dateTimePickerBetween
        },
        {
            type: filterElementTypes.searchBtn, validateFilter: false
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
