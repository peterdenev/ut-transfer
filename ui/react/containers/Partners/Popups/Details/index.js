import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import StandartPopup from 'ut-front-react/components/Popup';
import Text from 'ut-front-react/components/Text';
import EditPopupContent from './EditPopupContent';
import { validateAll } from 'ut-front-react/utils/validator';
import {getValidations} from './../validations';
import {closeDetailsDialog, editPartner, setErrors} from './actions';
import {prepareErrors} from './../../../../utils';

export class Create extends Component {
    constructor(props) {
        super(props);
        this.editPartner = this.editPartner.bind(this);
    }
    getPopupHeader() {
        return {
            text: <Text>Edit Partner</Text>
        };
    }
    editPartner() {
        let validation = validateAll(this.props.partnerData, getValidations());
        if (!validation.isValid) {
            let errors = prepareErrors(validation.errors);
            this.props.setErrors(errors);
        } else {
            let dataToSend = this.props.partnerData.toJS();
            if (dataToSend.serialNumber === '') {
                dataToSend.serialNumber = null;
            }
            this.props.editPartner(dataToSend);
        }
    }
    getPopupFooter() {
        let isEditDisable = this.props.initialPartnerData.equals(this.props.partnerData);
        return {
            actionButtons: [{
                label: 'Save',
                disabled: isEditDisable,
                styleType: 'primaryDialog',
                onClick: this.editPartner
            }, {
                label: 'Close',
                styleType: 'secondaryDialog',
                onClick: this.props.closeDetailsDialog
            }]
        };
    }
    render() {
        return (
            <StandartPopup
              isOpen={this.props.isOpen}
              header={this.getPopupHeader()}
              footer={this.getPopupFooter()}
              closePopup={this.props.closeDetailsDialog}
            >
                <EditPopupContent />
            </StandartPopup>
        );
    }
}

Create.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    partnerData: PropTypes.object,
    initialPartnerData: PropTypes.object,
    closeDetailsDialog: PropTypes.func.isRequired,
    editPartner: PropTypes.func.isRequired,
    setErrors: PropTypes.func.isRequired
};

function mapStateToProps(state, ownProps) {
    return {
        isOpen: state.transferPartnerDetails.get('open'),
        partnerData: state.transferPartnerDetails.get('data'),
        initialPartnerData: state.transferPartnerDetails.get('remoteData')
    };
}

export default connect(
    mapStateToProps,
    {closeDetailsDialog, editPartner, setErrors}
)(Create);
