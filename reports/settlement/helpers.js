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
                case 'deniedCount':
                    result = formatNumber(result);
                    classNames.push('rightAlign');
                    break;
                case 'transferAmount':
                case 'transferFee':
                case 'dueTo':
                    classNames.push('rightAlign');
                    if (!isHeader) {
                        result = formatNumber(result);
                        classNames.push('textColorBlue');
                    }
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
