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
        let outputHtml = ""
        let inputHtml = ""
        const outputs = []
        const inputs = []
        for(const [key, value] of Object.entries(this.output)){
            
            const current = {id:UUID.Create(), value:value}
            outputs.push(current)
            outputHtml += `<h1>${key}<button id="copy-${current.id}">Copy</button></h1>\n<pre id="${current.id}"></pre>\n`
        }
        for(const [key, value] of Object.entries(this.propertyReplacer.data)){
            inputHtml += `<h1>${key}</h1>\n`
            for(const item of value){
                inputs.push(item.id)
                inputHtml += `<div><label>${capitalizeFirstLetter(item.key)}</label>\n<input id="${item.id}" type="text" value="${item.defaultValue}"/><button id="reset-${item.id}" data-value="${item.defaultValue}">Reset</button></div>`
            }
        }
        const html = `
        <div class="container">
            <div class="output">
                ${outputHtml}
            </div>
            <div class="input">
                ${inputHtml}
            </div>
        </div>
        <script>
        const outputs = ${JSON.stringify(outputs)}
        const inputs = ${JSON.stringify(inputs)}
        function getCode(output, process = x => x){
            let value = output.value
            for(const input of inputs){
                const inputElement = document.getElementById(input)
                value = value.replaceAll(input, process(inputElement.value))
            }
            return value
        }
        function update(){
            for(const output of outputs){
                const element = document.getElementById(output.id)
     
                element.innerHTML = getCode(output, x => "<span class=\\"replaced-value\\">" + x + "</span>")
            }
        }
        update()
        for(const input of inputs){
            const inputElement = document.getElementById(input)
            inputElement.addEventListener("input", e=>{
                update()
            })
            const resetElement = document.getElementById("reset-" + input)
            resetElement.addEventListener("click", e=>{
                inputElement.value = resetElement.dataset.value
                update()
            })
        }
        for(const output of outputs){
            const copyElement = document.getElementById("copy-" + output.id)
            copyElement.addEventListener("click", e=>{
                const value = getCode(output)
                navigator.clipboard.writeText(value);
            })
        }
        </script>
        <style>
        body {
            margin: 0;
            background-color: black;
            color:white;
        }
        .container {
            width: 100vw;
            height: 100vh;
            display: grid;
            grid-template-areas: "input output";
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr; 
        }
        .input {
            grid-area: input;
            display: flex;
            align-items: center;
            flex-direction: column;
            overflow-y: auto;
        }
        .output {
            overflow-y: auto;
            grid-area: output;
        }
        .replaced-value{
            color: cyan;
        }
        label{
            display: block;
            margin-top: 10px;
        }
        input{
            background-color: black;
            color:white;
            border:1px solid white;
            width: 500px;
            padding: 10px;
            border-radius: 5px;
        }
        button{
            background-color: black;
            color:white;
            border:1px solid white;
            padding: 10px;
            border-radius: 5px;
            margin-left: 10px;
            cursor: pointer;
        }
        h1{
            display: flex;
            align-items: center;
        }
        </style>
        `
        return html
    }
}

export { Item }