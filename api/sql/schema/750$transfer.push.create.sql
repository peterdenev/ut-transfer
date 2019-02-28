ALTER PROCEDURE [transfer].[push.create]
    @transferTypeId BIGINT,
    @acquirerCode VARCHAR(50),
    @transferDateTime DATETIME,
    @localDateTime VARCHAR(14),
    @settlementDate VARCHAR(14),
    @transferIdAcquirer VARCHAR(50),
    @retrievalReferenceNumber VARCHAR(12),
    @channelId BIGINT,
    @channelType VARCHAR(50),
    @ordererId BIGINT,
    @merchantId VARCHAR(50),
    @merchantInvoice VARCHAR(50),
    @merchantType VARCHAR(50),
    @cardId BIGINT,
    @credentialId VARCHAR(50),
    @sourceAccount VARCHAR(50),
    @destinationAccount VARCHAR(50),
    @expireTime DATETIME,
    @expireSeconds INT,
    @transferCurrency VARCHAR(3),
    @transferAmount VARCHAR(21),
    @issuerId VARCHAR(50),
    @ledgerId VARCHAR(50),
    @acquirerFee VARCHAR(21),
    @issuerFee VARCHAR(21),
    @transferFee VARCHAR(21),
    @description VARCHAR(250),
    @udfAcquirer XML,
    @split transfer.splitTT READONLY,
    @isPending BIT,
    @transferPending transfer.pendingTT READONLY,
    @userAvailableAccounts [core].[arrayList] READONLY,
    @sourceAccountHolder NVARCHAR(200) = NULL,
    @destinationAccountHolder NVARCHAR(200) = NULL,
    @destinationBankName NVARCHAR(100) = NULL,
    @swift VARCHAR(11) = NULL,
    @additionalDetails NVARCHAR(500) = NULL,
    @meta core.metaDataTT READONLY
AS
DECLARE @callParams XML
DECLARE @merchantPort VARCHAR(50),
    @merchantMode VARCHAR(20),
    @merchantSettlementDate datetime,
    @merchantSerialNumber BIGINT,
    @merchantSettings XML,
    @issuerPort VARCHAR(50),
    @issuerMode VARCHAR(20),
    @issuerSettlementDate datetime,
    @issuerSerialNumber BIGINT,
    @issuerSettings XML,
    @ledgerPort VARCHAR(50),
    @ledgerMode VARCHAR(20),
    @ledgerSerialNumber BIGINT,
    @userId BIGINT

