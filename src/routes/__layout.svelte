<script lang="ts" context="module">
	import { session } from '$app/stores';
	import type { LoadInput, LoadOutput } from '@sveltejs/kit';
	import {
		Column,
		Content,
		Grid,
		Header,
		HeaderNav,
		HeaderNavItem,
		Row,
		SideNav,
		SideNavItems,
		SideNavLink,
		SkipToContent
	} from 'carbon-components-svelte';
	import 'carbon-components-svelte/css/g10.css';
	import { authGuard } from '../services/guards';
	import type { AppSession } from '../types';

	export async function load(params: LoadInput): Promise<LoadOutput> {
		console.log('in load. session:', params, params.session as AppSession);
		const session: AppSession = params.session;
		return await authGuard(params.page.path, session.isAuthenticated);
	}
</script>

<script lang="ts">
	import NotificationPopup from '../components/NotificationPopup.svelte';

	let isSideNavOpen = false;
	let links = [
		{ text: 'Domains', href: '/dashboard/domains' },
		// { text: 'Account', href: '/dashboard/account' },
		{ text: 'API', href: '/dashboard/api' },
		{ text: 'Billing', href: '/dashboard/billing' },
		{ text: 'Help', href: '/dashboard/help' }
	];
</script>

<svelte:head>
	<title>AppMasker</title>
</svelte:head>

<NotificationPopup />

<Header
	company="AppMasker"
	platformName=""
	persistentHamburgerMenu={false}
	expandedByDefault={false}
	bind:isSideNavOpen
>
	<div slot="skip-to-content">
		<SkipToContent />
	</div>
	<HeaderNav>
		{#each links as link}
			<HeaderNavItem href={link.href} text={link.text} />
		{/each}
		<!-- <HeaderNavMenu text="Menu">
      <HeaderNavItem href="/" text="Link 1" />
    </HeaderNavMenu> -->
	</HeaderNav>
</Header>
{#if $session.isAuthenticated}
	<SideNav bind:isOpen={isSideNavOpen}>
		<SideNavItems>
			{#each links as link}
				<SideNavLink href={link.href} on:click={() => (isSideNavOpen = false)} text={link.text} />
			{/each}
			<!-- <SideNavMenu text="Menu">
      <SideNavMenuItem href="/" text="Link 1" />
    </SideNavMenu> -->
		</SideNavItems>
	</SideNav>
{/if}

<Content>
	<Grid>
		<Row>
			<Column>
				<slot />
			</Column>
		</Row>
	</Grid>
</Content>
