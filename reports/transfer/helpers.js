var {evalResult, formatNumber} = require('ut-report/assets/script/common');

module.exports = {
    transformCellValue: function({dateFormat, allowHtml, nodeContext}) {
        return function(value, field, data, isHeader) {
            var classNames = ['cell'];
            var result = value;

            if (field.name === 'transferAmount') {
                if (!isHeader) {
                    result = formatNumber(value);
                    classNames.push('textColorBlue');
                }
                classNames.push('rightAlign');
            }

            if (!isHeader && data.style) {
                classNames.push(data.style);
            }

            if (allowHtml) {
                return evalResult(result, 'div', classNames, nodeContext);
            }
            return result;
        };
    }
};
