import { filterElementTypes } from 'ut-front-react/components/GridToolBox/types';
import reportStyle from '../../assets/static/css/reportStyle.css';

let date = new Date();
date.setHours(0);
date.setMinutes(0);
date.setSeconds(0);
date.setMilliseconds(0);

module.exports = (gridStyle) => ({
    title: 'Settlement Report',
    export: {
        method: 'transfer.report.settlement',
        resultsetName: 'settlement'
    },
    grid: {
        fields: [
            {name: 'productName', title: 'Product Name'},
            {name: 'transferType', title: 'Transfer Type'},
            {name: 'transferCount', title: 'Transfer Count'},
            {name: 'transferAmount', title: 'Transfer Amount'},
            {name: 'transferFee', title: 'Transfer Fee'},
            {name: 'deniedCount', title: 'Denied Count'},
            {name: 'dueTo', title: 'Due to'}
        ],
        allowColumnConfig: true,
        method: 'transfer.report.settlement',
        resultsetName: 'settlement',
        externalStyle: {...reportStyle, ...gridStyle}
    },
    toolbox: {
        showAdvanced: false,
        maxVisibleInputs: 5,
        filterAutoFetch: false
    },
    filters: [
        {
            label: 'Settlement Date',
            name: 'settlementDate',
            type: filterElementTypes.datePicker,
            defaultValue: date
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
    }
});
