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

  app: ServerApp

}

export enum ServerStatus {
  UNKNOWN = 'unknown',
  PENDING = 'pending',
  GOOD = 'good',
  FAILURE = 'failure'
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
  state: ServerAppState,
  status: string,
  regions: {
    code: FlyRegion,
    name: string,
  }[]
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
}

export interface ServerUpdateInput {
  id: string;
  regions?: FlyRegion[];
  name?: string;
  uriEncodedCaddyfile?: string;
  caddyJSONConfig?: Object;
}

export interface ServerInput {
  regions: FlyRegion[];
  name: string;
  uriEncodedCaddyfile?: string;
  caddyJSONConfig?: Object;
}

export enum FlyRegion {
  AMSTERDAM = 'ams',	// Amsterdam, Netherlands
  ATLANTA = 'atl',	// Atlanta, Georgia (US)
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