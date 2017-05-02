import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {Link} from 'react-router';

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
        this.handleCellClick = this.handleCellClick.bind(this);
        this.handleReload = this.handleReload.bind(this);
    }

    componentWillMount() {
        this.props.actions.fetchBatches({actorId: this.props.filterBy.actorId});
    }

    componentWillReceiveProps(nextProps) {
        let {changeId} = this.props;
        if (nextProps.changeId !== changeId) {
            let filterBy = nextProps.filterBy;
            this.removeNullPropertiesFromObject(filterBy);
            this.props.actions.fetchBatches(filterBy);
        }
    }

    removeNullPropertiesFromObject(obj) {
        return Object.keys(obj).forEach((key) =>
                    (obj[key] === '' || obj[key] === '__placeholder__' || obj[key] === undefined || obj[key] === null || obj[key] === 0) && delete obj[key]);
    }

    handleCellClick(row, field, value) {
        let {checkedRow, showToolbox, actions} = this.props;
        row.batchId === checkedRow.batchId ? showToolbox('filters') : this.props.showToolbox('button');
        return actions.checkRow(row);
    }

    handleOrder(result) {}

    handleTransformCellValue(value, field, data, isHeader) {
        if (field.name === 'name' && !isHeader) {
            return (<Link to={'/bulk/batch/' + data.batchId}>{value}</Link>);
        } else if ((field.name === 'createdAt' || field.name === 'lastValidation') && !isHeader && value) {
            return (<DateFormatter format='MM/DD/YYYY HH:MM'>{value}</DateFormatter>);
        }
        return value;
    }

    handleReload() {
        let filterBy = this.props.filterBy;
        this.removeNullPropertiesFromObject(filterBy);
        this.props.actions.fetchBatches(filterBy);
    }

    render() {
        return (
            <SimpleGrid
              handleCellClick={this.handleCellClick}
              emptyRowsMsg={<Text>No result</Text>}
              handleOrder={this.handleOrder}
              rowsChecked={[this.props.checkedRow]}
              fields={[
                  {name: 'name', title: 'Batch Name'},
                  {name: 'paymentsCount', title: 'Number of Records'},
                  {name: 'createdAt', title: 'Uploaded On'},
                  {name: 'lastValidation', title: 'Last Validation On'},
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
              data={this.props.batches}
              externalStyle={style}
            />
        );
    }
};

Grid.contextTypes = {
    router: PropTypes.object
};

Grid.propTypes = {
    batches: PropTypes.arrayOf(PropTypes.object),
    actions: PropTypes.object,
    changeId: PropTypes.number,
    checkedRow: PropTypes.object,
    showToolbox: PropTypes.func,
    filterBy: PropTypes.object
};

export default connect(
        (state) => {
            return {
                batches: state.bulkBatchGrid.get('fetchBatches').toArray(),
                changeId: state.bulkBatchFilterName.get('changeId') +
                    state.bulkBatchFilterStatus.get('changeId') +
                    state.bulkBatchFilterDate.get('changeId') +
                    state.bulkBatchDeletePopup.get('changeId'),
                filterBy: {
                    name: state.bulkBatchFilterName.get('batchName'),
                    batchStatusId: state.bulkBatchFilterStatus.get('statusId'),
                    fromDate: state.bulkBatchFilterDate.get('startDate'),
                    toDate: state.bulkBatchFilterDate.get('endDate'),
                    actorId: state.login.getIn(['result', 'identity.check', 'actorId'])
                },
                checkedRow: state.bulkBatchGrid.get('checkedRow').toJS()
            };
        },
        (dispatch) => {
            return {
                actions: bindActionCreators(actionCreators, dispatch),
                showToolbox: bindActionCreators(showToolbox, dispatch)
            };
        }
)(Grid);
