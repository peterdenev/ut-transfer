const {formatNumber} = require('../common');

module.exports = {
    staticResources: [
        {rel: 'stylesheet', type: 'text/css', href: '/s/ut-transfer/repository/css/reportStyle.css'}
    ],
    rowStyleField: 'style',
    transformCellValue: (value, field, data, isHeader) => {
        let classnames = [];

        switch (field.name) {
            case 'dueTo':
            case 'transferAmount':
            case 'transferFee':
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
