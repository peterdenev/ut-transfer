import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import DatePicker from 'ut-front-react/components/DatePicker/Simple';
import * as actions from './actions';

export class ByDate extends Component {
    handleDateChange(field) {
        return (date) => {
            this.props.actions.changeFilterDate(field, date.value);
        };
    }

    render() {
        let {startDate, endDate} = this.props;
        return (
             <div style={this.props.style} className={this.props.className}>
                 <div>
                    <DatePicker
                      defaultValue={startDate}
                      onChange={this.handleDateChange('startDate')}
                      hintText='From'
                    />
                 </div>
                    <div>
                        <DatePicker
                          defaultValue={endDate}
                          onChange={this.handleDateChange('endDate')}
                          hintText='To'
                        />
                    </div>
            </div>
        );
    }
}

ByDate.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    startDate: PropTypes.object,
    endDate: PropTypes.object,
    actions: PropTypes.object
};

export default connect(
    (state, ownProps) => {
        return {
            startDate: state.bulkBatchFilterDate.get('startDate') ? new Date(state.bulkBatchFilterDate.get('startDate')) : null,
            endDate: state.bulkBatchFilterDate.get('endDate') ? new Date(state.bulkBatchFilterDate.get('endDate')) : null
        };
    },
    (dispatch) => {
        return {
            actions: bindActionCreators(actions, dispatch)
        };
    }
)(ByDate);
