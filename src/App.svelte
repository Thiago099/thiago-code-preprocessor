<script>
  import { onMount } from "svelte";
  import { Editor } from "./lib/editor";
  import {Manager} from "./lib/manager.svelte"
  import { makeGridAreasResizable } from "./lib/grid-resize-helper";
  let editorContainer,
    outputContainer,
    gridContainer;

  const manager = new Manager()

  onMount(() => {
    makeGridAreasResizable(gridContainer,{
        thickness:"15px",
        minWidth: 300, 
        minHeight: 300,
        fixedAreas: ["header"]
    })
      manager.Init(editorContainer, outputContainer)
  });

</script>

<main>
  <div class="grid-container" bind:this={gridContainer}>
    <div class="section grid-left {manager.IsAnyItemSelected ? "" : "disabled" }" bind:this={editorContainer}></div>
    <div class="section grid-panel">
      <h4 style="margin-top: 30px;">File</h4>
      <hr/>
      <div class="form-floating">
        <input type="text" bind:value={manager.filter} class="form-control" id="queryInput">
        <label for="queryInput"><i class="fa-solid fa-magnifying-glass"></i> Filter</label>
      </div>
      <select class="form-select form-select-lg mb-3" size="12" value={manager.selectedItem} oninput={e=>manager.selectItem(e.target.value)} >
        {#each manager.items.filter(x=>x.name.toLowerCase().includes(manager.filter.toLowerCase())) as item}
          <option value={item.name}>{item.name} ({item.language})</option>
        {/each}
      </select>
      <div class="button-container">
        <button class="form-control" onclick={e=>manager.deleteSelected()}><i class="fa-solid fa-trash-can"></i> Delete</button>
        <button class="form-control" onclick={e=>manager.AddItem()}><i class="fa-solid fa-plus"></i> Add</button>
      </div>
      <h4 style="margin-top: 30px;">Properties</h4>
      <hr/>
      <div class="form-floating">
        <input type="text" class="form-control" id="floatingInput" value={manager.selectedItem} oninput={e=>manager.RenameItem(e.target.value)} >
        <label for="floatingInput"><i class="fa-solid fa-comments"></i> Name</label>
      </div>
      <div class="form-floating">
        <select
        class="form-select"
        id="languageInput"
        bind:value={manager.selectedLanguage}
        oninput={e=>manager.changeLanguage(e.target.value)}
      >
        {#each Editor.languages as language}
            <option value={language.id}>{manager.languageNameMap[language.id]}</option>
        {/each}
      </select>
        <label for="languageInput"><i class="fa-solid fa-comments"></i> Language</label>
      </div>
      <h4 style="margin-top: 30px;">Export</h4>
      <hr/>
      <div class="button-container">
      <button class="form-control" onclick={e=>manager.Export()}><i class="fa-solid fa-download"></i> Export</button>
      <button class="form-control" onclick={e=>manager.Import()}><i class="fa-solid fa-upload"></i> Import</button>
      </div>
    </div>
    <div class="section output-section grid-right" bind:this={outputContainer}></div>
    <div class="section grid-header flex-center">Thiago's code preprocessor</div>

   
  </div>
</main>

<style>
  .output-section{
    overflow: auto;
    padding: 10px;
  }
  .flex-center{
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .grid-container {
    display: grid;
    grid-template-columns: 300px 1fr 1fr; 
    grid-template-rows: 30px 1fr;
    grid-template-areas:
      "header header header"
      "panel left right";

    height: 100vh;
    width: 100vw;
    gap: 1px;
    margin: 1px;
  }
  .grid-container > * {
    background-color: #201c1c;
  }

  .section {
    font-family: Roboto, sans-serif;
    color: white;
  }



  .grid-left {
    grid-area: left;
  }

  .grid-panel {
    grid-area: panel;
  }
  .grid-panel > *{
    margin: 10px;
    width: calc(100% - 20px);
  }
  .grid-right {
    grid-area: right;
  }

  .grid-header {
    grid-area: header;
  }
  .button-container{
    display: flex;
    flex-direction:row;
  }
  .button-container > :not(:first-child){
    margin-left: 10px;
  }
</style>
