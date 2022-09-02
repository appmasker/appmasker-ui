import { products } from '../utils/billing';
import { ProductDetails, Server, ServerTier, User } from '../types';

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

  computeMonthlySubtotal(tier: ServerTier, currentServers: Server[], newRegions: number): number {
    const defaultVal = newRegions * (products[tier] as ProductDetails).monthlyPrice;

    if (tier === ServerTier.BASIC) {
      if (currentServers.filter(s => s.tier === ServerTier.BASIC).length) {
        return defaultVal;
      } else {
        return Math.max(defaultVal - products[ServerTier.BASIC].monthlyPrice, 0);
      }
    } else {
      return defaultVal;
    }
  }
}

export default new BillingService();