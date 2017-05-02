import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import SimpleGridToolbox from 'ut-front-react/components/SimpleGridToolbox';
import * as actionCreators from './actions';
import {fetchBatchPayments} from '../Grid/actions';
import {setDatailItem} from '../Popups/Details/actions';

import ByCustom from '../Filters/ByCustom';
import ByStatus from '../Filters/ByStatus';
import ByDate from '../Filters/ByDate';
import ClearFilter from '../Filters/ClearFilter';

import style from './style.css';

class GridToolbox extends Component {
    constructor(props) {
        super(props);
        this.handleDisable = this.handleDisable.bind(this);
        this.handleCheckRecords = this.handleCheckRecords.bind(this);
        this.handleDetailClick = this.handleDetailClick.bind(this);
    }

    handleDisable() {
        let statusDisabled = this.props.paymentStatuses.filter((el) => el.name === 'disabled').first().key;
        let payments = this.props.selectedPayments.map((el) => {
            el.paymentStatusId = statusDisabled;
            return el;
        });
        return this.props.actions.disable(payments, this.props.actorId)
            .then(() => this.props.fetchBatchPayments({batchId: this.props.batchId}));
    }

    handleCheckRecords() {
        let async = this.props.selectedPayments.length > 10;
        return this.props.actions.checkPayments({
            payments: this.props.selectedPayments.map((el) => parseInt(el.paymentId)),
            batchId: this.props.batchId,
            actorId: this.props.actorId,
            async: async
        }).then(() => {
            if (async) {
                //
            } else {
                this.props.fetchBatchPayments({batchId: this.props.batchId});
            }
            return true;
        });
    }

    handleDetailClick() {
        this.props.setDatailItem(this.props.selectedPayments[0]);
    }

    render() {
        let canCheck = (['new', 'rejected'].includes(this.props.batchStatus) && this.context.checkPermission('bulk.batch.add')) ||
                        (['ready'].includes(this.props.batchStatus) && this.context.checkPermission('bulk.batch.pay'));
        let canDisable = ['new', 'rejected'].includes(this.props.batchStatus) &&
                            this.props.checkedRows.find((element) => {
                                return element.status === 'disabled';
                            }) === undefined &&
                            this.context.checkPermission('bulk.batch.add');
        let toggle = this.props.isTitleLink ? this.props.actions.toggle : null;
        let disableButton = !this.props.selectedPayments.length || !this.props.actorId;
        return (
            <span>
                <SimpleGridToolbox opened={this.props.filtersOpened} title='Filter By' isTitleLink={this.props.isTitleLink} toggle={toggle}>
                        <div className={style.filterWrap}>
                            <ByCustom className={style.customInput} />
                            <ByStatus className={style.standardFilter} />
                            <ByDate className={style.standardFilter} />
                            <ClearFilter show={this.props.showClearFilter} />
                        </div>
                    </SimpleGridToolbox>
                    <SimpleGridToolbox opened={this.props.buttonsOpened} title='Show Filters' isTitleLink toggle={this.props.actions.toggle}>
                        <div className={style.buttonWrap}>
                            <button onClick={this.handleDetailClick} disabled={!this.props.canViewDetails} className='button btn btn-primary'>Details</button>
                            <button onClick={this.handleDisable} className='button btn btn-primary' disabled={!canDisable}>
                                Disable
                            </button>
                            <button onClick={this.handleCheckRecords} disabled={disableButton || !canCheck} className='button btn btn-primary'>
                                Check Records
                            </button>
                        </div>
                    </SimpleGridToolbox>
            </span>
        );
    }
}

GridToolbox.contextTypes = {
    checkPermission: PropTypes.func.isRequired
};

GridToolbox.propTypes = {
    checkedRows: PropTypes.array,
    actions: PropTypes.object,
    fetchBatchPayments: PropTypes.func,
    filtersOpened: PropTypes.bool,
    buttonsOpened: PropTypes.bool,
    showClearFilter: PropTypes.bool,
    actorId: PropTypes.string,
    batchId: PropTypes.string,
    selectedPayments: PropTypes.arrayOf(PropTypes.object),
    paymentStatuses: PropTypes.object,
    setDatailItem: PropTypes.func,
    isTitleLink: PropTypes.bool,
    canViewDetails: PropTypes.bool,
    batchStatus: PropTypes.string
};

export default connect(
        (state, ownProps) => {
            return {
                checkedRows: state.bulkPaymentGrid.get('checkedRows').toArray(),
                filtersOpened: state.bulkPaymentToolbox.getIn(['filters', 'opened']),
                buttonsOpened: state.bulkPaymentToolbox.getIn(['buttons', 'opened']),
                showClearFilter: state.bulkPaymentFilterStatus.get('changeId') +
                    state.bulkPaymentFilterDate.get('changeId') +
                    state.bulkPaymentFilterCustom.get('changeId') > 0,
                actorId: state.login.getIn(['result', 'identity.check', 'actorId']),
                selectedPayments: state.bulkPaymentGrid.get('checkedRows').toArray(),
                paymentStatuses: state.bulkPaymentFilterStatus.get('paymentStatus'),
                isTitleLink: state.bulkPaymentGrid.get('checkedRows').size > 0,
                canViewDetails: state.bulkPaymentGrid.get('checkedRows').size === 1,
                batchStatus: state.bulkPaymentGrid.getIn(['batch', 'status'])
            };
        },
        (dispatch) => {
            return {
                actions: bindActionCreators(actionCreators, dispatch),
                fetchBatchPayments: bindActionCreators(fetchBatchPayments, dispatch),
                setDatailItem: bindActionCreators(setDatailItem, dispatch)
            };
        }
)(GridToolbox);
