import { UUID } from "../lib/uuid";
function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}
class Item {
    id = UUID.Create()
    name = $state("")
    language = $state("javascript")
    code = $state("")
    category = $state("")
    propertyReplacer = $state(null)
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
    ToHtml(){
        let html = ""
        const outputs = []
        for(const [key, value] of Object.entries(this.output)){
            
            const current = {id:UUID.Create(), value:value}
            outputs.push(current)
            html += `<h1>${key}</h1>\n<pre id="${current.id}"></pre>\n`
        }
        for(const [key, value] of Object.entries(this.propertyReplacer.data)){
            html += `<h1>${key}</h1>\n`
            for(const item of value){
                html += `<div><label>${capitalizeFirstLetter(item.key)}</label>\n<input id="${item.id}" type="text" value="${item.defaultValue}"/></div>`
            }
        }
        return html
    }
}

export { Item }