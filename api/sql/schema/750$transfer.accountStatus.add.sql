ALTER PROCEDURE [transfer].[accountStatus.add]
    @merchantId varchar(50),
    @issuerId varchar(50),
    @statusAmount money,
    @originalRequest VARCHAR(MAX) = NULL,
    @transferDateTime datetime2(0) = NULL,
    @localDateTime varchar(14) = NULL
AS
DECLARE @accountStatusId BIGINT
INSERT INTO
[transfer].[accountStatus] (
    merchantId,
    issuerId,
    statusAmount,
    issuerTxState,
    transferDateTime,
    localDateTime,
    originalRequest,
    createdOn
)
VALUES (
    @merchantId,
    @issuerId,
    @statusAmount,
    1,
    ISNULL(@transferDateTime, GETDATE()),
    @localDateTime,
    @originalRequest,
    SYSDATETIMEOFFSET()
)
SET @accountStatusId=SCOPE_IDENTITY()

SELECT @accountStatusId accountStatusId 

