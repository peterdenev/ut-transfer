import { filterElementTypes } from 'ut-front-react/components/GridToolBox/types';

let date = new Date();
date.setHours(0);
date.setMinutes(0);
date.setSeconds(0);
date.setMilliseconds(0);

module.exports = (gridStyle) => ({
    title: 'Settlement Report',
    grid: {
        fields: [
            { name: '', title: 'Financial Channel' },
            { name: '', title: 'Channel' },
            { name: '', title: 'Number of Transactions' },
            { name: '', title: 'Transaction Amount' },
            { name: '', title: 'Settlement Amount' },
            { name: '', title: 'Transaction Fee' },
            { name: '', title: 'Servicing' },
            { name: '', title: 'Source Account' },
            { name: '', title: 'Target Account' },
            { name: '', title: 'Total Settlement Amount' },
            { name: '', title: 'Total Withdrawal Fees' },
            { name: '', title: 'Total Balance Inquiry Fees' },
            { name: '', title: 'Convenience Fee' },
            { name: '', title: 'Acquirer Settlement' },
            { name: '', title: 'Coop Share' },
            { name: '', title: 'Issuer Settlement' },
            { name: '', title: 'Acquirer' },
            { name: '', title: 'Issuer' },
            { name: '', title: 'Transferee' },
            { name: '', title: 'Net Fee' },
            { name: '', title: 'Total' },
            { name: '', title: 'Commission' }
        ],
        allowColumnConfig: true,
        method: 'db/transfer.report.settlement',
        resultsetName: 'settlement',
        externalStyle: gridStyle
    },
    export: {
        method: 'db/transfer.report.settlement',
        resultsetName: 'settlement',
        maxSize: 20000
    },
    toolbox: {
        showAdvanced: false,
        maxVisibleInputs: 5,
        filterAutoFetch: false
    },
    filters: [
        {
            name: 'cooperationId',
            label: 'Cooperative',
            placeholder: 'Cooperative',
            type: filterElementTypes.dropDown,
            showAllOption: false,
            canSelectPlaceholder: true
            // dataFetch: {
            //     method: 'customer.organization.list',
            //     resultsetName: 'allBranches',
            //     params: {},
            //     map: {display: 'organizationName', value: 'actorId'}
            // }
        },
        {
            name: 'branchId',
            label: 'Business Unit',
            placeholder: 'Business Unit',
            type: filterElementTypes.dropDown,
            showAllOption: false,
            canSelectPlaceholder: true,
            dataFetch: {
                method: 'customer.organization.list',
                resultsetName: 'allBranches',
                params: {},
                map: {display: 'organizationName', value: 'actorId'}
            }
        },
        /*
        {
            name: '',
            label: '',
            placeholder: '',
            type: filterElementTypes.dropDown,
            showAllOption: false,
            canSelectPlaceholder: true
            // dataFetch: {
            //     method: 'customer.organization.list',
            //     resultsetName: 'allBranches',
            //     params: {},
            //     map: {display: 'organizationName', value: 'actorId'}
            // }
        },
        */
        {
            labelFrom: 'Transaction From',
            labelTo: 'Transaction To',
            nameMap: {from: 'transactionFromDate', to: 'transactionToDate'},
            type: filterElementTypes.datePickerBetween
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
