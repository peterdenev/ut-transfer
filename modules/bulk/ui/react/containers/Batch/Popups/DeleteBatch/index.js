import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './actions';

import Popup from 'ut-front-react/components/Popup';
import TextArea from 'ut-front-react/components/Input/TextArea';
import style from './style.css';

export class DeleteBatchPopup extends Component {
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
        this.props.actions.closeDeletePopup();
    }

    onSubmit() {
        let {batchId, actorId, comment} = this.props;
        let statusDeleted = this.props.batchStatuses.filter((el) => el.name === 'deleted').first().key;
        return this.props.actions.deleteBatch(batchId, actorId, statusDeleted, comment).then(() => this.props.actions.closeDeletePopup());
    }

    handleAddComment(comment) {
        this.props.actions.addComment(comment.value);
    }

    getActionButtons() {
        let buttons = [];
        buttons.push({
            label: 'Delete',
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
                  text: 'Delete Batch',
                  closePopup: this.onClose
              }}
              footer={{
                  className: style.footer,
                  actionButtons: this.getActionButtons()
              }}
              closePopup={this.onClose}
            >
                <div className={style.deleteForm}>
                    <div className={style.warning}>If you delete the batch - it can not be restored.</div>
                    <div className={style.reason}>
                        <TextArea label='Enter reason:' className={style.commentTextArea} name='comment' value={this.props.comment}
                          onChange={this.handleAddComment} />
                    </div>
                </div>
            </Popup>
        );
    }
}

DeleteBatchPopup.propTypes = {
    actions: PropTypes.object,
    batchId: PropTypes.number,
    isOpen: PropTypes.bool,
    actorId: PropTypes.string,
    comment: PropTypes.string,
    batchStatuses: PropTypes.object
};

DeleteBatchPopup.contextTypes = {
    router: PropTypes.object
};

export default connect(
    (state, ownProps) => {
        return {
            actorId: state.login.getIn(['result', 'identity.check', 'actorId']),
            isOpen: !!state.bulkBatchDeletePopup.get('batchId'),
            comment: state.bulkBatchDeletePopup.get('comment'),
            batchStatuses: state.bulkBatchDeletePopup.get('batchStatuses'),
            batchId: state.bulkBatchDeletePopup.get('batchId')
        };
    },
    (dispatch) => {
        return {
            actions: bindActionCreators(actions, dispatch)
        };
    }
)(DeleteBatchPopup);
