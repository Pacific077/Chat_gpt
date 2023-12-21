const CalculateNextBillingdate = ()=>{
    const oneMonthfromNow = new Date();
    oneMonthfromNow.setMonth(oneMonthfromNow.getMonth()+1);
    return oneMonthfromNow;
}
export default CalculateNextBillingdate