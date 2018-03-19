const {formatNumber} = require('../common');

module.exports = {
    staticResources: [
        {rel: 'stylesheet', type: 'text/css', href: '/s/ut-transfer/repository/css/reportStyle.css'}
    ],
    transformCellValue: (value, field, data, isHeader) => {
        let classnames = [];

        switch (field.name) {
            case 'transferCount':
            case 'deniedCount':
                value = formatNumber(value);
                classnames.push('rightAlign');
                break;
            case 'transferAmount':
            case 'transferFee':
            case 'dueTo':
                classnames.push('rightAlign');
                if (!isHeader) {
                    value = formatNumber(value);
                    classnames.push('textColorBlue');
                }
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
