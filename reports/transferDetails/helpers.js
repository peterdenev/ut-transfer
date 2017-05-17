var {evalResult, formatNumber, formatDate} = require('ut-report/assets/script/common');

module.exports = {
    staticResources: [
        {rel: 'stylesheet', type: 'text/css', href: '/s/ut-transfer/repository/css/reportStyle.css'}
    ],
    transformCellValue: function({allowHtml, nodeContext, dateFormat, locale}) {
        return (value, field, data, isHeader) => {
            var classNames = [];
            var result = value;

            switch (field.name) {
                case 'transferDateTime':
                    if (!isHeader) {
                        if (result) {
                            result = formatDate(result, 'DD-MM-YYYY hh:mm:ss');
                        }
                    }
                    break;
                case 'amountSettlement':
                case 'amountTransaction':
                case 'amountBilling':
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
