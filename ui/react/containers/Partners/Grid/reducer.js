import immutable from 'immutable';
import * as actionTypes from './actionTypes';
import {getStorageColumns, toggleColumnInStorage} from 'ut-front-react/components/SimpleGrid/helpers';
import {methodRequestState} from 'ut-front-react/constants';

const propInStorage = 'transferPArtner';

const defaultState = immutable.fromJS({
    fields: [
        {title: 'Partner Id', name: 'partnerId'},
        {title: 'Partner Name', name: 'name'},
        {title: 'Port', name: 'port'},
        {title: 'Mode', name: 'mode'},
        {title: 'Settlement date', name: 'settlementDate'},
        {title: 'Settlement Account', name: 'settlementAccount'},
        {title: 'Commission Account', name: 'commissionAccount'},
        {title: 'Fee Account', name: 'feeAccount'},
        {title: 'Serial Number', name: 'serialNumber'}
    ],
    partners: [],
    checkedRows: {},
    checkedRowsChangeId: 0, // used to show gridtoolbox filters or buttons
    changeId: 0 // used to refetch grid data
});

export function transferPartnersGrid(state = defaultState, action) {
    switch (action.type) {
        case actionTypes.FETCH_PARTNERS:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                let partners = immutable.fromJS(action.result.partner);
                return state
                    .set('partners', partners)
                    .set('checkedRows', defaultState.get('checkedRows'));
            }
            break;
        case actionTypes.SET_VISIBLE_COLUMNS:
            let invisibleColumns = getStorageColumns(propInStorage);
            let fieldsWithVisibility = state.get('fields').map((f) => {
                if (invisibleColumns.includes(f.get('name'))) {
                    return f.set('visible', false);
                }
                return f;
            });
            return state.set('fields', fieldsWithVisibility);
        case actionTypes.TOGGLE_VISIBLE_COLUMN:
            return state.update('fields', (fields) => {
                return fields.map((f) => {
                    if (action.field.name === f.get('name')) {
                        toggleColumnInStorage(propInStorage, action.field.name);
                        return f.set('visible', !action.field.visible);
                    }
                    return f;
                });
            });
        case actionTypes.CHECK_PARTNER:
            if (!action.params.state) { // add
                return state
                    .update('checkedRows', (v) => (action.params.cleanup ? immutable.Map() : v)) // if cleanup is set, remove all checked rows
                    .setIn(['checkedRows', action.params.rowIdx], immutable.fromJS(action.params.row))
                    .update('checkedRowsChangeId', (v) => (v + 1));
            } else { // remove
                return state
                    .deleteIn(['checkedRows', action.params.rowIdx])
                    .update('checkedRowsChangeId', (v) => (v + 1));
            }
        case actionTypes.MULTI_CHECK:
            if (action.params.currentState) {
                return state
                    .set('checkedRows', immutable.Map())
                    .update('checkedRowsChangeId', (v) => (v + 1));
            } else {
                return state
                    .set('checkedRows', state.get('partners').toMap())
                    .update('checkedRowsChangeId', (v) => (v + 1));
            }
    }

    return state;
}

export default { transferPartnersGrid };
