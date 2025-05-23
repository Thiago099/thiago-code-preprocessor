<script>

  import Logo from "/icon-192.png"
  import { onMount } from "svelte";

  import { makeGridAreasResizable, Editor } from "./lib/_lib";
  import { Manager, ViewManager } from "./manager/_manager"

  let editorContainer,
    outputContainer,
    gridContainer;

  const manager = new Manager()
  const viewManager = new ViewManager()

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

  <div class="grid-container" bind:this={gridContainer} style="grid-template-areas:{viewManager.gridAreas};grid-template-columns:{viewManager.gridColumns}">
    <div class="section grid-blank center {viewManager.displayBlank?"":"hidden"}">
      <h1>No views enabled</h1>
    </div>
    <div class="section grid-left {manager.IsAnyItemSelected ? "" : "disabled" } {viewManager.displayLeftView?"":"hidden"}" bind:this={editorContainer}></div>
    <div class="section grid-panel {viewManager.displayLeftPanel?"":"hidden"}">
      <h4 style="margin-top: 30px;">File</h4>
      <hr/>
      <div class="form-floating">
        <input type="text" bind:value={manager.filter} class="form-control" id="queryInput">
        <label for="queryInput"><i class="fa-solid fa-magnifying-glass"></i> Filter</label>
      </div>
        <div class="form-floating">
          <select
          class="form-select"
          id="categoryFilter"
          bind:value={manager.categoryFilter}
        >
          <option value="----all">All</option>
          <option value="----none">No Category</option>
          {#each manager.categories as category}
            <option value={category}>{category}</option>
          {/each}
        </select>
        <label for="categoryFilter"><i class="fa-solid fa-layer-group"></i> Category Filter</label>
      </div>
      <div class="button-container">
        <button class="form-control" onclick={e=>manager.Add()}><i class="fa-solid fa-plus"></i> Add</button>
        <button class="form-control" onclick={e=>manager.ConfirmDelete()}><i class="fa-solid fa-trash-can"></i> Delete</button>
      </div>
      <select class="form-select form-select-lg mb-3" size="23" value={manager.selectedItem?.id} oninput={e=>manager.Select(e.target.value)} >
        {#each Object.entries(manager.GetListObjects()) as [key, value]}
        <optgroup label={key}>
          {#each value as item}
          <option style="padding-left: 30px;" value={item.id}>{item.name} ({Editor.GetLanguageName(item.language)})</option>
          {/each}
        </optgroup>
        {/each}
      </select>
    </div>
    <div class="section grid-panel2 {viewManager.displayRightPanel?"":"hidden"}">
      {#if manager.selectedItem}
      <h4 style="margin-top: 30px;">Properties</h4>
      <hr/>
      <div class="form-floating">
        <input type="text" class="form-control" id="floatingInput" bind:value={manager.selectedItem.name} oninput={x=>manager.NameChanged(x)}>
        <label for="floatingInput"><i class="fa-solid fa-file"></i> Enter Name</label>
      </div>
      <div class="form-floating">
        <input type="text" class="form-control" id="floatingInput" bind:value={manager.selectedItem.category} oninput={x=>manager.CategoryChanged(x)}>
        <label for="floatingInput"><i class="fa-solid fa-layer-group"></i> Enter Category</label>
      </div>
      <div class="form-floating">
          <select
          class="form-select"
          id="chooseCategory"
          oninput={x=>manager.CategoryChanged(x)}
          bind:value={manager.selectedItem.category}
        >
          <option value="">No Category</option>
          {#each manager.categories as category}
            <option value={category}>{category}</option>
          {/each}
        </select>
        <label for="chooseCategory"><i class="fa-solid fa-layer-group"></i> Chose Category</label>
      </div>
      <div class="form-floating">
        <select
        class="form-select"
        id="languageInput"
        oninput={x=>manager.LanguageChanged(x)}
        bind:value={manager.selectedItem.language}
      >
        {#each Editor.languages as language}
            <option value={language.id}>{language.aliases?.at(0)??language.id}</option>
        {/each}
      </select>
        <label for="languageInput"><i class="fa-solid fa-comments"></i> Choose Language</label>
      </div>
      {/if}
    </div>
    <div class="section output-section grid-right {viewManager.displayRightView?"":"hidden"}">
      {#if manager.selectedItem}
      {#if manager.selectedItem.output}
          {#each Object.entries(manager.selectedItem.output) as [key, value]}
            <h3 class="section-title">
              {key} 
              <button class="form-control" style="width: 100px;display:inline-block;margin-left:20px;" onclick={e=>manager.ReplaceAndCopyToClipboard(value)}><i class="fa-solid fa-copy"></i> Copy</button>
            </h3>
            <pre class="code-block">{@html manager.GetSelectedCode(value)}</pre>
          {/each}
        {/if}
        {#if manager.selectedItem.propertyReplacer}
          {#each Object.entries(manager.selectedItem.propertyReplacer.data) as [key, value]}
            <h3 class="section-title">
              {key}
            </h3>
            {#each value as item}
            <div class="input-group margin-top-10">
              <div class="form-floating flex-grow-1">
                <input type="text" bind:value={item.value} class="form-control" id={item.id}>
                <label for={item.id}><i class="fa-solid fa-magnifying-glass"></i> {item.key}</label>
              </div>
              <button class="btn btn-secondary" type="button" onclick={e=>item.Reset()}>
                <i class="fa-solid fa-arrows-rotate"></i> Reset
              </button>
            </div>
            {/each}
        
          {/each}
        {/if}
      {/if}
    </div>
    <div class="section grid-header flex-center logo-container">
      <div style="position: absolute;left:30px;">
        <img class="logo" src={Logo} alt="★"/>Thiago's Code Preprocessor
      </div>
    
      <div style="margin-right: 30px;"></div>
      <div class="dropdown">
        <button class="btn from-control dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          File
        </button>
        <ul class="dropdown-menu" style="width: 300px">
          <li><button class="dropdown-item" onclick={e=>manager.Save()}><i class="fa-solid fa-floppy-disk"></i> Export Current File</button></li>
          <li><button class="dropdown-item" onclick={e=>manager.Load()}><i class="fa-solid fa-upload"></i> Import File</button></li>
          <div class="dropdown-divider"></div>
          <li><button class="dropdown-item" onclick={e=>manager.DownloadHtml()}><i class="fa-solid fa-code"></i> Generate Html</button></li>
        </ul>
      </div>
      <div class="dropdown">
        <button class="btn from-control dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          Workspace
        </button>
        <ul class="dropdown-menu" style="width: 300px">
          <li><button class="dropdown-item" onclick={e=>manager.Export()}><i class="fa-solid fa-floppy-disk"></i> Export Workspace</button></li>
          <li><button class="dropdown-item" onclick={e=>manager.Import()}><i class="fa-solid fa-triangle-exclamation"></i> Import Workspace</button></li>
          <div class="dropdown-divider"></div>
          <li><button class="dropdown-item" onclick={e=>manager.ConfirmClean()}><i class="fa-solid fa-triangle-exclamation"></i> Clear Workspace</button></li>
        </ul>
      </div>
      <div style="margin-right: 10px;"></div>
      <div class="dropdown">
        <button class="btn from-control dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          View
        </button>
        <ul class="dropdown-menu" style="width: 300px">
          <li>
            <div class="form-check form-switch" style="margin:0 10px;">
              <input class="form-check-input" type="checkbox" id="leftPanelDisplay" bind:checked={viewManager.displayLeftPanel} oninput={e=>viewManager.Save("displayLeftPanel", e.target.checked)}>
              <label class="form-check-label" for="leftPanelDisplay">Display Left Menu</label>
            </div>
          </li>
          <li>
            <div class="form-check form-switch" style="margin:0 10px;">
              <input class="form-check-input" type="checkbox" id="leftViewDisplay" bind:checked={viewManager.displayLeftView} oninput={e=>viewManager.Save("displayLeftView", e.target.checked)}>
              <label class="form-check-label" for="leftViewDisplay">Display Left View</label>
            </div>
          </li>
          <li>
            <div class="form-check form-switch" style="margin:0 10px;">
              <input class="form-check-input" type="checkbox" id="rightViewDisplay" bind:checked={viewManager.displayRightView} oninput={e=>viewManager.Save("displayRightView", e.target.checked)}>
              <label class="form-check-label" for="rightViewDisplay">Display Right View</label>
            </div>
          </li>
          <li>
            <div class="form-check form-switch" style="margin:0 10px;">
              <input class="form-check-input" type="checkbox" id="rightPanelDisplay" bind:checked={viewManager.displayRightPanel} oninput={e=>viewManager.Save("displayRightPanel", e.target.checked)}>
              <label class="form-check-label" for="rightPanelDisplay">Display Right Menu</label>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</main>

<style>
.margin-top-10{
  margin-top: 10px;
}
.section-title{
  display: flex;
  align-items:center;
  margin-bottom:10px;
  margin-top: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #aaa;
}
.center{
  display: flex;
  justify-content: center;
  align-items: center;
}
  .hidden{
    display: none;
  }
  .logo-container{
    font-weight: bold;
    font-size: 1.5em;
  }
  .logo{
    width: 25px;
    margin-right: 10px;
  }
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
    grid-template-rows: 40px 1fr;
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
  .grid-panel > *, .grid-panel2 > *{
    margin: 10px;
    width: calc(100% - 20px);
  }
  .grid-right {
    grid-area: right;
  }
  .grid-blank {
    grid-area: blank;
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
