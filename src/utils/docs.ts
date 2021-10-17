import type { DocConfig } from '../types';

const domainResponse = {
	name: 'example.com',
	ipAddresses: ['172.32.1.1:443', 'example.com:443'],
	data: { tenantName: 'Example Biz', customerId: 'fdjai-s0sd-da-d-9fjdpm' },
	redirects: [
		{ from: '/logo', to: 'https://s3.amazon.com/myaccount/example-biz.png' },
		{ from: '/styles', to: 'https://s3.amazon.com/myaccount/example-biz-styles.css' }
	]
};

const domainResponseRows = [
	{ id: 'x', fieldName: 'id', type: 'string', values: '' },
	{ id: 'a', fieldName: 'name', type: 'string', values: '' },
	{
		id: 'b',
		fieldName: 'ipAddresses',
		type: 'Array<string>',
		values: 'ex. mybackend.com:443 or 182.34.7.1:443'
	},
	{ id: 'c', fieldName: 'data', type: 'JSON Object', values: '' },
	{ id: 'c1', fieldName: 'type', type: 'string', values: `root | subdomain` },
	{ id: 'cxxx', fieldName: 'createdBy', type: 'string', values: "a user's UUID" },

	{
		id: 'c2',
		fieldName: 'createdDate',
		type: 'timestamp string',
		values: 'yyyy-mm-ddTHH:mm:SS.sssZ'
	},
	{
		id: 'c3',
		fieldName: 'updatedDate',
		type: 'timestamp string',
		values: 'yyyy-mm-ddTHH:mm:SS.sssZ'
	},
	{
		id: 'c66',
		fieldName: 'deletedDate',
		type: 'timestamp string',
		values: 'yyyy-mm-ddTHH:mm:SS.sssZ | null'
	},
	{
		id: 'd4',
		fieldName: 'redirects',
		type: 'Array<{from: string, to: string}>',
		values: ''
	}
];

export const createDomainDocConfig: DocConfig = {
	title: 'Create a Domain Config',
	method: 'POST',
	path: ['/domain'],
	notes: [],
	requestType: 'Object',
	requestRows: [
		{ id: 'a', fieldName: 'name', type: 'string', values: '', required: 'Yes' },
		{
			id: 'b',
			fieldName: 'ipAddresses',
			type: 'Array<string>',
			values: 'ex. mybackend.com:443 or 182.34.7.1:443',
			required: 'Yes'
		},
		{ id: 'c', fieldName: 'data', type: 'JSON Object', values: '', required: 'No' },
		{
			id: 'd',
			fieldName: 'redirects',
			type: 'Array<{from: string, to: string}>',
			values: '',
			required: 'No'
		}
	],
	exampleRequest: domainResponse,
	responseType: 'Object',
	responseRows: domainResponseRows,
	exampleResponse: {
		id: '30346048-b91f-4e38-8eef-f5fjdsl095f899b0',
		...domainResponse,
		createdBy: 'f3e31f8c-8bb0-49da-b3f0-a26dab3b019a',
		createdDate: '2021-10-07T05:44:48.995Z',
		updatedDate: '2021-10-07T05:44:48.995Z',
		deletedDate: null,
		type: 'root'
	}
};

export const getDomainDocConfig: DocConfig = {
	title: 'Get a Domain Config',
	method: 'GET',
	path: ['/domain/{domainName}'],
	notes: [],
	requestType: 'URL',
	exampleRequest: 'https://app.appmasker.com/domain/example.com',
	responseType: 'Object',
	exampleResponse: {
		id: '30346048-b91f-4e38-8eef-f5fjdsl095f899b0',
		...domainResponse,
		createdBy: 'f3e31f8c-8bb0-49da-b3f0-a26dab3b019a',
		createdDate: '2021-10-07T05:44:48.995Z',
		updatedDate: '2021-10-07T05:44:48.995Z',
		deletedDate: null,
		type: 'root'
	},
	responseRows: domainResponseRows
};

export const editManyDomainsDocConfig: DocConfig = {
	title: 'Update Domain Configs',
	method: 'POST',
	notes: ['Note that this endpoint accepts only an array of objects.'],
	path: ['/domain/update-many'],
	requestType: 'Array<Object>',
	requestRows: [
		{ id: 'a', fieldName: 'name', type: 'string', values: '', required: 'Yes' },
		{ id: 'b', fieldName: 'ipAddresses', type: 'Array<string>', values: '', required: 'Yes' },
		{ id: 'c', fieldName: 'data', type: 'JSON Object', values: '', required: 'No' },
		{
			id: 'd',
			fieldName: 'redirects',
			type: 'Array<{from: string, to: string}>',
			values: '',
			required: 'No'
		}
	],
	exampleRequest: [domainResponse],
	responseType: '{count: number, domains: Array<Object>}',
	responseRows: domainResponseRows,
	exampleResponse: {
		count: 1,
		domains: [
			{
				id: '30346048-b91f-4e38-8eef-f5fjdsl095f899b0',
				...domainResponse,
				createdBy: 'f3e31f8c-8bb0-49da-b3f0-a26dab3b019a',
				createdDate: '2021-10-07T05:44:48.995Z',
				updatedDate: '2021-10-07T05:44:48.995Z',
				deletedDate: null,
				type: 'root'
			}
		]
	}
};

export const deleteManyDomainsDocConfig: DocConfig = {
	title: 'Delete Domains',
	method: 'DELETE',
	notes: [],
	path: ['/domain/delete-many'],
	requestType: 'Array<string>',
	hideTable: true,
	exampleRequest: ['example.com', 'example2.com', 'tenant.example3.com'],
	responseType: 'None'
};
