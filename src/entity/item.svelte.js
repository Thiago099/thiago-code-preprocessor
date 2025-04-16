import { UUID } from "../lib/uuid";

class Item {
    id = UUID.Create()
    name = $state("")
    language = $state("javascript")
    code = $state("")
    category = $state("")
    outputData = $state(null)
    output = $state(null)
    static matchKeyRegex = /tcp-item-[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
    get key() {
        return "tcp-item-" + this.id
    }
    constructor(source = null) {
        if(source != null){
            this.Assing(source)
        }
    }
    static IsValidKey(text){
        return Item.matchKeyRegex.test(text)
    }
    Assing(source){
        this.id = source.id
        this.name = source.name
        this.language = source.language
        this.code = atob(source.code)
        this.category = source.category
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

export { Item }