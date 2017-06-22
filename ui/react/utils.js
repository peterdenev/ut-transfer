// make errors like key value pairs
export function prepareErrors(errors, currentErrors = {}) {
    let result = currentErrors;
    errors.forEach((error) => {
        if (error.key) {
            let errorKey = error.key[error.key.length - 1]; // only last key
            result[errorKey] = error.errorMessage;
        }
    });

    return result;
};
