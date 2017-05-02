import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as actions from './actions';
import {fetchBatches} from '../../Grid/actions';

import Input from 'ut-front-react/components/Input';
import Popup from 'ut-front-react/components/Popup';
import style from './style.css';

export class BatchDetailPopup extends Component {
    constructor(props) {
        super(props);
        this.onClose = this.onClose.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onClose() {
        this.props.actions.removeDetailItem();
    }

    onSubmit() {
        let {item, actions, fetchBatches} = this.props;
        return actions.saveEditItem(item)
          .then(() => fetchBatches({actorId: this.props.actorId}));
    }

    getActionButtons() {
        let buttons = [];
        if (this.props.canEdit) {
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
                      text: 'Batch Details',
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
                         {/* <div className={style.row}>
                            <span className={style.label}>Filename:</span>
                            <Input value={item.originalFileName} readonly inputWrapClassName={style.inputWrapClassName} />
                            <label htmlFor='batch' className={style.replaceBtn}>Replace</label>
                            <label className={style.downloadBtn}>Download</label>
                        </div>
                        <div className={style.buttonsWrapper}>
                            <div className={style.buttonsInnerWrapper}>
                                <input className={style.inputDisplay} ref='batch' type='file' name='batch' id='batch' accept='text/csv' onChange={() => this.props.actions.changeDetailValue('originalFileName', this.refs.batch.files[0].name)} />
                            </div>
                        </div> */}
                        <div className={style.row}>
                             <Input value={item.name} label='*Batch Name:' readonly={!this.props.canEdit} inputWrapClassName={style.inputWrapClassName} onChange={({value}) => this.props.actions.changeDetailValue('name', value)} />
                        </div>
                        <div className={style.row}>
                            <Input value={item.paymentsCount} label='Number of records:' readonly inputWrapClassName={style.inputWrapClassName} />
                        </div>
                        <div className={style.row}>
                            <Input value={this.context.dateFormat(item.updatedAt, 'MM/DD/YYYY HH:MM')} label='Updated On:' readonly inputWrapClassName={style.inputWrapClassName} />
                        </div>
                    </div>
            </Popup>
        );
    }
}

BatchDetailPopup.propTypes = {
    actions: PropTypes.object,
    fetchBatches: PropTypes.func,
    isOpen: PropTypes.bool,
    item: PropTypes.object,
    actorId: PropTypes.string,
    canEdit: PropTypes.bool
};

BatchDetailPopup.contextTypes = {
    router: PropTypes.object,
    dateFormat: PropTypes.func
};

export default connect(
    (state, ownProps) => {
        return {
            item: state.bulkBatchDetailEditPopup.get('item').toJS(),
            isOpen: !!state.bulkBatchDetailEditPopup.getIn(['item', 'batchId']),
            actorId: state.login.getIn(['result', 'identity.check', 'actorId'])
        };
    },
    (dispatch) => {
        return {
            actions: bindActionCreators(actions, dispatch),
            fetchBatches: bindActionCreators(fetchBatches, dispatch)
        };
    }
)(BatchDetailPopup);
