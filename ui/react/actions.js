export const actionList = {
    SET_CONFIG: Symbol('SET_CONFIG')
};

export const setConfig = (config) => { return {type: actionList.SET_CONFIG, config}; };
