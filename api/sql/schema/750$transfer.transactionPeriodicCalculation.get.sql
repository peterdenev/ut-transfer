alter PROCEDURE [transfer].[transactionPeriodicCalculation.get]  
    @merchantId VARCHAR(50),
    @transferCurrency VARCHAR(3),   
    @issuerId varchar(50),
    @timeUnitId TINYINT,
    @isAvgAccumulatedAmount BIT,
    @accumulatedCount BIT,
    @accumulatedAmount BIT
    
AS
DECLARE @period INT
DECLARE @avgAccumulatedAmount MONEY
DECLARE @accumulatedCountR BIGINT
DECLARE @accumulatedAmountR MONEY
DECLARE @transferDateFrom DATETIME2(0)
DECLARE @transferDateTo DATETIME2(0)


 IF  @accumulatedCount =1 OR  @accumulatedAmount =1
BEGIN
    SET @transferDateTo=getdate()
    IF @timeUnitId=1/*weekly*/
    SET @transferDateFrom =dateadd(week, datediff(week, 0, @transferDateTo), 0);
    IF @timeUnitId=2/*monthly*/
    SET @transferDateFrom =dateadd(MONTH, datediff(month, 0, @transferDateTo), 0);
    
	SELECT @accumulatedCountR=count(transferId),
	@accumulatedAmountR=sum(transferAmount)
	FROM 
	[transfer].[transfer]
	WHERE merchantId=@merchantId
	AND @transferCurrency=transferCurrency
	AND issuerId=@issuerId
	AND transferDateTime BETWEEN @transferDateFrom AND @transferDateTo
END

IF @isAvgAccumulatedAmount=1
BEGIN

 
    IF @timeUnitId=1/*weekly*/
    SET @transferDateFrom=dateadd(week, datediff(week, 0, getdate()), -7);
    SET @transferDateTo =dateadd(second,-1,(dateadd(week, datediff(week, 0, getdate()), 0)));
    IF @timeUnitId=2/*monthly*/
    SET @transferDateFrom=dateadd(month, datediff(month, -1, getdate()) - 2, 0)
    SET @transferDateTo =dateadd(second,-1,(dateadd(month, datediff(month, -1, getdate()) - 1, 0)));

	SET @avgAccumulatedAmount=(SELECT avg(transferAmount)
	FROM 
	[transfer].[transfer]
	WHERE merchantId=@merchantId
	AND @transferCurrency=transferCurrency
	AND issuerId=@issuerId
	AND transferDateTime BETWEEN @transferDateFrom AND @transferDateTo
	)


END
SELECT  @avgAccumulatedAmount avgAccumulatedAmount, @accumulatedCountR accumulatedCount , @accumulatedAmountR  accumulatedAmount