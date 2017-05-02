import React, {Component, PropTypes} from 'react';
import style from './style.css';

export class InnerHeader extends Component {
    render() {
        return (
            <span>
                    {this.props.batchName} -
                    <span className={style.status}>{this.props.batchStatus}</span>
            </span>
        );
    }
}

InnerHeader.propTypes = {
    batchName: PropTypes.string,
    batchStatus: PropTypes.string
};

export default InnerHeader;
