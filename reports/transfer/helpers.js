const {formatNumber} = require('../common');

module.exports = {
    staticResources: [
        {rel: 'stylesheet', type: 'text/css', href: '/s/ut-transfer/repository/css/reportStyle.css'}
    ],
    rowStyleField: 'style',
    transformCellValue: function(value, field, data, isHeader) {
        let classnames = [];

        switch (field.name) {
            case 'sourceAccount':
                if (!isHeader && value && isNaN(parseInt(value))) {
                    value = 'N/A';
                }
                break;
            case 'transferDateTime':
                if (!isHeader && value) {
                    value = {
                        'Transaction Date': value.split(' ')[0],
                        'Transaction Time': value.split(' ')[1]
                    }[field.title];
                }
                break;
            case 'stan':
            case 'transferId':
            case 'traceNumber':
                if (!isHeader && value) {
                    value = (`000000${value}`).slice(-6);
                }
                break;
            case 'acquirerFee':
            case 'issuerFee':
            case 'conveinienceFee':
            case 'transferAmount':
            case 'actualAmount':
            case 'replacementAmount':
                if (!isHeader) {
                    value = formatNumber(value);
                    classnames.push('textColorBlue');
                }
                classnames.push('rightAlign');
                break;
            default:
                break;
        }

        return {
            value,
            classnames
        };
    }
};
