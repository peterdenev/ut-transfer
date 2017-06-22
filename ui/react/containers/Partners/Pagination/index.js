import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Pagination from './../../../components/Pagination';
import { updatePagination } from './actions';

class PartnersPagination extends Component {
    render() {
        return (
            <div>
                <Pagination pagination={this.props.pagination} onUpdate={this.props.updatePagination} />
            </div>
        );
    }
}

PartnersPagination.propTypes = {
    pagination: PropTypes.object,
    updatePagination: PropTypes.func
};

function mapStateToProps(state, ownProps) {
    return {
        pagination: state.transferPartnersPagination.get('pagination')
    };
}

export default connect(
    mapStateToProps,
    { updatePagination }
)(PartnersPagination);
