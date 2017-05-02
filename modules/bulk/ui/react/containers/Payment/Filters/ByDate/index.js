import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import DatePicker from 'ut-front-react/components/DatePicker/Simple';
import {bindActionCreators} from 'redux';
import * as actionCreators from './actions';

export class ByDate extends Component {
    constructor(props) {
        super(props);
        this.handleDateChange = this.handleDateChange.bind(this);
    }

    handleDateChange(date) {
        this.props.actions.changeFilterDate(date.value);
    }

    render() {
        return (
             <div style={this.props.style} className={this.props.className}>
                 <div>
                    <DatePicker
                      defaultValue={this.props.selectedDate}
                      onChange={this.handleDateChange}
                      hintText='Date of Birth'
                    />
                 </div>
            </div>
        );
    }
}

ByDate.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    selectedDate: PropTypes.object,
    actions: PropTypes.object
};

export default connect(
    (state, ownProps) => {
        return {
            selectedDate: state.bulkPaymentFilterDate.get('selectedDate') ? new Date(state.bulkPaymentFilterDate.get('selectedDate')) : null
        };
    },
    (dispatch) => {
        return {
            actions: bindActionCreators(actionCreators, dispatch)
        };
    }
)(ByDate);
