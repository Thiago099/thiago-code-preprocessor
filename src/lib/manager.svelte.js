import { Editor } from "./editor";
import { Parser } from "./parser";
import { Json } from "./json";
import { UUID } from "./uuid";
class Item{
    id = UUID.Create()
    name = $state("")
    language = $state("javascript")
    code = $state("")
    category = $state("")
    static matchKeyRegex = /tcp-item-[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
    get key() {
        return "tcp-item-" + this.id
    }
    constructor(source = null) {
        if(source != null){
            Object.assign(this, source)
        }
    }
    static IsValidKey(text){
        return Item.matchKeyRegex.test(text)
    }
    ToRaw(){
        return {
            id:this.id,
            name: this.name,
            language: this.language,
            code: btoa(this.code),
            category: this.category
        }
    }
}
class Manager{
    items = $state([])
    filter = $state("")
    categoryFilter = $state("----all")
    selectedItem = $state(null)
    

    constructor() {
        this.LocalStorageLoadAll()
    }

    Init(inputEditor, outputEditor){
        this.inputEditor = new Editor(inputEditor);
        this.outputEditor = outputEditor

        this.SelectAny()

        this.inputEditor.addEventListener((value) => {
            this.outputEditor.innerHTML = Parser.Parse(value, this.selectedItem.language);
            if(this.selectedItem != null){
                this.selectedItem.code = value
                this.LocalStorageSaveSelected()
            }
        });
    }

    Add(){
        const result = new Item()
        result.name = "new"
        let i = 0;
        while(this.items.some(x=>x.name == result.name)){
            result.name = "new " + ++i
        }
        if(this.categoryFilter != "----all"){
            result.category = this.categoryFilter
        }
        this.items.push(result)
        this.Select(result.id)
    }

    Delete(){
        localStorage.removeItem(this.selectedItem.key)
        this.items = this.items.filter(x=>x!= this.selectedItem)
        this.Select(this.items.at(0))
    }

    Save(){
        Json.save(this.selectedItem.ToRaw(), this.selectedItem.name + ".json" )
    }

    Load(){
        Json.load()
        .then(item=>{
            const old = this.items.find(x=>x.id == item.id)
            if(old){
                Object.assign(old, item);
            }
            else{
                this.items.push(item)
            }
            this.Select(item.id)
        })
    }

    Select(id){
        this.selectedItem = this.items.find(x=>x.id == id)
        this.inputEditor.value = this.selectedItem.code
    }

    Export(){
        Json.save(this.items.map(x=>x.ToRaw()), "all.json" )
    }

    Import(){
        Json.load()
        .then(items=>{
            this.Clear()
            this.items = items.map(x=>{
                x.code = atob(x.code)
                return new Item(x)
            })

            for(const item of this.items){
                this.LocalStorageSave(item)
            }
            
            this.SelectAny()
        })
    }

    SelectAny(){
        if(this.items.length > 0){
            this.Select(this.items[0].id)
        }
    }

    Clear(){
        for(const item of this.items){
            localStorage.removeItem(item.key)
        }
        this.items = []
    }

    DoPassFilter(item){
        return item.name.toLowerCase().includes(this.filter.toLowerCase()) && (this.categoryFilter == "----all" || item.category == this.categoryFilter)
    }

    LocalStorageSaveSelected(){
        this.LocalStorageSave(this.selectedItem)
    }
    LocalStorageSave(item){
        localStorage.setItem(item.key, JSON.stringify(item.ToRaw()))
    }

    LocalStorageLoadAll(){
        for(const key of Object.keys(localStorage)){
            if(Item.IsValidKey(key)){
                const value = JSON.parse(localStorage.getItem(key))
                value.code = atob(value.code)
                this.items.push(new Item(value))
            }
        }
    }

    get IsAnyItemSelected(){
        return this.selectedItem != null
    }

    get categories(){
        const result = new Set()
        for(const item of this.items){
            if(item.category != ""){
                result.add(item.category)
            }
        }
        return Array.from(result)
    }
}

export { Manager }