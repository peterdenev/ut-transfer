import {connect} from 'react-redux';
import GridToolbox from 'ut-front-react/components/SimpleGridToolbox';
import {toggle} from './actions';

export const ToolboxFilters = connect(
    (state) => {
        let hasCheckedItems = state.transferPartnersGrid.get('checkedRows').size > 0;

        return {
            opened: hasCheckedItems ? state.transferPartnerToolbox.getIn(['filters', 'opened']) : true,
            title: hasCheckedItems ? 'Show Buttons' : 'Filter By',
            isTitleLink: hasCheckedItems
        };
    },
    {toggle}
)(GridToolbox);

export const ToolboxButtons = connect(
    (state) => {
        let hasCheckedItems = state.transferPartnersGrid.get('checkedRows').size > 0;

        return {
            opened: hasCheckedItems ? state.transferPartnerToolbox.getIn(['buttons', 'opened']) : false,
            title: 'Show Filters',
            isTitleLink: hasCheckedItems
        };
    },
    {toggle}
)(GridToolbox);
