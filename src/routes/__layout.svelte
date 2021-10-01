<script>
  import "carbon-components-svelte/css/g10.css";
  import {
    Header,
    HeaderNav,
    HeaderNavItem,
    HeaderNavMenu,
    SideNav,
    SideNavItems,
    SideNavMenu,
    SideNavMenuItem,
    SideNavLink,
    SkipToContent,
    Content,
    Grid,
    Row,
    Column,
  } from "carbon-components-svelte";

  let isSideNavOpen = false;
  let links = [
    { text: "Domains", href: "/dashboard/domains" },
    { text: "Images & Files", href: "/dashboard/files" },
    { text: "Account", href: "/dashboard/account" },
    { text: "Billing", href: "/dashboard/billing" },
  ];
</script>

<svelte:head>
  <title>AppMasker</title>
</svelte:head>

<Header
  company="AppMasker"
  platformName=""
  persistentHamburgerMenu={true}
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

<SideNav bind:isOpen={isSideNavOpen}>
  <SideNavItems>
    {#each links as link}
      <SideNavLink href={link.href} text={link.text} />
    {/each}
    <!-- <SideNavMenu text="Menu">
      <SideNavMenuItem href="/" text="Link 1" />
    </SideNavMenu> -->
  </SideNavItems>
</SideNav>

<Content>
  <Grid>
    <Row>
      <Column>
        <slot />
      </Column>
    </Row>
  </Grid>
</Content>

<style>
  :global(.block) {
    margin-top: 3em;
  }

  :global(.bx--side-nav ~ .bx--content) {
    margin-left: 0;
  }
</style>
