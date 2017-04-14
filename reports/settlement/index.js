var { filterElementTypes } = require('ut-front-react/components/GridToolBox/types');

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
        method: '',
        resultsetName: '',
        externalStyle: gridStyle
    },
    // export: {
    //     method: '', // TODO replace with settlement report strored procedure
    //     maxSize: 20000
    // },
    toolbox: {
        showAdvanced: true,
        maxVisibleInputs: 3,
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
