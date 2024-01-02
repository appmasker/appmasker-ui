import { products } from '../utils/billing';
import type { ProductDetails, ServerTier, User } from '../types';

class BillingService {

  userInfo: User;

  planIsExpired(): boolean {
    const planExpiration = new Date(this.userInfo.account.serverPlanExpires);
    return planExpiration < new Date();
  }

  planIsActive(): boolean {
    const planExpiration = new Date(this.userInfo.account.serverPlanExpires);
    return planExpiration > new Date();
  }

  accountIsGood(): boolean {
    return this.planIsActive() || !!this.userInfo.account.paymentMethodId;
  }

  computeMonthlySubtotal(tier: ServerTier, newRegions: number): number {
    return newRegions * (products[tier] as ProductDetails).monthlyPrice;
  }
}

export default new BillingService();