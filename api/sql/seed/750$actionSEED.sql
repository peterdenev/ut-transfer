MERGE INTO [user].[actionCategory] AS target
USING
    (VALUES
        ('transfer')
    ) AS source (name)
ON target.name = source.name
WHEN NOT MATCHED BY TARGET THEN
    INSERT (name)
    VALUES (name);

DECLARE @transferActionCategoryId INT = (SELECT actionCategoryId FROM [user].[actionCategory] WHERE name = 'transfer')

--webui and tabs access
MERGE INTO [user].[action] AS target
USING
    (VALUES
        ('report.transfer.nav', @transferActionCategoryId, 'View Transfer Reports submenu', '{}')
    ) AS source (actionId, actionCategoryId, [description], valueMap)
ON target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
    INSERT (actionId, actionCategoryId, [description], valueMap)
    VALUES (actionId, actionCategoryId, [description], valueMap);

-- transaction permissions
MERGE INTO [user].[action] AS target
USING
    (VALUES
        ('transaction.validate', @transferActionCategoryId, 'transaction validate', '{}', 0),
        ('transaction.execute', @transferActionCategoryId, 'transaction execute', '{}', 0),
        ('transaction.reverse', @transferActionCategoryId, 'transaction reverse', '{}', 0),
        ('transaction.pendingUserTransfers.fetch', @transferActionCategoryId, 'transaction.pendingUserTransfers.fetch', '{}', 0),
        ('integration.account.fetch', @transferActionCategoryId, 'account fetch', '{}', 0),
        ('user.oobAuthorization.start', @transferActionCategoryId, 'start oob flow', '{}', 0)
    ) AS source (actionId, actionCategoryId, [description], valueMap, protection)
ON target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
    INSERT (actionId, actionCategoryId, [description], valueMap, protection)
    VALUES (actionId, actionCategoryId, [description], valueMap, protection);

-- transfer reports permissions
MERGE INTO [user].[action] AS target
USING
    (VALUES
        ('db/transfer.report.transfer', @transferActionCategoryId, 'Transfer Report', '{}'),
        ('db/transfer.report.byTypeOfTransfer', @transferActionCategoryId, 'Transfer Type Statistics', '{}'),
        ('db/transfer.report.byHourOfDay', @transferActionCategoryId, 'Transfer Hour of Day Statistics', '{}'),
        ('db/transfer.report.byDayOfWeek', @transferActionCategoryId, 'Transfer Day of Week Statistics', '{}'),
        ('db/transfer.report.byWeekofYear', @transferActionCategoryId, 'Transfer Week of Year Statistics', '{}'),
        ('db/transfer.report.settlement', @transferActionCategoryId, 'Settlement Report', '{}'),
        ('db/transfer.report.settlementDetails', @transferActionCategoryId, 'Settlement Details', '{}'),
        ('db/transfer.partner.fetch', @transferActionCategoryId, 'Fetch partner types', '{}'),
        ('transfer.partner.fetch', @transferActionCategoryId, 'Fetch partner types', '{}')
    ) AS source (actionId, actionCategoryId, [description], valueMap)
ON target.actionId = source.actionId
WHEN NOT MATCHED BY TARGET THEN
    INSERT (actionId, actionCategoryId, [description], valueMap)
    VALUES (actionId, actionCategoryId, [description], valueMap);
