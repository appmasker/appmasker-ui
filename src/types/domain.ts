import type { HeaderConfig, HeaderFormList } from ".";

export class Redirect {
	/**
	 * Url path such as `/logo` or `/styles.css`
	 */
	from: string;
	/**
	 * Url to redirect to like `https://google.com`
	 */
	to: string;
}

export enum HttpsMode {
	AUTOMATIC = 'automatic',
	DISABLED = 'disabled'
}

export interface DomainConfig {
	id: string;
	name: string;
	createdDate: number;
	ipAddresses: string[];
	data: { [key: string]: any };
	redirects: Redirect[];
	skipTLSVerify: boolean;
	headersDownstream: HeaderConfig;
	httpsMode: HttpsMode;
}

export interface DomainConfigInput {
	id?: string;
	name: string;
	ipAddresses: string[];
	data?: { [key: string]: any };
	redirects?: Redirect[];
	skipTLSVerify: boolean;
	headersDownstream?: HeaderConfig;
	httpsMode: HttpsMode;
}

export interface IDomainForm {
	name: string;
	/**
	 * comma-delimited list of ip addresses
	 */
	ipAddresses: string[];
	data?: string;
	redirects?: Redirect[];
	skipTLSVerify: boolean;
	headersDownstream?: HeaderFormList;
	disableAutoHttps: boolean;
}

export interface DomainRecordCheckResponse {
	[domainName: string]: DomainDNSRecordData;
};

export enum DNS_RECORD_STATUS {
	GOOD = 'good',
	ERROR = 'error',
	WARNING = 'warning',
}
export interface DomainDNSRecordData {
	ipv4?: {
		addresses: string[];
		error: any;
	};
	ipv6?: {
		addresses: string[];
		error: any;
	};
}

export function toDomainForm(domainConfig: DomainConfig): IDomainForm {
	try {
		return {
			...domainConfig,
			name: domainConfig.name ?? '',
			ipAddresses: domainConfig.ipAddresses ?? [''],
			data: domainConfig.data ? JSON.stringify(domainConfig.data, null, 2) : '',
			headersDownstream: domainConfig.headersDownstream ? headerConfigToForm(domainConfig.headersDownstream) : [],
			redirects: domainConfig.redirects ?? [],
			disableAutoHttps: domainConfig.httpsMode === HttpsMode.DISABLED
		};
	} catch (error) {
		console.error(error);
		return {} as IDomainForm;
	}
}

export function toDomainConfigInput(input: IDomainForm): DomainConfigInput {
	return {
		...input,
		data: input.data ? JSON.parse(input.data) : null,
		headersDownstream: headerListToObject(input.headersDownstream),
		httpsMode: input.disableAutoHttps ? HttpsMode.DISABLED : HttpsMode.AUTOMATIC
	};
}

const headerListToObject = (list: HeaderFormList): HeaderConfig => {
	return list.reduce((prev, curr) => {
		prev[curr[0]] = curr[1].split(',');
		return prev;
	}, {} as HeaderConfig);
}

const headerConfigToForm = (config: HeaderConfig): HeaderFormList => {
	const entries = Object.entries(config);
	return entries.map(entry => {
		return [entry[0], entry[1].join(',')];
	});
}
