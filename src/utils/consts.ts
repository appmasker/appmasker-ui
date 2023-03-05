import { FlyRegion } from "../types";

export const jsonPlaceholder = JSON.stringify(
	{ customerName: 'Example Biz', accountTier: 'pro' },
	null,
	2
);


export const flyRegions: { label: string; id: FlyRegion; selected: boolean }[] = [
	{ id: FlyRegion.AMSTERDAM, label: 'Amsterdam, Netherlands', selected: false },
	{ id: FlyRegion.ASHBURN_VIRGINIA, label: 'Ashburn, Virginia', selected: false },
	// { id: FlyRegion.CHENNAI_INDIA, label: 'Chennai, India', selected: false },
	{ id: FlyRegion.CHICAGO, label: 'Chicago, Illinois', selected: false },
	{ id: FlyRegion.DALLAS, label: 'Dallas, Texas', selected: false },
	{ id: FlyRegion.FRANKFURT_GERMANY, label: 'Frankfurt, Germany', selected: false },
	{ id: FlyRegion.HONG_KONG, label: 'Hong Kong', selected: false },
	{ id: FlyRegion.LA, label: 'Los Angeles, California', selected: false },
	{ id: FlyRegion.LONDON, label: 'London, England', selected: false },
	{ id: FlyRegion.PARIS, label: 'Paris', selected: false },
	{ id: FlyRegion.PARSIPPANY_NJ, label: 'Parsippany, New Jersey', selected: false },
	{ id: FlyRegion.SANTIAGO_CHILE, label: 'Santiago, Chile', selected: false },
	{ id: FlyRegion.SAO_PAULO_BRAZIL, label: 'Sao Paulo, Brazil', selected: false },
	{ id: FlyRegion.SEATTLE, label: 'Seattle, Washington', selected: false },
	{ id: FlyRegion.SINGAPORE, label: 'Singapore', selected: false },
	{ id: FlyRegion.SUNNYVALE_CA, label: 'Sunnyvale, CA', selected: false },
	{ id: FlyRegion.SYDNEY, label: 'Sydney, Australia', selected: false },
	{ id: FlyRegion.TOKYO, label: 'Tokyo, Japan', selected: false },
	{ id: FlyRegion.TORONTO, label: 'Toronto, California', selected: false },
]