import type { ApiKey, AsyncState, DomainConfig, DomainRecordCheckResponse } from '../types';
import { writable } from 'svelte/store';

export const createDomain$ = writable<AsyncState<DomainConfig>>({ data: null, isLoading: false });

export const editDomains$ = writable<AsyncState<DomainConfig[]>>({ data: [], isLoading: false });

export const accountDomains$ = writable<AsyncState<{ count: number; domains: DomainConfig[] }>>({
	data: { count: 0, domains: [] },
	isLoading: false
});

export const generateApiKey$ = writable<AsyncState<ApiKey>>({
	data: null,
	isLoading: false
});

export const dnsStatus$ = writable<AsyncState<DomainRecordCheckResponse>>({ data: {}, isLoading: false });
