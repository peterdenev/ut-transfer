import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Text from 'ut-front-react/components/Text';
import Input from 'ut-front-react/components/Input';
import DatePicker from 'ut-front-react/components/DatePicker/Simple';
import {nameValidation, portValidation, modeValidation, settlementAccountValidation, feeAccountValidation, commissionAccountValidation, serialNumberValidation} from './../validations';
import {changeField} from './actions';
import style from './../style.css';

export class EditPopupContent extends Component {
    handleInputChange(fieldName) {
        return (data) => {
            this.props.changeField(fieldName, data.value, data);
        };
    }
    handleDateChange(field) {
        return (date) => {
            this.props.changeField(field, date.value);
        };
    }
    render() {
        return (
            <div>
                <Input
                    value={this.props.partnerId}
                    label={<Text>Partner Id</Text>}
                    boldLabel
                    readonly
                    wrapperClassName={`${style.inputPaddings} ${style.inputBorderBottom}`}
                />
                <Input
                    value={this.props.name}
                    label={<Text>Name</Text>}
                    placeholder={'Please enter name'}
                    onChange={this.handleInputChange('name')}
                    keyProp='name'
                    boldLabel
                    wrapperClassName={`${style.inputPaddings} ${style.inputBorderBottom}`}
                    validators={nameValidation.rules}
                    isValid={this.props.errors.get('name') === undefined}
                    errorMessage={this.props.errors.get('name')}
                />
                <Input
                    value={this.props.port}
                    label={<Text>Port</Text>}
                    placeholder={'Please enter port'}
                    onChange={this.handleInputChange('port')}
                    keyProp='port'
                    boldLabel
                    wrapperClassName={`${style.inputPaddings} ${style.inputBorderBottom}`}
                    validators={portValidation.rules}
                    isValid={this.props.errors.get('port') === undefined}
                    errorMessage={this.props.errors.get('port')}
                />
                <Input
                    value={this.props.mode}
                    label={<Text>Mode</Text>}
                    placeholder={'Please enter mode'}
                    onChange={this.handleInputChange('mode')}
                    keyProp='mode'
                    boldLabel
                    wrapperClassName={`${style.inputPaddings} ${style.inputBorderBottom}`}
                    validators={modeValidation.rules}
                    isValid={this.props.errors.get('mode') === undefined}
                    errorMessage={this.props.errors.get('mode')}
                />
                <DatePicker
                    defaultValue={this.props.settlementDate}
                    label={'Settlement Date'}
                    boldLabel
                    withVerticalClass
                    wrapperClassName={`${style.inputPaddings} ${style.inputBorderBottom}`}
                    // locale={filterElement.locale}
                    onChange={this.handleDateChange('settlementDate')}
                    isValid={this.props.errors.get('settlementDate') === undefined}
                    errorMessage={this.props.errors.get('settlementDate')}
                />
                <Input
                    value={this.props.settlementAccount}
                    label={<Text>Settlement Account</Text>}
                    placeholder={'Please enter settlement account'}
                    onChange={this.handleInputChange('settlementAccount')}
                    keyProp='settlementAccount'
                    boldLabel
                    wrapperClassName={`${style.inputPaddings} ${style.inputBorderBottom}`}
                    validators={settlementAccountValidation.rules}
                    isValid={this.props.errors.get('settlementAccount') === undefined}
                    errorMessage={this.props.errors.get('settlementAccount')}
                />
                <Input
                    value={this.props.feeAccount}
                    label={<Text>Fee Account</Text>}
                    placeholder={'Please enter fee account'}
                    onChange={this.handleInputChange('feeAccount')}
                    keyProp='feeAccount'
                    boldLabel
                    wrapperClassName={`${style.inputPaddings} ${style.inputBorderBottom}`}
                    validators={feeAccountValidation.rules}
                    isValid={this.props.errors.get('feeAccount') === undefined}
                    errorMessage={this.props.errors.get('feeAccount')}
                />
                <Input
                    value={this.props.commissionAccount}
                    label={<Text>Commission Account</Text>}
                    placeholder={'Please enter commission account'}
                    onChange={this.handleInputChange('commissionAccount')}
                    keyProp='commissionAccount'
                    boldLabel
                    wrapperClassName={`${style.inputPaddings} ${style.inputBorderBottom}`}
                    validators={commissionAccountValidation.rules}
                    isValid={this.props.errors.get('commissionAccount') === undefined}
                    errorMessage={this.props.errors.get('commissionAccount')}
                />
                <Input
                    value={this.props.serialNumber}
                    label={<Text>Serial Number</Text>}
                    placeholder={'Please enter serial number'}
                    onChange={this.handleInputChange('serialNumber')}
                    keyProp='serialNumber'
                    boldLabel
                    wrapperClassName={`${style.inputPaddings} ${style.inputBorderBottom}`}
                    validators={serialNumberValidation.rules}
                    isValid={this.props.errors.get('serialNumber') === undefined}
                    errorMessage={this.props.errors.get('serialNumber')}
                />
            </div>
        );
    }
}

EditPopupContent.propTypes = {
    partnerId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    port: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    settlementDate: PropTypes.string,
    settlementAccount: PropTypes.string,
    feeAccount: PropTypes.string,
    commissionAccount: PropTypes.string,
    serialNumber: PropTypes.string,
    errors: PropTypes.object.isRequired,
    changeField: PropTypes.func.isRequired
};

function mapStateToProps(state, ownProps) {
    return {
        partnerId: state.transferPartnerDetails.getIn(['data', 'partnerId']),
        name: state.transferPartnerDetails.getIn(['data', 'name']),
        port: state.transferPartnerDetails.getIn(['data', 'port']),
        mode: state.transferPartnerDetails.getIn(['data', 'mode']),
        settlementDate: state.transferPartnerDetails.getIn(['data', 'settlementDate']),
        settlementAccount: state.transferPartnerDetails.getIn(['data', 'settlementAccount']),
        feeAccount: state.transferPartnerDetails.getIn(['data', 'feeAccount']),
        commissionAccount: state.transferPartnerDetails.getIn(['data', 'commissionAccount']),
        serialNumber: state.transferPartnerDetails.getIn(['data', 'serialNumber']),
        errors: state.transferPartnerDetails.getIn(['errors'])
    };
}

export default connect(
    mapStateToProps,
    {changeField}
)(EditPopupContent);
