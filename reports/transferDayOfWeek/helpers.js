var {evalResult, formatNumber} = require('ut-report/assets/script/common');

module.exports = {
    staticResources: [
        {rel: 'stylesheet', type: 'text/css', href: '/s/ut-transfer/repository/css/reportStyle.css'}
    ],
    transformCellValue: function({allowHtml, nodeContext, dateFormat, locale}) {
        return (value, field, data, isHeader) => {
            var classNames = [];
            var result = value;
            switch (field.name) {
                case 'transferCount':
                    classNames.push('rightAlign');
                    result = formatNumber(result);
                    break;
                case 'agreatepredicate':
                case 'transferCurrency':
                    break;
                default:
                    if (!isHeader) {
                        result = formatNumber(result);
                        classNames.push('textColorBlue');
                    }
                    classNames.push('rightAlign');
                    break;
            }

            if (allowHtml) {
                return evalResult(result, 'div', classNames, nodeContext);
            }

            return result;
        };
    }
};
