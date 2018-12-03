ALTER PROCEDURE [transfer].[push.execute]
    @transferTypeId bigint,
    @transferDateTime datetime,
    @transferIdAcquirer varchar(50),
    @transferIdPrevTxn bigint,
    @channelId bigint,
    @channelType varchar(50),
    @ordererId bigint,
    @merchantId varchar(50),
    @merchantInvoice varchar(50),
    @merchantType varchar(50),
    @cardId bigint,
    @sourceAccount varchar(50),
    @destinationAccount varchar(50),
    @expireTime datetime,
    @transferCurrency varchar(3),
    @transferAmount money,
    @destinationId varchar(50),
    @acquirerFee money,
    @issuerFee money,
    @transferFee money,
    @description varchar(500),
    @udfAcquirer XML,
    @split transfer.splitTT READONLY,
    @meta core.metaDataTT READONLY
AS
DECLARE @callParams XML
DECLARE @merchantPort varchar(50),
    @merchantMode varchar(20),
    @merchantSettlementDate datetime,
    @merchantSerialNumber bigint,
    @merchantSettings XML,
    @destinationPort varchar(50),
    @destinationMode varchar(20),
    @destinationSettlementDate datetime,
    @destinationSerialNumber bigint,
    @destinationSettings XML

BEGIN TRY
    -- todo check permission
    BEGIN TRANSACTION

    UPDATE
        [transfer].[partner]
    SET
        @merchantPort = port,
        @merchantMode = mode,
        @merchantSettlementDate = settlementDate,
        @merchantSerialNumber = serialNumber = ISNULL(serialNumber, 0) + 1,
        @merchantSettings = settings
    WHERE
        partnerId = @merchantId

    UPDATE
        [transfer].[partner]
    SET
        @destinationPort = port,
        @destinationMode = mode,
        @destinationSettlementDate = settlementDate,
        @destinationSerialNumber = serialNumber = ISNULL(serialNumber, 0) + 1,
        @destinationSettings = settings
    WHERE
        partnerId = ISNULL(@destinationId, 'cbs')

    INSERT INTO [transfer].[transfer](
        transferDateTime,
        transferTypeId,
        transferIdAcquirer,
        transferIdPrevTxn,
        localDateTime,
        settlementDate,
        channelId,
        channelType,
        ordererId,
        merchantId,
        merchantInvoice,
        merchantPort,
        merchantType,
        cardId,
        sourceAccount,
        destinationAccount,
        expireTime,
        destinationPort,
        transferCurrency,
        transferAmount,
        acquirerFee,
        issuerFee,
        transferFee,
        description,
        reversed
    )
    OUTPUT
        INSERTED.*,
        @merchantMode merchantMode,
        REPLACE(REPLACE(REPLACE(CONVERT(varchar, @merchantSettlementDate, 120),'-',''),':',''),' ','') merchantSettlementDate,
        @merchantSerialNumber merchantSerialNumber,
        @merchantSettings merchantSettings,
        @destinationMode destinationMode,
        REPLACE(REPLACE(REPLACE(CONVERT(varchar, @destinationSettlementDate, 120),'-',''),':',''),' ','') destinationSettlementDate,
        @destinationSerialNumber destinationSerialNumber,
        @destinationSettings destinationSettings
    SELECT
        @transferDateTime,
        @transferTypeId,
        @transferIdAcquirer,
        @transferIdPrevTxn,
        REPLACE(REPLACE(REPLACE(CONVERT(varchar, @transferDateTime, 120),'-',''),':',''),' ',''),
        @destinationSettlementDate,
        @channelId,
        @channelType,
        @ordererId,
        @merchantId,
        @merchantInvoice,
        @merchantPort,
        @merchantType,
        @cardId,
        @sourceAccount,
        @destinationAccount,
        @expireTime,
        @destinationPort,
        @transferCurrency,
        CONVERT( DECIMAL(17,2), @transferAmount ), --@transferAmount,
        CONVERT( DECIMAL(17,2), @acquirerFee ), --@acquirerFee
        CONVERT( DECIMAL(17,2), @issuerFee ), --@issuerFee
        CONVERT( DECIMAL(17,2), @transferFee ), --@transferFee
        @description,
        0

    DECLARE @transferId BIGINT = @@IDENTITY

    EXEC [transfer].[push.event]
        @transferId = @transferId,
        @type = 'transfer.push',
        @source = 'acquirer',
        @udfDetails = @udfAcquirer,
        @message = 'Transfer created'

    IF EXISTS (SELECT 1 FROM @Split)
    BEGIN
        DECLARE @splitTT [transfer].splitTT

        INSERT @splitTT
        EXEC [integration].[splitAliasAccount.replace] -- replace Alias with Account in splitAssignment
            @actorId = @channelId,-- actorId of agent
            @split = @split, -- split with Alias as accounts
            @debitAccount= @sourceAccount, --debit Account of transaction
            @creditAccount= @destinationAccount, --credit Account of transaction
	       @meta = @meta -- information for the user that makes the operation

        INSERT INTO
                [transfer].[split](
                    transferId,
                    debit,
                    credit,
                    amount,
                    conditionId,
                    splitNameId,
                    [description],
                    tag,
                    actorId
                )
        OUTPUT
			INSERTED.*,
			'true' as splitReturn
        SELECT
            @transferId,
            debit,
            credit,
            CONVERT( DECIMAL(17,2), amount ), --amount
            conditionId,
            splitNameId,
            [description],
            tag,
            actorId
        FROM
            @splitTT
    END
    COMMIT TRANSACTION

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    if @@TRANCOUNT > 0 ROLLBACK TRANSACTION
    EXEC core.error
    RETURN 55555
END CATCH
