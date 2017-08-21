module.exports = {
    'push.execute': require('./push.execute'),
    'pull.execute': require('./pull.execute'),

    'commissionPerAgentAuthorized.fetch': require('./commissionPerAgentAuthorized.fetch'),
    'commissionPerAgentNonAuthorized.fetch': require('./commissionPerAgentNonAuthorized.fetch'),
    'commissionPerOperationsAuthorized.fetch': require('./commissionPerOperationsAuthorized.fetch'),
    'commissionPerOperationsNonAuthorized.fetch': require('./commissionPerOperationsNonAuthorized.fetch'),
    'commissionPerAgent.authorize': require('./commissionPerAgent.authorize')
};
