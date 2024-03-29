import analyticsService from '../services/analytics-service';
import { backendCall } from '../api';
import type { DomainConfig, DomainConfigInput, DomainRecordCheckResponse } from '../types';
import { AppEvent } from '../types';
import { accountDomains$, createDomain$, dnsStatus$ } from './domain.state';
import { effectManager } from './store-utils';
import { showNotification$ } from './user.state';
import { removePresetQueryParam } from '../utils/domain-presets';

export const createDomain = effectManager<DomainConfig, DomainConfigInput>(
	createDomain$,
	(payload) => backendCall('/domain/', 'POST', payload),
	(response, success) => {
		analyticsService.event(AppEvent.CREATED_DOMAIN, response.data);
		getDomains.dispatch();
		if (success) {
			removePresetQueryParam();
		}
		showNotification$.set({
			message: response.message,
			title: success ? 'Success!' : 'Failed to create domain',
			kind: success ? 'success' : 'error'
		});
	}
);

export const getDomains = effectManager<{ count: number; domains: DomainConfig[] }>(
	accountDomains$,
	() => backendCall('/domain/all'),
	(response, success) => {
		if (!success) {
			showNotification$.set({
				message: response.message,
				title: 'Failed to retrieve your domains',
				kind: 'error'
			});
		}
	}
);

export const editDomains = effectManager<
	{ count: number; domains: DomainConfig[] },
	DomainConfigInput[]
>(
	accountDomains$,
	(payload) =>
		backendCall<DomainConfig[], DomainConfigInput[]>('/domain/update-many', 'POST', payload).then(
			(resp) => ({
				...resp,
				data: {
					count: resp.data.length,
					domains: resp.data
				}
			})
		),
	(response, success) => {
		getDomains.dispatch();
		showNotification$.set({
			message: response.message,
			title: success ? 'Success!' : 'Failed to edit domain(s)',
			kind: success ? 'success' : 'error'
		});
	}
);

export const deleteDomains = effectManager<{ count: number; domains: DomainConfig[] }, string[]>(
	accountDomains$,
	(payload) =>
		backendCall<DomainConfig[], string[]>('/domain/delete-many', 'DELETE', payload).then(
			(resp) => ({
				...resp,
				data: {
					count: resp.data?.length,
					domains: resp.data
				}
			})
		),
	(response, success) => {
		getDomains.dispatch();
		showNotification$.set({
			message: response.message,
			title: success ? 'Success!' : 'Failed to delete domain(s)',
			kind: success ? 'success' : 'error'
		});
	}
);

export const getDnsStatus = effectManager<DomainRecordCheckResponse, { domains: string[] }>(
	dnsStatus$,
	(payload) => backendCall('/domain/dns-check', 'POST', payload),
	(response, success) => {
		if (!success) {
			showNotification$.set({
				message: response.message,
				title: 'Failed to check DNS records',
				kind: 'error'
			});
		}
	}
);