

const ShouldrenewSubscriptionPlan = (user)=>{
    const today = new Date();
    return !user.nextBillingDate || user.nextBillingDate <= today;
}


export default ShouldrenewSubscriptionPlan