import { validationTypes, textValidations } from 'ut-front-react/validator/constants.js';

export function getValidations() {
    return [
        partnerIdValidation,
        nameValidation,
        portValidation,
        modeValidation,
        settlementDateValidation,
        settlementAccountValidation,
        feeAccountValidation,
        commissionAccountValidation,
        serialNumberValidation
    ];
}

export const partnerIdValidation = {
    key: ['partnerId'],
    type: validationTypes.text,
    rules: [
        {type: textValidations.isRequired, errorMessage: 'Partner Id is required.'},
        {type: textValidations.length, minVal: 2, maxVal: 50, errorMessage: 'Partner Id should be between 2 and 50 symbols long.'}
    ]
};

export const nameValidation = {
    key: ['name'],
    type: validationTypes.text,
    rules: [
        {type: textValidations.isRequired, errorMessage: 'Name is required.'},
        {type: textValidations.length, minVal: 2, maxVal: 50, errorMessage: 'Name should be between 2 and 50 symbols long.'}
    ]
};

export const portValidation = {
    key: ['port'],
    type: validationTypes.text,
    rules: [
        {type: textValidations.isRequired, errorMessage: 'Port is required.'},
        {type: textValidations.length, minVal: 2, maxVal: 50, errorMessage: 'Port should be between 2 and 50 symbols long.'}
    ]
};

export const modeValidation = {
    key: ['mode'],
    type: validationTypes.text,
    rules: [
        {type: textValidations.isRequired, errorMessage: 'Mode is required.'},
        {type: textValidations.length, minVal: 2, maxVal: 20, errorMessage: 'Mode should be between 2 and 20 symbols long.'}
    ]
};

export const settlementDateValidation = {
    key: ['settlementDate'],
    type: validationTypes.text,
    rules: [
        // {type: textValidations.isRequired, errorMessage: 'Settlement Date is required.'},
        {type: textValidations.length, minVal: 2, maxVal: 30, errorMessage: 'Settlement Date is invalid'}
    ]
};

export const settlementAccountValidation = {
    key: ['settlementAccount'],
    type: validationTypes.text,
    rules: [
        // {type: textValidations.isRequired, errorMessage: 'Settlement Account is required.'},
        {type: textValidations.length, minVal: 2, maxVal: 50, errorMessage: 'Settlement Account should be between 2 and 50 symbols long.'}
    ]
};

export const feeAccountValidation = {
    key: ['feeAccount'],
    type: validationTypes.text,
    rules: [
        // {type: textValidations.isRequired, errorMessage: 'Fee Account is required.'},
        {type: textValidations.length, minVal: 2, maxVal: 50, errorMessage: 'Fee Account should be between 2 and 50 symbols long.'}
    ]
};

export const commissionAccountValidation = {
    key: ['commissionAccount'],
    type: validationTypes.text,
    rules: [
        // {type: textValidations.isRequired, errorMessage: 'Commission Account is required.'},
        {type: textValidations.length, minVal: 2, maxVal: 50, errorMessage: 'Commission Account should be between 2 and 50 symbols long.'}
    ]
};

export const serialNumberValidation = {
    key: ['serialNumber'],
    type: validationTypes.text,
    rules: [
        {type: textValidations.numberOnly, errorMessage: 'Please enter a number.'},
        {type: textValidations.length, minVal: 1, maxVal: 4, errorMessage: 'Serial number should be between 1 and 9999.'}
    ]
};
