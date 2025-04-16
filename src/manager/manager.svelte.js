import { Editor, Parser, Json } from "../lib/_lib";
import { Item } from "../entity/_entity";
import hljs from "highlight.js";

class Manager{
    items = $state([])
    filter = $state("")
    categoryFilter = $state("----all")
    selectedItem = $state(null)
    

    constructor() {
        this.LocalStorageLoadAll()
    }

    GetListObjects(){
        const obj = {}
          
        this.SortItems()

        for(const item of this.items.filter(x => this.DoPassFilter(x))){
            const key = item.category == ""?"No Category":item.category
            if(!(key in obj)){
                obj[key] = []
            }
            obj[key].push(item)
        }

        return obj
    }

    Init(inputEditor, outputEditor){
        this.inputEditor = new Editor(inputEditor);
        this.outputEditor = outputEditor

        this.SelectAny()

        this.inputEditor.addEventListener((value) => {
            this.UpdateOutput(value);
            if(this.selectedItem != null){
                this.selectedItem.code = value
                this.LocalStorageSave(this.selectedItem)
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
        this.Select(this.items.at(0)?.id)
    }

    Save(){
        Json.save(this.selectedItem.ToRaw(), this.selectedItem.name + ".json" )
    }

    Load(){
        Json.load()
        .then(item => {
            if(typeof item !== 'object' || item === null || Array.isArray(item)){
                alert("File is of invalid format");
                return
            }
            let result = this.items.find(x=>x.id == item.id)
            if(result){
                result.Assing(item)
            }
            else {
                result = new Item(item)
                this.items.push(result)
            }
            this.LocalStorageSave(result)
            this.Select(item.id)
        })
    }

    Select(id){
        this.selectedItem = this.items.find(x=>x.id == id)
        if(this.selectedItem){
            this.inputEditor.value = this.selectedItem.code
            this.inputEditor.language = this.selectedItem.language
            this.UpdateOutput(this.selectedItem.code);
            localStorage.setItem("tcp-selected", id)
        }
        else{
            this.outputEditor.innerHTML = ""
            this.inputEditor.language = "javascript"
            this.inputEditor.value = ""
            this.selectedItem = null
        }
    }

    Export(){
        Json.save(this.items.map(x=>x.ToRaw()), "all.json" )
    }

    Import(){
        Json.load()
        .then(items=>{

            if(items == null|| !Array.isArray(items)){
                alert("File is of invalid format");
                return
            }

            this.Clear()
            this.items = items.map(x => new Item(x))

            for(const item of this.items){
                this.LocalStorageSave(item)
            }
            
            this.SelectAny()
        })
    }

    SelectAny(){
        const item = localStorage.getItem("tcp-selected")
        if(item){
            this.Select(item)
        }
        if(this.selectedItem == null) {
            if(this.items.length > 0){
                this.Select(this.items[0].id)
            }
        }
    }

    Clear(){
        for(const item of this.items){
            localStorage.removeItem(item.key)
        }
        this.items = []
    }

    DoPassFilter(item){
        return item.name.toLowerCase().includes(this.filter.toLowerCase()) && 
        ((this.categoryFilter == "----all" || item.category == this.categoryFilter)|| (this.categoryFilter == "----none"&& item.category == "") )
    }
    NameChanged(e){
        const value = e.target.value
        this.selectedItem.name = value
        this.LocalStorageSave(this.selectedItem)
    }
    CategoryChanged(e){
        const value = e.target.value
        this.selectedItem.category = value
        this.LocalStorageSave(this.selectedItem)
    }
    LanguageChanged(e){
        const value = e.target.value
        this.inputEditor.language = value
        this.selectedItem.language = value 
        this.LocalStorageSave(this.selectedItem)
    }

    LocalStorageSave(item){
        localStorage.setItem(item.key, JSON.stringify(item.ToRaw()))
    }

    LocalStorageLoadAll(){
        for(const key of Object.keys(localStorage)){
            if(Item.IsValidKey(key)){
                const value = JSON.parse(localStorage.getItem(key))
                this.items.push(new Item(value))
            }
        }
    }
    UpdateOutput(code){
        const [outputs, globalVariables] = Parser.Parse(code);
        this.selectedItem.propertyReplacer = globalVariables
        this.selectedItem.output = outputs
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

    ConfirmDelete(){
        if(confirm(`Are you sure you want to delete ${this.selectedItem.name}?`)){
            this.Delete()
        }
    }
    ConfirmClean(){
        if(confirm(`Are you sure you want to clean all of the texts`)){
            this.Clear()
        } 
    }

    GetSelectedCode(value){
        const result = this.selectedItem.propertyReplacer.ReplaceAll(value)
        return hljs.highlight(result,{language:this.selectedItem.language}).value
    }

    SortItems(){
        this.items.sort((a, b) => {

            const getWeight = (char) => {
                if (!char) return Infinity; // undefined/null
                if (char === '') return 1e14; // empty string
                if (char === '♾️') return 1e15; // infinity symbol example
                return 0; // normal characters
            };

            const weightA = getWeight(a.category);
            const weightB = getWeight(b.category);

            let weight = 0
            if (weightA || weightB) {
                weight = weightA - weightB
            }
            else{
                weight = a.category.localeCompare(b.category)
            }
  
            if (weight !== 0) {
              return weight;
            }
            
            return a.name.localeCompare(b.name);
        });
    }
}

export { Manager }