import type { ServerTier } from "./products";

export interface Server {
  id: string;

  name: string;

  ipv4Address: string;

  ipv6Address: string;

  regions: FlyRegion[];

  configFile: string | Object;

  configType: ServerConfigType

  appId: string;

  createdDate: Date;

  app: ServerApp;

  tier: ServerTier;

  status: ServerStatus;

  error?: string;

  plugins: string[];
}

export enum ServerStatus {
	PREPARING = 'preparing',

	// builder steps
	IMAGE_PREPARING = 'image_preparing',
	IMAGE_BUILDING = 'image_building',
	IMAGE_PUSHING = 'image_pushing',

	AWAITING_DNS = 'awaiting_dns',
	DEPLOYING = 'deploying',

	// config steps
	CONFIG_INITIALIZING = 'config_initializing',
	CONFIG_LOADING = 'config_loading',

	GOOD = 'good',
	ERROR = 'error'
}

export enum ServerDisplayStatus {
	UNKNOWN = 'UNKNOWN',
	PENDING = 'PENDING',
	GOOD = 'GOOD',
	FAILURE = 'FAILURE'
}

export enum ServerAppState {
  PENDING = 'PENDING',
  DEPLOYED = 'DEPLOYED',
  SUSPENDED = 'SUSPENDED',
};

export enum ServerAppStatus {
  RUNNING = 'running'
}

export interface ServerApp {
	id: string;
	name: string;
	machines: {
		nodes: {
			region: FlyRegion;
			id: string;
			name: string;
			state: ServerAppState;
		}[];
	};
	state: ServerAppState;
	status: string;
	ipAddresses: {
		nodes: {
			address: string;
			id: string;
			region: 'global';
			type: 'v4' | 'v6';
		}[];
	};
}

export enum ServerConfigType {
  CADDYFILE = 'caddyfile',
  JSON = 'json'
}

export interface ServerForm {
  regions: Record<FlyRegion, boolean>;
  name: string;
  caddyFileConfig: string;
  caddyJSONConfig: string;
  configType: ServerConfigType;
  plugins: string[];
}

export interface ServerUpdateInput {
  id: string;
  regions?: FlyRegion[];
  name?: string;
  uriEncodedCaddyfile?: string;
  caddyJSONConfig?: Object;
  plugins: string[];
}

export interface ServerInput {
  regions: FlyRegion[];
  name: string;
  uriEncodedCaddyfile?: string;
  caddyJSONConfig?: Object;
  plugins: [];
}

export enum FlyRegion {
  AMSTERDAM = 'ams',	// Amsterdam, Netherlands
  PARIS = 'cdg',	// Paris, France
  DALLAS = 'dfw',	// Dallas, Texas (US)
  PARSIPPANY_NJ = 'ewr',	// Parsippany, NJ (US)
  FRANKFURT_GERMANY = 'fra',	// Frankfurt, Germany
  SAO_PAULO_BRAZIL = 'gru',	// Sao Paulo, Brazil
  HONG_KONG = 'hkg',    // Hong Kong
  ASHBURN_VIRGINIA = 'iad',	// Ashburn, Virginia (US)
  LA = 'lax',	// Los Angeles, California (US)
  LONDON = 'lhr',	// London, United Kingdom
  CHENNAI_INDIA = 'maa',	// Chennai (Madras), India
  TOKYO = 'nrt',	// Tokyo, Japan
  CHICAGO = 'ord',	// Chicago, Illinois (US)
  SANTIAGO_CHILE = 'scl',	// Santiago, Chile
  SEATTLE = 'sea',	// Seattle, Washington (US)
  SINGAPORE = 'sin',	// Singapore
  SUNNYVALE_CA = 'sjc',	// Sunnyvale, California (US)
  SYDNEY = 'syd',	// Sydney, Australia
  TORONTO = 'yyz',	// Toronto, Canada
}