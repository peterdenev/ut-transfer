
MERGE INTO
    [user].[actionCategory] AS target
USING
    (VALUES
        ('transfer')
    ) AS source (name)
ON
    target.name = source.name
WHEN NOT MATCHED BY TARGET THEN
INSERT
    ([name])
VALUES
    (source.[name]);

MERGE INTO
    [user].[action] AS target
USING
    (VALUES
        ('transfer.partner.fetch', 'transfer.partner.fetch', '{}'),
        ('transfer.partner.list', 'transfer.partner.list', '{}'),
        ('transfer.partner.get', 'transfer.partner.get', '{}'),
        ('transfer.partner.add', 'transfer.partner.add', '{}'),
        ('transfer.partner.edit', 'transfer.partner.edit', '{}'),

        ('transfer.pending.cancel', 'transfer.pending.cancel', '{}'),
        ('transfer.pending.reject', 'transfer.pending.reject', '{}'),
        ('transfer.pendingUserTransfers.fetch', 'transfer.pendingUserTransfers.fetch', '{}'),
        ('transfer.push.create', 'transfer.push.create', '{}'),
        ('transfer.push.reverse', 'transfer.push.reverse', '{}'),
        ('transfer.push.approve', 'transfer.push.approve', '{}'),
        ('transfer.report.byDayOfWeek', 'transfer.report.byDayOfWeek', '{}'),
        ('transfer.report.byHourOfDay', 'transfer.report.byHourOfDay', '{}'),
        ('transfer.report.byTypeOfTransfer', 'transfer.report.byTypeOfTransfer', '{}'),
        ('transfer.report.byWeekOfYear', 'transfer.report.byWeekOfYear', '{}'),
        ('transfer.report.settlement', 'transfer.report.settlement', '{}'),
        ('transfer.report.settlementDetails', 'transfer.report.settlementDetails', '{}'),
        ('transfer.report.transfer', 'transfer.report.transfer', '{}'),
        ('transfer.transfer.get', 'transfer.transfer.get', '{}'),
        ('transfer.transfer.create', 'transfer.transfer.create', '{}'),
        ('transfer.transferDetails.get', 'transfer.transferDetails.get', '{}'),
        ('transfer.push.reject', 'transfer.push.reject', '{}'),
        ('transfer.push.cancel', 'transfer.push.cancel', '{}'),
        ('transfer.view.foreignAccounts', 'transfer.view.foreignAccounts', '{}')
    ) AS source (actionId, description, valueMap)
JOIN
    [user].[actionCategory] c ON c.name = 'transfer'
ON
    target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
INSERT
    ([actionId], [actionCategoryId], [description], [valueMap])
VALUES
    (source.[actionId], c.[actionCategoryId], source.[description], source.[valueMap]);
