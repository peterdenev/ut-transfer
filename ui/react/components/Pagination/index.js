import React, { Component, PropTypes } from 'react';
import AdvancedPagination from 'ut-front-react/components/AdvancedPagination';
import style from './style.css';

class Pagination extends Component {
    render() {
        let { pagination, onUpdate } = this.props;

        return (
            <div id={style.paginationWrap}>
                <AdvancedPagination pagination={pagination} onUpdate={onUpdate} />
            </div>
        );
    }
}

Pagination.propTypes = {
    /**
     * pageNumber
     * pageSize
     * recordsTotal
     * pagesTotal - not required (it can be calculated based on the rest information)
    */
    pagination: PropTypes.object.isRequired, // immutable object
    onUpdate: PropTypes.func
};

Pagination.defaultProps = {
    onUpdate: () => {}
};

export default Pagination;
