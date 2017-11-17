var {evalResult, formatNumber, formatDate} = require('ut-report/assets/script/common');

module.exports = {
    transformCellValue: function({allowHtml, nodeContext, dateFormat, locale}) {
        return (value, field, data, isHeader) => {
            var classNames = ['cell'];
            var result = value;

            switch (field.name) {
                case 'transferDateTime':
                    if (!isHeader) {
                        if (value) {
                            result = formatDate(value, 'DD-MM-YYYY hh:mm:ss');
                        }
                    }
                    break;
                case 'amountSettlement':
                case 'amountTransaction':
                case 'amountBilling':
                case 'transferAmount':
                    if (!isHeader) {
                        result = formatNumber(value.toString().replace(/\s\%$/, '')); // format & remove '%'
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
