import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import StandartPopup from 'ut-front-react/components/Popup';
import Text from 'ut-front-react/components/Text';
import CreatePopupContent from './CreatePopupContent';
import { validateAll } from 'ut-front-react/utils/validator';
import {getValidations} from './../validations';
import {closeCreatePartnerPopup, createPartner, setErrors} from './actions';
import {prepareErrors} from './../../../../utils';

export class Create extends Component {
    constructor(props) {
        super(props);
        this.createPartner = this.createPartner.bind(this);
    }
    getPopupHeader() {
        return {
            text: <Text>Create Partner</Text>
        };
    }
    createPartner() {
        let validation = validateAll(this.props.partnerData, getValidations());
        if (!validation.isValid) {
            let errors = prepareErrors(validation.errors);
            this.props.setErrors(errors);
        } else {
            let dataToSend = this.props.partnerData.toJS();
            if (dataToSend.serialNumber === '') {
                dataToSend.serialNumber = null;
            }
            this.props.createPartner(dataToSend);
        }
    }
    getPopupFooter() {
        return {
            actionButtons: [{
                label: 'Create',
                styleType: 'primaryDialog',
                onClick: this.createPartner
            }, {
                label: 'Close',
                styleType: 'secondaryDialog',
                onClick: this.props.closeCreatePartnerPopup
            }]
        };
    }
    render() {
        return (
            <StandartPopup
              isOpen={this.props.isOpen}
              header={this.getPopupHeader()}
              footer={this.getPopupFooter()}
              closePopup={this.props.closeCreatePartnerPopup}
            >
                <CreatePopupContent />
            </StandartPopup>
        );
    }
}

Create.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    partnerData: PropTypes.object,
    closeCreatePartnerPopup: PropTypes.func.isRequired,
    createPartner: PropTypes.func.isRequired,
    setErrors: PropTypes.func.isRequired
};

function mapStateToProps(state, ownProps) {
    return {
        isOpen: state.transferPartnerCreate.get('open'),
        partnerData: state.transferPartnerCreate.get('partnerData')
    };
}

export default connect(
    mapStateToProps,
    {closeCreatePartnerPopup, createPartner, setErrors}
)(Create);
