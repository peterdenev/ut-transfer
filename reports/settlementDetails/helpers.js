var {evalResult, formatNumber} = require('ut-report/assets/script/common');

module.exports = {
    transformCellValue: function({allowHtml, nodeContext, dateFormat, locale}) {
        return (value, field, data, isHeader) => {
            var classNames = ['cell'];
            var result = value;
            switch (field.name) {
                case 'transferAmount':
                case 'transferFee':
                    if (!isHeader) {
                        result = formatNumber(value);
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
