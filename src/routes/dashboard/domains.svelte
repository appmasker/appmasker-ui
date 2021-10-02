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
  import Edit16 from "carbon-icons-svelte/lib/Edit16";
  import ConfigDialog from "../../components/ConfigDialog.svelte";
  import Delete16 from "carbon-icons-svelte/lib/Delete16";

  let selectedRowIds;
  let colums = [
    { key: "name", value: "Name" },
    { key: "protocol", value: "Protocol" },
    { key: "port", value: "Port" },
    { key: "rule", value: "Rule" },
  ];

  function submitConfigChange(data) {
    console.log("final submit now", data);
  }
</script>

<h1>Domains</h1>

<p>
  Configure the domains managed by AppMasker. All domains automatically have TLS
  certificates.
</p>

<div class="block">
  <!-- <DataTableSkeleton /> -->
  <DataTable
    zebra
    batchSelection
    bind:selectedRowIds
    headers={[
      { key: "name", value: "Domain" },
      { key: "ipAddresses", value: "IP Addresses" },
      { key: "config", value: "Custom Data" },
      { key: "createdDate", value: "Created" },
    ]}
    rows={[
      {
        id: "a",
        name: "Load Balancer 3",
        createdDate: "1/2/21 5:44am",
        config: JSON.stringify({ foo: "bar", that: "this" }, null, 2),
        ipAddresses: ["172.10.11.33", "444.32.56.43"],
      },
      {
        id: "b",
        name: "Load Balancer 1",
        createdDate: "1/2/21 5:44am",
        config: JSON.stringify({ foo: "bar", that: "this" }, null, 2),
        ipAddresses: ["172.10.11.33", "444.32.56.43"],
      },
      {
        id: "c",
        name: "Load Balancer 2",
        createdDate: "1/2/21 5:44am",
        config: JSON.stringify({ foo: "bar", that: "kkkk" }, null, 2),
        ipAddresses: ["172.10.11.33", "444.32.56.43"],
      },
      {
        id: "d",
        name: "Load Balancer 6",
        createdDate: "1/2/21 5:44am",
        config: JSON.stringify({ foo: "bar", that: "jjjjj" }, null, 2),
        ipAddresses: ["172.10.11.33", "444.32.56.43"],
      },
      {
        id: "e",
        name: "Load Balancer 4",
        createdDate: "1/2/21 5:44am",
        config: JSON.stringify({ foo: "bar", that: "fjdslkj" }, null, 2),
        ipAddresses: ["172.10.11.33", "444.32.56.43"],
      },
      {
        id: "f",
        name: "Load Balancer 5",
        createdDate: "1/2/21 5:44am",
        config: JSON.stringify({ foo: "bar", that: "this" }, null, 2),
        ipAddresses: ["172.10.11.33", "444.32.56.43"],
      },
    ]}
  >
    <Toolbar>
      <ToolbarBatchActions>
        <Button icon={Edit16}>Edit</Button>
        <Button icon={Delete16}>Delete</Button>
      </ToolbarBatchActions>
      <ToolbarContent>
        <Button>+ Add a Domain</Button>
      </ToolbarContent>
    </Toolbar>

    <span slot="cell" let:row let:cell>
      {#if cell.key === "config"}
        <ConfigDialog data={row} on:submit={submitConfigChange} />
      {:else}{cell.value}{/if}
    </span>
  </DataTable>
</div>
