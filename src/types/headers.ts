export type HeaderValue = Array<string | number>;
export type HeaderConfig = { [headerName: string]: HeaderValue };

export type HeaderFormList = Array<[headerName: string, value: string]>;