import { backendCall } from '../../api';
import { effectManager } from '../store-utils';
import { showNotification$ } from '../user.state';
import { createCredential$, credentials$ } from './credentials.state';
import type { Credential, CredentialType } from '../../types/credential';

export const getCredentials = effectManager<
	Credential[],
	{ user?: string; type?: CredentialType } | undefined
>(
	credentials$,
	(query) => {
		const queryString = new URLSearchParams(query).toString();
		return backendCall(`/credential/all?${queryString}`);
	},
	(response, success) => {
		if (!success) {
			showNotification$.set({
				title: 'Failed to retrieve your credentials',
				message: response.message,
				kind: 'error'
			});
		}
	}
);

export const createCredential = effectManager<Credential, Credential>(
	createCredential$,
	(credential) => backendCall('/credential', 'POST', credential),
	(response, success) => {
		if (!success) {
			showNotification$.set({
				title: 'Failed to create your credential',
				message: response.message,
				kind: 'error'
			});
		}
	}
);
