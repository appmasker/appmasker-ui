export interface Credential {
	id: string;
	name: string;
	type: CredentialType;
	meta?: any;
	createdDate: number;
}

export enum CredentialType {
	GITHUB_ACCESS_TOKEN = 'github_access_token',
	AWS_EXTERNAL_ID = 'aws_external_id'
}
