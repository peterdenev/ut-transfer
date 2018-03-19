const formatNumber = (number) => {
    return number && number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
};

module.exports = {
    formatNumber
};
