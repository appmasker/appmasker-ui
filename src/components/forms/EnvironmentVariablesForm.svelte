<script lang="ts">
  import { Button, TextInput } from 'carbon-components-svelte';
  import TrashCan16 from 'carbon-icons-svelte/lib/TrashCan16';
  import type { EnvironmentVariable } from 'src/types';

  export let variables: EnvironmentVariable[] = [];
  export let existing: EnvironmentVariable[] = [];

  // TODO: support existing variable forms being disabled but still able to delete
  let existingMap: Record<string, string> = null;
  let hasSet = false;

  $: existing?.length && !hasSet && setExisting();

  function setExisting() {
    hasSet = true;
    existingMap = existing?.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {}) || {};
  }

  function addVariable() {
    variables = [...variables, { key: '', value: '' }];
  }

  function removeVariable(index: number) {
    variables = variables.filter((_, i) => i !== index);
  }

</script>

<div>

  {#each variables as variable, index}
    <div class="input-row sub-block">
      <div style="grid-area: key">
        <TextInput
          id={`key-${index}`}
          placeholder="Enter key"
          bind:value={variable.key}
        />
      </div>
      <div style="grid-area: value">
        <TextInput
          id={`value-${index}`}
          placeholder="Enter value"
          bind:value={variable.value}
        />
      </div>
      <Button
        style="grid-area: delete"
        kind="danger-tertiary" 
        size="field" 
        iconDescription="Delete" 
        icon={TrashCan16} 
        on:click={() => removeVariable(index)} />
    </div>
  {/each}
  <div class="sub-block">
    <Button kind="tertiary" size="field" on:click={addVariable}>+ Add Variable</Button>
  </div>
</div>
  
<style>
	.input-row {
    width: 100%;
		display: grid;
    grid-template-columns: 1fr 1fr auto;
    grid-template-rows: auto auto;
    grid-template-areas: "key value delete";
		align-items: center;
		gap: 16px;
	}

  .input-row:first-child {
    margin-top: 0;
  }

  @media (max-width: 600px) {
    .input-row {
      grid-template-areas:  "key key delete" 
                            "value value delete";
    }
  }
</style>