BEGIN TRY

    -- checks if the user has a right to make the operation
    DECLARE @actionID VARCHAR(100) = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID), @RETURN INT = 0
    EXEC @RETURN = [user].[permission.check] @actionId = @actionID, @objectId = NULL, @meta = @meta
    IF @RETURN != 0
    BEGIN
        RETURN 55555
    END

    SET @userId = (SELECT [auth.actorId] FROM @meta)

    BEGIN TRANSACTION

        UPDATE
            [transfer].[partner]
        SET
            serialNumber = ISNULL(serialNumber, 0) + 1
        WHERE
            partnerId IN (@ledgerId, @issuerId, @merchantId)


        SELECT
            @merchantPort = port,
            @merchantMode = mode,
            @merchantSettlementDate = settlementDate,
            @merchantSerialNumber = serialNumber ,
            @merchantSettings = settings
        FROM [transfer].[partner]
        WHERE
            partnerId = @merchantId


        SELECT
            @issuerPort = port,
            @issuerMode = mode,
            @issuerSettlementDate = settlementDate,
            @issuerSerialNumber = serialNumber,
            @issuerSettings = settings
        FROM [transfer].[partner]
        WHERE
            partnerId = @issuerId


        SELECT
            @ledgerPort = port,
            @ledgerMode = mode,
            @ledgerSerialNumber = serialNumber
        FROM [transfer].[partner]
        WHERE partnerId = @ledgerId

        IF LEN(@settlementDate) = 4
        BEGIN
            SET @issuerSettlementDate = CAST(CAST(DATEPART(YEAR, GETDATE()) AS CHAR(4)) + @settlementDate AS DATETIME)
            SET @issuerSettlementDate = DATEADD(YEAR, CASE
                WHEN DATEPART(MONTH, @issuerSettlementDate) = 1 AND DATEPART(MONTH, GETDATE()) = 12 THEN - 1
                WHEN DATEPART(MONTH, @issuerSettlementDate) = 12 AND DATEPART(MONTH, GETDATE()) = 1 THEN 1
                ELSE 0 END, @issuerSettlementDate)
        END ELSE
        IF LEN(@settlementDate) > 4
        BEGIN
            SET @issuerSettlementDate = CAST(@settlementDate AS datetime)
        END

        INSERT INTO [transfer].[transfer](
            transferDateTime,
            transferTypeId,
            acquirerCode,
            transferIdAcquirer,
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
            credentialId,
            sourceAccount,
            destinationAccount,
            expireTime,
            issuerId,
            ledgerId,
            transferCurrency,
            transferAmount,
            acquirerFee,
            issuerFee,
            transferFee,
            description,
            reversed,
            reversedLedger,
            retrievalReferenceNumber,
            issuerSerialNumber,
            sourceAccountHolder,
            destinationAccountHolder,
            destinationBankName,
            SWIFT,
            additionalDetails
        )
        OUTPUT
            INSERTED.*,
            @merchantMode merchantMode,
            REPLACE(REPLACE(REPLACE(CONVERT(VARCHAR, @merchantSettlementDate, 120), '-', ''), ':', ''), ' ', '') merchantSettlementDate,
            @merchantSerialNumber merchantSerialNumber,
            @merchantSettings merchantSettings,
            @issuerMode issuerMode,
            REPLACE(REPLACE(REPLACE(CONVERT(VARCHAR, @issuerSettlementDate, 120), '-', ''), ':', ''), ' ', '') issuerSettlementDate,
            @issuerSettings issuerSettings,
            @issuerPort issuerPort,
            @ledgerPort ledgerPort,
            @ledgerMode ledgerMode,
            @ledgerSerialNumber ledgerSerialNumber
        SELECT
            @transferDateTime,
            @transferTypeId,
            @acquirerCode,
            @transferIdAcquirer,
            ISNULL(@localDateTime, REPLACE(REPLACE(REPLACE(CONVERT(VARCHAR, @transferDateTime, 120), '-', ''), ':', ''), ' ', '')),
            @issuerSettlementDate,
            @channelId,
            @channelType,
            @ordererId,
            @merchantId,
            @merchantInvoice,
            @merchantPort,
            @merchantType,
            @cardId,
            @credentialId,
            @sourceAccount,
            @destinationAccount,
            ISNULL(@expireTime, DATEADD(SECOND, @expireSeconds, @transferDateTime)),
            @issuerId,
            @ledgerId,
            @transferCurrency,
            @transferAmount,
            @acquirerFee,
            @issuerFee,
            @transferFee,
            @description,
            0,
            0,
            @retrievalReferenceNumber,
            @issuerSerialNumber,
            @sourceAccountHolder,
            @destinationAccountHolder,
            @destinationBankName,
            @swift,
            @additionalDetails

        DECLARE @transferId BIGINT = @@IDENTITY

        EXEC [transfer].[push.event]
            @transferId = @transferId,
            @type = 'transfer.push',
            @state = 'request',
            @source = 'acquirer',
            @udfDetails = @udfAcquirer,
            @message = 'Transfer created'

        IF @isPending = 1
        BEGIN
            INSERT INTO
                [transfer].[pending](
                    pullTransactionId,
                    securityCode,
                    expireTime,
                    attempts,
                    [status],
                    approvalAccountNumber,
                    params,
                    createdBy,
                    initiatorName
                )
            SELECT
                @transferId,
                securityCode,
                expireTime,
                0,
                1,
                approvalAccountNumber,
                params,
                @userId,
                initiatorName
            FROM
                @transferPending
        END ELSE IF EXISTS (SELECT * FROM [transfer].[pending] tp JOIN @transferPending s ON s.pullTransactionId = tp.pullTransactionId)
        BEGIN
            UPDATE
                tp
            SET
                pushTransactionId = @transferId,
                tp.[status] = 2,
                updatedBy = @userId,
                updatedOn = GETDATE()
            FROM
                [transfer].[pending] tp
            JOIN
                @transferPending s ON s.pullTransactionId = tp.pullTransactionId AND ISNULL (s.securityCode, 0) = ISNULL (tp.securityCode, 0)
            JOIN
                @userAvailableAccounts uaa ON uaa.value = tp.approvalAccountNumber
            JOIN
                [transfer].[transfer] t ON t.transferId = tp.pullTransactionId
            WHERE
                tp.expireTime >= GETDATE() AND
                t.reversed = 0 AND
                tp.[status] = 1
            IF @@ROWCOUNT = 0
                RAISERROR ('transfer.unauthorizedTransfer', 16, 1)
        END

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
                creditActorId,
                debitActorId,
                creditItemId,
                debitItemId,
                [state],
                [transferIdPayment]
            )
        SELECT
            @transferId,
            debit,
            credit,
            amount,
            conditionId,
            splitNameId,
            [description],
            tag,
            creditActorId,
            debitActorId,
            creditItemId,
            debitItemId,
            [state],
            [transferIdPayment]
        FROM
            @split

    COMMIT TRANSACTION

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    IF error_number() NOT IN (2627)
        BEGIN
            EXEC [core].[error]
        END
    ELSE
    BEGIN TRY
        RAISERROR('transfer.idAlreadyExists', 16, 1);
    END TRY
    BEGIN CATCH
        EXEC [core].[error]
    END CATCH
END CATCH
