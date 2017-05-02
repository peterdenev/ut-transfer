import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './actions';
import {getBatch} from '../../../Payment/Grid/actions';

import Popup from 'ut-front-react/components/Popup';
import TextArea from 'ut-front-react/components/Input/TextArea';
import style from './style.css';

export class RejectBatchPopup extends Component {
    constructor(props) {
        super(props);
        this.onClose = this.onClose.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.handleAddComment = this.handleAddComment.bind(this);
    }

    componentWillMount() {
        this.props.actions.loadBatchStatuses();
    }

    onClose() {
        this.props.actions.closeRejectBatchPopup();
    }

    onSubmit() {
        let {batchId, actorId, comment} = this.props;
        let statusRejected = this.props.batchStatuses.filter((el) => el.name === 'rejected').first().key;
        return this.props.actions.rejectBatch(batchId, actorId, statusRejected, comment)
            .then(() => this.props.actions.closeRejectBatchPopup())
            .then(() => this.props.getBatch({batchId}));
    }

    handleAddComment(comment) {
        this.props.actions.addComment(comment.value);
    }

    getActionButtons() {
        let buttons = [];
        buttons.push({
            label: 'Reject',
            type: 'submit',
            onClick: this.onSubmit,
            className: ['defaultBtn']
        }, {
            label: 'Cancel',
            onClick: this.onClose,
            className: ['defaultBtn']
        });
        return buttons;
    }

    render() {
        return (
            <Popup
              className={style.flexBasis}
              hasOverlay
              isOpen={this.props.isOpen}
              closeOnOverlayClick
              header={{
                  text: 'Reject Batch',
                  closePopup: this.onClose
              }}
              footer={{
                  className: style.footer,
                  actionButtons: this.getActionButtons()
              }}
              closePopup={this.onClose}
            >
                <div className={style.rejectForm}>
                    <div className={style.warning}>Please state a reason for rejecting the Batch</div>
                    <div className={style.reason}>
                        <TextArea label='Enter reason:' className={style.commentTextArea} name='comment' value={this.props.comment}
                          onChange={this.handleAddComment} />
                    </div>
                </div>
            </Popup>
        );
    }
}

RejectBatchPopup.propTypes = {
    actions: PropTypes.object,
    batchId: PropTypes.string,
    isOpen: PropTypes.bool,
    actorId: PropTypes.string,
    comment: PropTypes.string,
    batchStatuses: PropTypes.object,
    getBatch: PropTypes.func
};

RejectBatchPopup.contextTypes = {
    router: PropTypes.object
};

export default connect(
    (state, ownProps) => {
        return {
            actorId: state.login.getIn(['result', 'identity.check', 'actorId']),
            isOpen: !!state.bulkBatchRejectPopup.get('batchId'),
            comment: state.bulkBatchRejectPopup.get('comment'),
            batchStatuses: state.bulkBatchRejectPopup.get('batchStatuses'),
            batchId: state.bulkBatchRejectPopup.get('batchId')
        };
    },
    (dispatch) => {
        return {
            actions: bindActionCreators(actions, dispatch),
            getBatch: bindActionCreators(getBatch, dispatch)
        };
    }
)(RejectBatchPopup);
