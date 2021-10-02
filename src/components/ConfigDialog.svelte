<script lang="ts">
  import {
    Button,
    DataTable,
    Link,
    Modal,
    TextArea,
    Toolbar,
    ToolbarBatchActions,
    ToolbarContent,
  } from "carbon-components-svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let data;

  interface Domain {
    foo: string
  }

  let modalIsOpen = false;
  let selectedDomain: Domain = null;
  let selectedDomainConfig: string = "";

  const f: string = 'fdsf'

  function openModal(domain) {
    selectedDomainConfig = domain.config;
    selectedDomain = domain;
    modalIsOpen = true;
  }
  function closeModal(data, doSubmit) {
    modalIsOpen = false;
    if (doSubmit) {
      console.log(data);
      dispatch("submit", {
        config: JSON.parse(data),
      });
    }
  }
</script>

<Link style="cursor:pointer" on:click={() => openModal(data)}>View</Link>

<Modal
  bind:open={modalIsOpen}
  modalHeading="Config for {selectedDomain?.name}"
  primaryButtonText="Confirm"
  secondaryButtonText="Cancel"
  on:click:button--secondary={() => closeModal(null, false)}
  on:open
  on:close
  on:submit={() => closeModal(selectedDomainConfig, true)}
>
  <TextArea
    labelText="Enter data that relates to the tenant that owns this domain"
    placeholder="Valid JSON only!"
    bind:value={selectedDomainConfig}
  />
</Modal>
