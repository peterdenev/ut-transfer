var path = require('path');
module.exports = ({transferTest}) => ({
    schema: [
        {path: path.join(__dirname, 'seed'), linkSP: true},
        transferTest && {path: path.join(__dirname, 'test'), linkSP: true}
    ]
});
