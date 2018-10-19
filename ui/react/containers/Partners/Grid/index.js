import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import immutable from 'immutable';
import { fetchPartners, setVisibleColumns, toggleVisibleColumn, checkPartner, multiCheck, cleanAndCheck } from './actions';
import { fetchPartnerDetails } from './../Popups/Details/actions';
import {order} from './../Order/actions';
import { showButtons as showToolboxButtons, showFilters as showToolboxFilters } from './../GridToolbox/actions';

import {SimpleGrid} from 'ut-front-react/components/SimpleGrid';
import DateFormatter from 'ut-front-react/containers/DateFormatter';
import Text from 'ut-front-react/components/Text';

import mainStyle from 'ut-front-react/assets/index.css';
import style from './style.css';

class Grid extends Component {
    constructor(props) {
        super(props);
        this.handleOrder = this.handleOrder.bind(this);
        this.handleCheckboxSelect = this.handleCheckboxSelect.bind(this);
        this.handleCheckboxSelectAll = this.handleCheckboxSelectAll.bind(this);
        this.getDetails = this.getDetails.bind(this);
        this.handleTransformCellValue = this.handleTransformCellValue.bind(this);
    }

    componentWillMount() {
        this.props.setVisibleColumns();
        this.props.fetchPartners(this.props.filterValues, this.props.orderBy, this.props.paging);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.changeId !== nextProps.changeId) {
            let paging = nextProps.paging;
            if (this.props.paginationChangeId === nextProps.paginationChangeId) {
                paging = {...nextProps.paging, pageNumber: 1};
            }
            this.props.fetchPartners(nextProps.filterValues, nextProps.orderBy, paging);
        } else if (this.props.checkedRowsChangeId !== nextProps.checkedRowsChangeId) {
            if (nextProps.checkedRows.size > 0) {
                this.props.showToolboxButtons();
            } else {
                this.props.showToolboxFilters();
            }
        }
    }
    handleOrder(result) {
        this.props.order(result.field, result.new);
    }
    handleCheckboxSelect(currentState, row, idx) {
        this.props.checkPartner(idx, row, currentState);
    }
    handleCheckboxSelectAll(currentState) {
        this.props.multiCheck(currentState);
    }
    getDetails(record, field, value, recordIndex) {
        if (field.name === 'partnerId' && this.context.checkPermission('transfer.partner.get')) {
            this.props.fetchPartnerDetails(record.partnerId);
        } else {
            this.props.cleanAndCheck(recordIndex, record, false);
        }
    }
    handleTransformCellValue(value, field, data, isHeader) {
        if (isHeader) {
            return <Text>{value}</Text>;
        } else {
            if (field.name === 'partnerId') {
                return (<a> {value} </a>);
            } else if (field.name === 'settlementDate') {
                return (<DateFormatter>{value}</DateFormatter>);
            }
        }

        return value;
    }
    render() {
        let { partners, config } = this.props;
        return (
            <div>
                <div className={mainStyle.tableWrap} id={style.usersGrid}>
                    <SimpleGrid
                        multiSelect
                        globalMenu
                        emptyRowsMsg={<Text>No result</Text>}
                        handleCheckboxSelect={this.handleCheckboxSelect}
                        handleHeaderCheckboxSelect={this.handleCheckboxSelectAll}
                        fields={this.props.fields.filter((f) => (config.getIn(['grid', 'fields']).indexOf(f.name) >= 0))}
                        toggleColumnVisibility={this.props.toggleVisibleColumn}
                        orderBy={config.getIn(['grid', 'orderByFields']).toJS()}
                        handleOrder={this.handleOrder}
                        handleCellClick={this.getDetails}
                        data={partners.toJS()}
                        rowsChecked={this.props.checkedRows.toList().toJS()}
                        transformCellValue={this.handleTransformCellValue}
                    />
                </div>
            </div>
        );
    }
}

Grid.propTypes = {
    partners: PropTypes.object.isRequired,
    checkedRows: PropTypes.object.isRequired,
    checkedRowsChangeId: PropTypes.number,
    changeId: PropTypes.number.isRequired,
    paginationChangeId: PropTypes.number.isRequired,
    filterValues: PropTypes.object,
    orderBy: PropTypes.array,
    fields: PropTypes.array,
    paging: PropTypes.object,
    config: PropTypes.object,
    fetchPartners: PropTypes.func.isRequired,
    setVisibleColumns: PropTypes.func.isRequired,
    toggleVisibleColumn: PropTypes.func.isRequired,

    checkPartner: PropTypes.func.isRequired,
    multiCheck: PropTypes.func.isRequired,
    cleanAndCheck: PropTypes.func.isRequired,
    fetchPartnerDetails: PropTypes.func.isRequired,
    order: PropTypes.func.isRequired,
    showToolboxButtons: PropTypes.func.isRequired,
    showToolboxFilters: PropTypes.func.isRequired
};

Grid.contextTypes = {
    checkPermission: PropTypes.func
};

function mapStateToProps(state, ownProps) {
    let changeId = state.transferPartnersPagination.get('changeId') +
            state.transferPartnersGridOrder.get('changeId') +
            state.transferPartnerFilterByCustomSearch.get('changeId') +
            state.transferPartnerFilterClear.get('changeId') +
            state.transferPartnerCreate.get('changeId') +
            state.transferPartnerDetails.get('changeId');

    let filterValues = {};

    if (state.transferPartnerFilterByCustomSearch.get('field')) {
        filterValues[state.transferPartnerFilterByCustomSearch.get('field')] = ((state.transferPartnerFilterByCustomSearch.get('value') || '').trim()) || null;
    }
    return {
        config: state.transferConfig.get('partners'),
        partners: state.transferPartnersGrid.get('partners'),
        checkedRows: state.transferPartnersGrid.get('checkedRows'),
        checkedRowsChangeId: state.transferPartnersGrid.get('checkedRowsChangeId'),
        filterValues: filterValues,
        fields: state.transferPartnersGrid.get('fields').toJS(),
        orderBy: state.transferPartnersGridOrder.update('fields', (list) => {
            return list.reduce((cur, direction, column) => {
                return cur.push(immutable.Map({
                    field: column,
                    dir: direction
                }));
            }, immutable.List());
        }).get('fields').toJS(),
        paging: {
            pageNumber: state.transferPartnersPagination.getIn(['pagination', 'pageNumber']),
            pageSize: state.transferPartnersPagination.getIn(['pagination', 'pageSize'])
        },
        changeId: changeId,
        paginationChangeId: state.transferPartnersPagination.get('changeId')
    };
}

export default connect(
    mapStateToProps,
    { fetchPartners, setVisibleColumns, toggleVisibleColumn, checkPartner, multiCheck, cleanAndCheck, fetchPartnerDetails, order, showToolboxButtons, showToolboxFilters }
)(Grid);
