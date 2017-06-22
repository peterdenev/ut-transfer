import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Dropdown from 'ut-front-react/components/Input/Dropdown';
import SearchBox from 'ut-front-react/components/SearchBox';
import Text from 'ut-front-react/components/Text';
import {setField, setValue} from './actions';
import style from './style.css';

const fields = [
    {key: 'partnerId', name: <Text>Partner Id</Text>},
    {key: 'name', name: <Text>Partner Name</Text>},
    {key: 'port', name: <Text>Port</Text>},
    {key: 'mode', name: <Text>Mode</Text>}
];

export class ByCustomSearch extends Component {
    constructor(props) {
        super(props);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }
    componentWillMount() {
        if (!this.props.field) {
            this.props.setField(this.props.defaultField);
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.defaultField !== this.props.defaultField) {
            this.props.setField(nextProps.defaultField);
        }
    }
    handleSelect(record) {
        this.props.setField(record.value);
    }
    handleSearch(value) {
        this.props.setValue(value);
    }
    render() {
        return (
            <div>
                <div className={style.customSearchDropdown}>
                    <Dropdown
                      defaultSelected={this.props.field}
                      placeholder={<Text>Search By</Text>}
                      keyProp='name'
                      onSelect={this.handleSelect}
                      data={fields.filter((field) => (this.props.allowedFields.indexOf(field.key) >= 0))}
                      menuAutoWidth />
                </div>
                <div className={style.customSearchTextField}>
                    <SearchBox defaultValue={this.props.value} onSearch={this.handleSearch} />
                </div>
            </div>
        );
    }
}

ByCustomSearch.propTypes = {
    setField: PropTypes.func.isRequired,
    setValue: PropTypes.func.isRequired,
    field: PropTypes.string,
    value: PropTypes.string,
    allowedFields: PropTypes.object,
    defaultField: PropTypes.string.isRequired
};

export default connect(
    (state, ownProps) => {
        return {
            field: state.transferPartnerFilterByCustomSearch.get('field'),
            value: state.transferPartnerFilterByCustomSearch.get('value'),
            allowedFields: ownProps.allowedFields,
            defaultField: ownProps.defaultField
        };
    },
    {setField, setValue}
)(ByCustomSearch);
