import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import Text from 'ut-front-react/components/Text';
import DateFormatter from 'ut-front-react/containers/DateFormatter';
import {SimpleGrid} from 'ut-front-react/components/SimpleGrid';
import * as actionCreators from './actions';
import {show as showToolbox} from '../GridToolbox/actions';

import style from './style.css';

class Grid extends Component {
    constructor(props) {
        super(props);
        this.handleTransformCellValue = this.handleTransformCellValue.bind(this);
        this.handleCheckboxSelect = this.handleCheckboxSelect.bind(this);
        this.handleHeaderCheckboxSelect = this.handleHeaderCheckboxSelect.bind(this);
        this.handleCellClick = this.handleCellClick.bind(this);
        this.handleToolbarUpdate = this.handleToolbarUpdate.bind(this);
        this.handleReload = this.handleReload.bind(this);
    }

    componentWillMount() {
        this.props.actions.fetchBatchPayments({batchId: this.context.router.params.batchId});
        this.props.actions.getBatch({batchId: this.context.router.params.batchId});
    }

    componentWillReceiveProps(nextProps) {
        let {changeId} = this.props;
        if (nextProps.changeId !== changeId) {
            let filterBy = nextProps.filterBy;
            if (filterBy.custom && filterBy.custom.field) {
                filterBy[filterBy.custom.field] = filterBy.custom.value;
            }
            filterBy['batchId'] = this.context.router.params.batchId;
            this.removeNullPropertiesFromObject(filterBy);
            this.props.actions.fetchBatchPayments(filterBy);
        }
    }

    removeNullPropertiesFromObject(obj) {
        return Object.keys(obj).forEach((key) =>
          (obj[key] === '' || obj[key] === '__placeholder__' || obj[key] === undefined || obj[key] === null || obj[key] === 0 || obj[key].length === 0 || (obj[key].length && obj[key][0] === '__placeholder__')) && delete obj[key]);
    }

    handleToolbarUpdate() {
        this.props.checkedRows.length > 0 ? this.props.showToolbox('button') : this.props.showToolbox('filters');
    }

    handleCellClick(row, field, value) {
        return new Promise((resolve, reject) => {
            this.props.actions.selectRow(row);
            return resolve();
        }).then(() => {
            return this.handleToolbarUpdate();
        });
    }

    handleOrder(result) {}

    handleTransformCellValue(value, field, data, isHeader) {
        if (field.name === 'dob' && !isHeader && value) {
            return (<DateFormatter>{value}</DateFormatter>);
        }
        return value;
    }

    handleCheckboxSelect(isSelected, data) {
        return new Promise((resolve, reject) => {
            isSelected ? this.props.actions.uncheckRow(data) : this.props.actions.checkRow(data);
            return resolve(!isSelected);
        }).then((isSelected) => {
            this.handleToolbarUpdate();
            return isSelected;
        });
    }

    handleHeaderCheckboxSelect(isSelected) {
        return new Promise((resolve, reject) => {
            this.props.actions.checkAll(this.props.data);
            return resolve();
        }).then(() => {
            return this.handleToolbarUpdate();
        });
    }

    handleReload() {
        let filterBy = this.props.filterBy;
        filterBy['batchId'] = this.context.router.params.batchId;
        this.removeNullPropertiesFromObject(filterBy);
        this.props.actions.fetchBatchPayments(filterBy);
    }

    render() {
        return (
            <SimpleGrid
              multiSelect
              handleCellClick={this.handleCellClick}
              emptyRowsMsg={<Text>No result</Text>}
              handleOrder={function() {}}
              handleCheckboxSelect={this.handleCheckboxSelect}
              handleHeaderCheckboxSelect={this.handleHeaderCheckboxSelect}
              fields={[
                  {name: 'sequenceNumber', title: 'Sequence Number'},
                  {name: 'identifier', title: 'Identifier'},
                  {name: 'firstName', title: 'First Name'},
                  {name: 'lastName', title: 'Last Name'},
                  {name: 'dob', title: 'Date of Birth'},
                  {name: 'nationalId', title: 'National ID'},
                  {name: 'amount', title: 'Amount'},
                  {name: 'status', title: 'Status'},
                  {
                      name: 'refresh',
                      title: (
                        <svg onClick={this.handleReload} viewBox='0 0 24 24' style={{display: 'inline-block', color: 'rgba(0, 0, 0, 0.870588)', fill: 'currentcolor', userSelect: 'none', transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'}}>
                            <path d='M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z' />
                        </svg>
                      )
                  }
              ]}
              transformCellValue={this.handleTransformCellValue}
              data={this.props.data}
              rowsChecked={this.props.checkedRows}
              externalStyle={style}
            />
        );
    }
};

Grid.contextTypes = {
    router: PropTypes.object
};

Grid.propTypes = {
    actions: PropTypes.object,
    data: PropTypes.arrayOf(PropTypes.object),
    changeId: PropTypes.number,
    showToolbox: PropTypes.func,
    checkedRows: PropTypes.arrayOf(PropTypes.object),
    filterBy: PropTypes.object
};

export default connect(
        (state) => {
            return {
                data: state.bulkPaymentGrid.get('data').toArray(),
                changeId: state.bulkPaymentFilterStatus.get('changeId') +
                    state.bulkPaymentFilterDate.get('changeId') +
                    state.bulkPaymentFilterCustom.get('changeId') +
                    state.bulkPaymentDetailEditPopup.get('changeId'),
                filterBy: {
                    paymentStatusId: state.bulkPaymentFilterStatus.get('statusId'),
                    date: state.bulkPaymentFilterDate.get('selectedDate'),
                    custom: {field: state.bulkPaymentFilterCustom.get('field'), value: state.bulkPaymentFilterCustom.get('value')}
                },
                checkedRows: state.bulkPaymentGrid.get('checkedRows').toList().toArray(),
                batch: state.bulkPaymentGrid.get('batch')
            };
        },
        (dispatch) => {
            return {
                actions: bindActionCreators(actionCreators, dispatch),
                showToolbox: bindActionCreators(showToolbox, dispatch)
            };
        }
)(Grid);
