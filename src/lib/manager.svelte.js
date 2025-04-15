import { Editor } from "./editor";
import { Parser } from "./parser";
import { Json } from "./json";


class Manager{
    items = $state([])
    selectedLanguage = $state("javascript")
    filter = $state("")
    selectedItem = $state("")
    constructor() {
        this.languageNameMap = {}

        for(const language of Editor.languages){
            if(language.aliases){
                this.languageNameMap[language.id] = language.aliases[0]
            }
            else{
                this.languageNameMap[language.id] = language.id
            }
        }
        this.RefreshItems()
    }
    RefreshItems(){
        this.items = Object.entries(localStorage).map(([key, value])=>{return{name: key,language:this.languageNameMap[JSON.parse(value).language]}})

        this.selectedItem = this.items[0]?.name

        this.SortItems()
    }
    SortItems(){
        this.items.sort((a, b) => {
            const langCompare = a.language.localeCompare(b.language)
            if (langCompare !== 0) return langCompare
            return a.name.localeCompare(b.name)
        })
        this.items = this.items
    }
    Init(inputEditor, outputEditor){
        this.inputEditor = new Editor(inputEditor, this.selectedLanguage);
        this.outputEditor = outputEditor

        this.localStorageLoad(this.selectedItem)

        this.inputEditor.addEventListener((value) => {
            this.outputEditor.innerHTML = Parser.Parse(value, this.selectedLanguage);
            if(this.selectedItem != ""){
                this.save(this.selectedItem, value);
            }
        });
    }
    save(selectedItem, value){
        localStorage.setItem(selectedItem, JSON.stringify({
          code: btoa(value),
          language: this.selectedLanguage
        }));
    }
    localStorageLoad(key){
        if(key == null || key == ""){
            this.selectedItem = null        
            this.outputEditor.innerHTML = "";
            return;
        }

        const value = JSON.parse(localStorage.getItem(key))

        this.load(key, value)
    }
    load(key, value){
        this.selectedItem = key
        value.code = atob(value.code)
        this.selectedLanguage = value.language
        this.inputEditor.language =  value.language;
        this.inputEditor.value = value.code
        this.outputEditor.innerHTML = Parser.Parse(value.code, this.selectedLanguage);
    }
    changeLanguage(value) {
        this.inputEditor.language = value;
        this.selectedLanguage = value
        this.RenameItem(this.selectedItem)
        this.save(this.selectedItem, this.inputEditor.value)
    }
    deleteSelected(){
        if(confirm(`Are you sure you want to delete ${this.selectedItem}`)) {
            localStorage.removeItem(this.selectedItem);
            this.items = this.items.filter(item => item.name !== this.selectedItem);
            this.localStorageLoad(this.items.at(-1)?.name)
        }
    }
    selectItem(value){
        this.localStorageLoad(value)
    }
    AddItem(){
        let i = 0
        this.selectedItem = "new"
        while(this.items.some(x=>x.name == this.selectedItem)){
            this.selectedItem = "new " + ++i
        }
        this.CommitCurrent()
        this.inputEditor.value = "@output Main\n\n"
        this.save(this.selectedItem, this.inputEditor.value)
        this.selectItem(this.selectedItem)
    }
    CommitCurrent(){
        if(!this.items.some(x=>x.name == this.selectedItem)){
            this.items.push({name: this.selectedItem, language: this.languageNameMap[this.selectedLanguage]})
            this.SortItems()
        }
    }
    RenameItem(value){
        localStorage.removeItem(this.selectedItem)
        this.items = this.items.filter(item => item.name !== this.selectedItem);
        this.selectedItem = value
        this.items.push({name: this.selectedItem,language:this.languageNameMap[this.selectedLanguage]})
        this.save(this.selectedItem, this.inputEditor.value)
    }
    Export(){
        const obj = {}
        for(const [key, value] of Object.entries(localStorage)){
          obj[key] = JSON.parse(value)
        }
        Json.save(obj, "all.tcpg.json")
    }
    Import(){
        Json.load()
        .then(json=>{
            try {
                localStorage.clear()
                for(const [key, value] of Object.entries(json)){
                    localStorage.setItem(key, JSON.stringify(value))
                }
                this.RefreshItems()
                this.localStorageLoad(this.selectedItem)
            }
            catch {
                
            }
        })
    }
    Save(){
        Json.save({
            name: this.selectedItem,
            code: btoa(this.inputEditor.value),
            language: this.selectedLanguage
        }, this.selectedItem + ".tcp.json")
    }
    Load(){
        Json.load()
        .then(json=>{
            try{
                this.load(json.name, json)
                this.CommitCurrent()
                this.selectedItem = json.name
                this.localStorageLoad(this.selectedItem)
            }
            catch{
            }
        })
    }
    Clear(){
        if(confirm(`Are you sure you want to delete all items`)) {
            localStorage.clear()
            this.RefreshItems()
        }
    }
    get IsAnyItemSelected(){
        return this.selectedItem != null && this.selectedItem != ""
    }
}

export { Manager }