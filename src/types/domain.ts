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

export interface DomainConfig {
	id: string;
	name: string;
	createdDate: number;
	ipAddresses: string[];
	data: { [key: string]: any };
	redirects: Redirect[];
}

export interface DomainConfigInput {
	id?: string;
	name: string;
	ipAddresses: string[];
	data?: { [key: string]: any };
	redirects?: Redirect[];
}

export interface IDomainForm {
	name: string;
	/**
	 * comma-delimited list of ip addresses
	 */
	ipAddresses: string[];
	data?: string;
	redirects?: Redirect[];
}

export function toDomainForm(domainConfig: DomainConfig): IDomainForm {
	try {
		return {
			...domainConfig,
			name: domainConfig.name ?? '',
			ipAddresses: domainConfig.ipAddresses ?? [''],
			data: domainConfig.data ? JSON.stringify(domainConfig.data, null, 2) : '',
			redirects: domainConfig.redirects ?? []
		};
	} catch (error) {
		console.error(error);
		return {} as IDomainForm;
	}
}

export function toDomainConfigInput(input: IDomainForm): DomainConfigInput {
	return {
		...input,
		data: input.data ? JSON.parse(input.data) : null
	};
}
