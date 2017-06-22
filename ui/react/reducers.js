import {fromJS} from 'immutable';
import {actionList} from './actions';

import {transferPartnerToolbox} from './containers/Partners/GridToolbox/reducer';
import {transferPartnerFilterByCustomSearch} from './containers/Partners/Filters/ByCustomSearch/reducer';
import {transferPartnerFilterClear} from './containers/Partners/Filters/Clear/reducer';
import {transferPartnersGrid} from './containers/Partners/Grid/reducer';
import {transferPartnersPagination} from './containers/Partners/Pagination/reducer';
import {transferPartnersGridOrder} from './containers/Partners/Order/reducer';
import {transferPartnerCreate} from './containers/Partners/Popups/CreatePartner/reducer';

import {transferPartnerDetails} from './containers/Partners/Popups/Details/reducer';

const defaultStateConfig = fromJS({
    partners: {
        grid: {
            fields: ['partnerId', 'name', 'port', 'mode', 'settlementDate', 'settlementAccount', 'commissionAccount', 'commissionAccount', 'serialNumber'],
            orderByFields: ['partnerId', 'name', 'port', 'mode']
        },
        filters: {
            filterByCustomSearch: {
                fields: ['partnerId', 'name', 'port', 'mode'],
                defaultField: 'partnerId'
            }
        }
    }
});

export default {
    transferPartnerToolbox,
    transferPartnerFilterByCustomSearch,
    transferPartnerFilterClear,
    transferPartnersGrid,
    transferPartnersPagination,
    transferPartnersGridOrder,
    transferPartnerCreate,
    transferPartnerDetails,

    transferConfig: (state = defaultStateConfig, action) => {
        if (actionList.SET_CONFIG === action.type) {
            return state.mergeDeep(fromJS(action.config));
        }
        return state;
    }
};
