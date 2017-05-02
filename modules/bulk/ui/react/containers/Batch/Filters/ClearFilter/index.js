import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as actionCreators from './actions';
import classnames from 'classnames';
import style from './style.css';

export class ByStatus extends Component {
    render() {
        if (!this.props.show) {
            return null;
        }
        return (
             <div onClick={this.props.actions.clearFilters} className={classnames(style.toolbarElement, style.noRightMargin, style.closeArrow)} />
        );
    }
}

ByStatus.propTypes = {
    show: PropTypes.bool,
    actions: PropTypes.object
};

export default connect(
    (state, ownProps) => {
        return {};
    },
    (dispatch) => {
        return {
            actions: bindActionCreators(actionCreators, dispatch)
        };
    }
)(ByStatus);
