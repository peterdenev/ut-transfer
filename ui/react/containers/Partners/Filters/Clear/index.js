import {connect} from 'react-redux';
import ClearFilter from 'ut-front-react/components/ClearFilter';
import {clearFilters as onClick} from './actions';

export default connect(
    (state) => {
        let show = state.transferPartnerFilterByCustomSearch.get('field') && state.transferPartnerFilterByCustomSearch.get('value');
        return {
            show: !!show
        };
    },
    {onClick}
)(ClearFilter);
