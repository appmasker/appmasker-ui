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

  accountIsGood(): boolean {
    return this.planIsActive() || !!this.userInfo.account.paymentMethodId;
  }

  computeMonthlySubtotal(tier: ServerTier, currentServers: Server[], newRegions: number, editingId?: string): number {
    const defaultVal = newRegions * (products[tier] as ProductDetails).monthlyPrice;
    console.log('default', defaultVal)
    console.log('tier', tier)
    console.log('current servers', currentServers)
    console.log('new regions', newRegions);
    if (tier === ServerTier.BASIC) {
      const otherBasicServersCount = currentServers.filter(s => s.tier === ServerTier.BASIC && s.id !== editingId).length;
      console.log('others', otherBasicServersCount)
      if (otherBasicServersCount) {
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