import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import * as actionCreators from './actions';

export class ByStatus extends Component {
    constructor(props) {
        super(props);
        this.handleSelect = this.handleSelect.bind(this);
    }

    componentWillMount() {
        this.props.actions.fetchBatchPaymentStatus();
    }

    handleSelect(record) {
        this.props.actions.changeFilterStatus([record.value]);
    }

    capitalize(obj) {
        var copy = Object.assign({}, obj);
        var letters = copy.name.split('');
        letters[0] = letters[0].toUpperCase();
        copy.name = letters.join('');
        return copy;
    }

    render() {
        return (
             <div style={this.props.style} className={this.props.className}>
                  <Dropdown
                    canSelectPlaceholder
                    placeholder='Select Status'
                    defaultSelected={this.props.currentStatus}
                    keyProp='status'
                    onSelect={this.handleSelect}
                    data={this.props.data.map(this.capitalize)}
                  />
            </div>
        );
    }
}

ByStatus.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    data: PropTypes.array,
    actions: PropTypes.object,
    currentStatus: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default connect(
    (state, ownProps) => {
        return {
            data: state.bulkPaymentFilterStatus.get('paymentStatus').toArray(),
            currentStatus: state.bulkPaymentFilterStatus.get('statusId') ? state.bulkPaymentFilterStatus.get('statusId')[0] : null
        };
    },
    (dispatch) => {
        return {
            actions: bindActionCreators(actionCreators, dispatch)
        };
    }
)(ByStatus);
