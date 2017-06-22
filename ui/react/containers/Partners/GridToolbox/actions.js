export const actionList = {
    'TOGGLE': Symbol('TOGGLE'),
    'SHOW_BUTTONS': Symbol('SHOW_BUTTONS'),
    'SHOW_FILTERS': Symbol('SHOW_FILTERS')
};

export const toggle = () => ({type: actionList.TOGGLE});
export const showButtons = () => ({type: actionList.SHOW_BUTTONS});
export const showFilters = () => ({type: actionList.SHOW_FILTERS});
