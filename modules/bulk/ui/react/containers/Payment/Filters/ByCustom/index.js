import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import SearchBox from 'ut-front-react/components/SearchBox';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import * as actionCreators from './actions';
import Text from 'ut-front-react/components/Text';

import style from './style.css';

export class ByName extends Component {
    constructor(props) {
        super(props);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.getSearchBoxPlaceholder = this.getSearchBoxPlaceholder.bind(this);
    }

    handleSelect(record) {
        this.props.actions.changeFilterCustomField(record.value);
    }

    handleSearch(text) {
        this.props.actions.changeFilterCustomValue(text);
    }

    getSearchBoxPlaceholder() {
        let {data, field} = this.props;
        let obj = data.find((element) => {
            return element.key === field;
        });
        return 'By ' + obj.name;
    }

    render() {
        let {className, data, field, text} = this.props;
        return (
             <div className={className} style={this.props.style}>
                <div className={style.customSearchDropdown}>
                    <Dropdown
                      keyProp='status'
                      onSelect={this.handleSelect}
                      data={data}
                      defaultSelected={field}
                      placeholder={<Text>Search By</Text>}
                    />
                </div>
                <div className={style.customSearchTextField}>
                    <SearchBox
                      defaultValue={text}
                      placeholder={this.getSearchBoxPlaceholder()}
                      onSearch={this.handleSearch}
                    />
                </div>
        </div>
        );
    }
}

ByName.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    text: PropTypes.string,
    field: PropTypes.string,
    data: PropTypes.array,
    actions: PropTypes.object
};

export default connect(
    (state, ownProps) => {
        return {
            text: state.bulkPaymentFilterCustom.get('value'),
            field: state.bulkPaymentFilterCustom.get('field'),
            data: [
                {
                    name: 'Name',
                    key: 'name'
                },
                {
                    name: 'National ID',
                    key: 'nationalId'
                },
                {
                    name: 'Sequence Number',
                    key: 'sequenceNumber'
                }
            ]
        };
    },
    (dispatch) => {
        return {
            actions: bindActionCreators(actionCreators, dispatch)
        };
    }
)(ByName);
