const {formatNumber} = require('../common');

module.exports = {
    staticResources: [
        {rel: 'stylesheet', type: 'text/css', href: '/s/ut-transfer/repository/css/reportStyle.css'}
    ],
    transformCellValue: (value, field, data, isHeader) => {
        let classnames = [];

        switch (field.name) {
            case 'transferCount':
                classnames.push('rightAlign');
                value = formatNumber(value);
                break;
            case 'agreatepredicate':
            case 'transferCurrency':
                break;
            default:
                if (!isHeader) {
                    value = formatNumber(value);
                    classnames.push('textColorBlue');
                }
                classnames.push('rightAlign');
                break;
        }

        return {
            value,
            classnames
        };
    }
};
