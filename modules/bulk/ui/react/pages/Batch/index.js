import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';
import {getLink} from 'ut-front/react/routerHelper';
import { AddTab } from 'ut-front-react/containers/TabMenu';
import classnames from 'classnames';

import GridToolbox from '../../containers/Batch/GridToolbox';
import Header from 'ut-front-react/components/PageLayout/Header';

import Grid from '../../containers/Batch/Grid';
import DetailEdit from '../../containers/Batch/Popups/Details';

import mainStyle from 'ut-front-react/assets/index.css';
import style from '../style.css';

import UploadForm from '../../containers/UploadForm';
import DeleteBatch from '../../containers/Batch/Popups/DeleteBatch';
import {fetchBatches} from '../../containers/Batch/Grid/actions';

class BulkBatch extends Component {
    constructor(props, context) {
        super(props, context);
        this.toggleUploadPopup = this.toggleUploadPopup.bind(this);
        this.openUploadFile = this.openUploadFile.bind(this);
        this.getHeaderButtons = this.getHeaderButtons.bind(this);
        this.state = {
            uploadPopup: false
        };
    }

    toggleUploadPopup(refresh) {
        this.setState({
            uploadPopup: !this.state.uploadPopup
        });
        if (refresh === true) {
            this.props.fetchBatches({actorId: this.props.actorId});
        }
    }
    openUploadFile() {

    }
    getHeaderButtons() {
        let buttons = [];
        this.context.checkPermission('bulk.batch.add') && buttons.push({text: 'Upload Batch', onClick: this.toggleUploadPopup});
        return buttons;
    }

    render() {
        let canEdit = this.props.canEditByStatus && this.context.checkPermission('bulk.batch.add');
        return (
        <div className={mainStyle.contentTableWrap} style={{minWidth: '925px'}}>
                <AddTab pathname={getLink('ut-transfer:bulkBatch')} title='Bulk Payments' />
                <div>
                        <Header text='Bulk Payments - Batch' buttons={this.getHeaderButtons()} />
                </div>
                <div className={classnames(mainStyle.actionBarWrap, style.actionBarWrap)}>
                    <GridToolbox batchId={this.props.checkedRow.batchId} />
                </div>
                <div className={classnames(mainStyle.tableWrap, style.tableWrap)}>
                        <div className={style.grid}>
                            <Grid />
                        </div>
                </div>
                {this.state.uploadPopup &&
                    <UploadForm
                      onClose={this.toggleUploadPopup}
                    />
                }
                <DeleteBatch />
                <DetailEdit canEdit={canEdit} />
        </div>
        );
    }
}

BulkBatch.propTypes = {
    fetchBatches: PropTypes.func,
    checkedRow: PropTypes.object,
    actorId: PropTypes.string,
    canEditByStatus: PropTypes.bool
};

BulkBatch.contextTypes = {
    checkPermission: PropTypes.func.isRequired
};

export default connect(
    (state, ownProps) => {
        return {
            checkedRow: state.bulkBatchGrid.get('checkedRow').toJS(),
            actorId: state.login.getIn(['result', 'identity.check', 'actorId']),
            canEditByStatus: ['new', 'rejected'].includes(state.bulkBatchDetailEditPopup.getIn(['item', 'status']))
        };
    },
    {
        fetchBatches
    }
)(BulkBatch);
