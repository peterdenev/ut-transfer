ALTER PROCEDURE [transfer].[push.validateAmount]
    @transferIdAux bigint,
    @type varchar(50),
    @message varchar(250),
    @details XML,
    @replacementAmount money
AS
SET NOCOUNT ON

DECLARE @reverseCount int = 0;
DECLARE @amount money = 0;
IF  @replacementAmount IS NULL
    BEGIN
        SET @replacementAmount = 0
    END

SET @reverseCount = (select COUNT(transferId) from [transfer].[reverse] where originalTransferId = @transferIdAux);

IF @reverseCount > 0
	BEGIN
		SET @amount = (select TOP 1 transferAmount from [transfer].[reverse] where originalTransferId = @transferIdAux ORDER BY transferId DESC)
	END
ELSE
	BEGIN
		SET @amount = (select SUM(transferAmount) totalAmount from [transfer].[transfer] where originalTransferId = @transferIdAux or transferId = @transferIdAux)
	END

IF @amount < @replacementAmount 
	BEGIN
		return  RAISERROR('transfer.push.validateAmount', 16, 1)
	END
ELSE
	BEGIN 
		SELECT @amount AS transferAmount
	END
DECLARE @COUNT int = @@ROWCOUNT

EXEC [transfer].[push.event]
    @transferId = @transferIdAux,
    @type = @type,
    @state = 'reversal',
    @source = 'acquirer',
    @message = @message,
    @udfDetails = @details

IF @COUNT <> 1 RAISERROR('transfer.push.validateAmount', 16, 1);