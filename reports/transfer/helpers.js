var {evalResult, formatNumber} = require('ut-report/assets/script/common');

module.exports = {
    staticResources: [
        {rel: 'stylesheet', type: 'text/css', href: '/s/ut-transfer/repository/css/reportStyle.css'}
    ],
    rowStyleField: 'style',
    transformCellValue: function({dateFormat, allowHtml, nodeContext}) {
        return function(value, field, data, isHeader) {
            var classNames = [];
            var result = value;

            switch (field.name) {
                case 'acquirerFee':
                case 'issuerFee':
                case 'transferAmount':
                    if (!isHeader) {
                        result = formatNumber(result);
                        classNames.push('textColorBlue');
                    }
                    classNames.push('rightAlign');
                    break;
                default:
                    break;
            }
            if (allowHtml) {
                return evalResult(result, 'div', classNames, nodeContext);
            }
            return result;
        };
    }
};
