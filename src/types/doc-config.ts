export interface DocConfig {
	title: string;
	notes: string[];
	method: string;
	path: string[];
	requestType: 'Object' | 'URL' | 'Array<Object>' | 'Array<string>';
	requestRows?: DocSpecRow[];
	exampleRequest: Object;
	hideTable?: boolean;
	responseType?: string;
	responseRows?: DocSpecRow[];
	exampleResponse?: Object;
}

export interface DocSpecRow {
	id: string;
	fieldName: string;
	type: string;
	values: string;
	required?: 'Yes' | 'No';
}
