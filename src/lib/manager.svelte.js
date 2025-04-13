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
        
        this.items = Object.entries(localStorage).map(([key, value])=>{return{name: key,language:this.languageNameMap[JSON.parse(value).language]}})

        this.selectedItem = this.items[0]?.name

        this.items = this.items.sort((a, b) => {
            const langCompare = a.language.localeCompare(b.language)
            if (langCompare !== 0) return langCompare
            return a.name.localeCompare(b.name)
        })
    }
    Init(inputEditor, outputEditor){
        this.inputEditor = new Editor(inputEditor, this.selectedLanguage);
        this.outputEditor = outputEditor

        this.load(this.selectedItem)

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
    load(key){
        if(key == null || key == ""){
            this.selectedItem = null        
            this.outputEditor.innerHTML = "";
            return;
        }
        const value = JSON.parse(localStorage.getItem(key)) ?? {code:"", language:"javascript"}
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
        localStorage.removeItem(this.selectedItem);
        this.items = this.items.filter(item => item.name !== this.selectedItem);
        this.load(this.items.at(-1)?.name)
    }
    selectItem(value){
        this.selectedItem = value
        this.load(value)
    }
    AddItem(){
        let i = 0
        this.selectedItem = "new"
        while(this.items.some(x=>x.name == this.selectedItem)){
            this.selectedItem = "new " + ++i
        }
        this.items.push({name: this.selectedItem, language: this.languageNameMap[this.selectedLanguage]})
        this.items.sort((a,b)=>a.name.localeCompare(b.name))
        this.items = this.items
        this.inputEditor.value = "@output Main\n\n"
        this.save(this.selectedItem, this.inputEditor.value)
        this.selectItem(this.selectedItem)
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
        Json.save(obj, "output.json")
    }
    Import(){
        Json.load()
        .then(json=>{
          localStorage.clear()
          for(const [key, value] of Object.entries(json)){
            localStorage.setItem(key, value)
          }
        })
    }
    get IsAnyItemSelected(){
        return this.selectedItem != null && this.selectedItem != ""
    }
}

export { Manager }