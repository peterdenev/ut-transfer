const {formatNumber, formatDate} = require('../common');

module.exports = {
    staticResources: [
        {rel: 'stylesheet', type: 'text/css', href: '/s/ut-transfer/repository/css/reportStyle.css'}
    ],
    transformCellValue: (value, field, data, isHeader) => {
        let classnames = [];

        switch (field.name) {
            case 'transferDateTime':
                if (!isHeader) {
                    if (value) {
                        value = formatDate(value, 'DD-MM-YYYY hh:mm:ss');
                    }
                }
                break;
            case 'amountSettlement':
            case 'amountTransaction':
            case 'amountBilling':
            case 'transferAmount':
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
