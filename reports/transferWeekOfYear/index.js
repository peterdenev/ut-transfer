import { filterElementTypes } from 'ut-front-react/components/GridToolBox/types';
import reportStyle from '../../assets/static/css/reportStyle.css';

let startDate = new Date();
startDate.setDate(1);
startDate.setMonth(0);
startDate.setHours(0);
startDate.setMinutes(0);
startDate.setSeconds(0);
startDate.setMilliseconds(0);

let endDate = new Date();
endDate.setDate(31);
endDate.setMonth(11);
endDate.setHours(23);
endDate.setMinutes(59);
endDate.setSeconds(59);
endDate.setMilliseconds(999);

module.exports = (gridStyle) => ({
    title: 'Transfer Week of Year Statistics ',
    export: {
        method: 'db/transfer.report.byWeekOfYear',
        resultsetName: 'transferWeekOfYear'
    },
    grid: {
        fields: [
            { name: 'agreatepredicate', title: 'Week Number' },
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
        method: 'db/transfer.report.byWeekOfYear',
        resultsetName: 'transferWeekOfYear',
        allowColumnConfig: true,
        externalStyle: {...reportStyle, ...gridStyle}
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
        },
        {
            type: filterElementTypes.searchBtn, validateFilter: false
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
