import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as actions from './actions';

import Input from 'ut-front-react/components/Input';
import Popup from 'ut-front-react/components/Popup';
import DatePicker from 'ut-front-react/components/DatePicker/Simple';
import style from './style.css';

export class PaymentDetailPopup extends Component {
    constructor(props) {
        super(props);
        this.onClose = this.onClose.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.handleFieldChange = this.handleFieldChange.bind(this);
    }

    onClose() {
        this.props.actions.removeDetailItem();
    }

    onSubmit() {
        let {item, actions, actorId} = this.props;
        actions.saveEditItem(item, actorId);
    }

    handleFieldChange(field) {
        return ({value}) => (
            this.props.actions.changeDetailValue(field, value)
        );
    }

    getActionButtons() {
        let buttons = [];
        if (this.props.canEditPayment) {
            buttons.push({
                label: 'Save',
                type: 'submit',
                onClick: this.onSubmit,
                className: ['defaultBtn']
            });
        }
        buttons.push({
            label: 'Cancel',
            onClick: this.onClose,
            className: ['defaultBtn']
        });
        return buttons;
    }

    render() {
        let {item} = this.props;
        return (
                <Popup
                  className={style.flexBasis}
                  hasOverlay
                  isOpen={this.props.isOpen}
                  closeOnOverlayClick
                  header={{
                      text: 'Payment Details',
                      closePopup: this.onClose
                  }}
                  footer={{
                      className: style.footer,
                      actionButtons: this.getActionButtons()
                  }}
                  closePopup={this.onClose}
                >
                    <div className={style.uploadForm}>
                        <div className={style.outerStatus}>
                            <span className={style.innerStatusLabel}>Status:</span>
                            <span className={style.innerStatusSign}>{item.status}</span>
                        </div>
                        <div className={style.row}>
                             <Input value={item.info} label='Comment:' readonly inputWrapClassName={style.inputWrapClassName} placeholder='No comment yet' />
                        </div>
                        <hr />
                        <div className={style.row}>
                            <Input value={item.sequenceNumber} readonly={!this.props.canEditPayment} label='Sequence Number:' onChange={this.handleFieldChange('sequenceNumber')} inputWrapClassName={style.inputWrapClassName} />
                        </div>
                        <div className={style.row}>
                            <Input value={item.identifier} readonly={!this.props.canEditPayment} label='Identifier:' onChange={this.handleFieldChange('identifier')} inputWrapClassName={style.inputWrapClassName} />
                        </div>
                        <div className={style.row}>
                            <Input value={item.firstName} readonly={!this.props.canEditPayment} label='First Name:' onChange={this.handleFieldChange('firstName')} inputWrapClassName={style.inputWrapClassName} />
                        </div>
                        <div className={style.row}>
                            <Input value={item.lastName} readonly={!this.props.canEditPayment} label='Last Name:' onChange={this.handleFieldChange('lastName')} inputWrapClassName={style.inputWrapClassName} />
                        </div>
                        <div className={style.row}>
                            <div className={style.label}>Date of Birth:</div>
                            <div className={style.dateInputWrapper}>
                                <DatePicker defaultValue={new Date(item.dob)} onChange={this.handleFieldChange('dob')} disabled={!this.props.canEditPayment} />
                            </div>
                        </div>
                        <div className={style.row}>
                            <Input value={item.nationalId} readonly={!this.props.canEditPayment} label='National ID:' onChange={this.handleFieldChange('nationalId')} inputWrapClassName={style.inputWrapClassName} />
                        </div>
                        <div className={style.row}>
                            <Input value={item.amount} readonly={!this.props.canEditPayment} label='Amount:' onChange={this.handleFieldChange('amount')} inputWrapClassName={style.inputWrapClassName} />
                        </div>
                    </div>
            </Popup>
        );
    }
}

PaymentDetailPopup.propTypes = {
    actions: PropTypes.object,
    isOpen: PropTypes.bool,
    item: PropTypes.object,
    actorId: PropTypes.string,
    canEditPayment: PropTypes.bool
};

PaymentDetailPopup.contextTypes = {
    router: PropTypes.object
};

export default connect(
    (state, ownProps) => {
        return {
            actorId: state.login.getIn(['result', 'identity.check', 'actorId']),
            item: state.bulkPaymentDetailEditPopup.get('item').toJS(),
            isOpen: !!state.bulkPaymentDetailEditPopup.getIn(['item', 'batchId']),
            canEditPayment: ['new', 'rejected'].includes(state.bulkPaymentGrid.getIn(['batch', 'status'])) &&
                  ownProps.checkPermission('bulk.batch.add')
        };
    },
    (dispatch) => {
        return {
            actions: bindActionCreators(actions, dispatch)
        };
    }
)(PaymentDetailPopup);
