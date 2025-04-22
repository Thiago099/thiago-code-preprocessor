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
            outputHtml += `<h1>${key}<button id="copy-${current.id}">Copy</button></h1><pre id="${current.id}"></pre>`
        }
        for(const [key, value] of Object.entries(this.propertyReplacer.data)){
            inputHtml += `<h1>${key}</h1>`
            for(const item of value){
                inputs.push(item.id)
                inputHtml += `<div><label>${capitalizeFirstLetter(item.key)}</label><input id="${item.id}" type="text" value="${item.defaultValue}"/><button id="reset-${item.id}" data-value="${item.defaultValue}">Reset</button></div>`
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
            <div class="footer">
                <button id="downloadSourceButton"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg> Download Source</button>
                <a target="_blank" href="https://thiago099.github.io/thiago-code-preprocessor/"><button><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M368.4 18.3L312.7 74.1 437.9 199.3l55.7-55.7c21.9-21.9 21.9-57.3 0-79.2L447.6 18.3c-21.9-21.9-57.3-21.9-79.2 0zM288 94.6l-9.2 2.8L134.7 140.6c-19.9 6-35.7 21.2-42.3 41L3.8 445.8c-3.8 11.3-1 23.9 7.3 32.4L164.7 324.7c-3-6.3-4.7-13.3-4.7-20.7c0-26.5 21.5-48 48-48s48 21.5 48 48s-21.5 48-48 48c-7.4 0-14.4-1.7-20.7-4.7L33.7 500.9c8.6 8.3 21.1 11.2 32.4 7.3l264.3-88.6c19.7-6.6 35-22.4 41-42.3l43.2-144.1 2.7-9.2L288 94.6z"/></svg> Editor</button></a>
                <a target="_blank" href="https://github.com/Thiago099/thiago-code-preprocessor"><button><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M96 0C43 0 0 43 0 96L0 416c0 53 43 96 96 96l288 0 32 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l0-64c17.7 0 32-14.3 32-32l0-320c0-17.7-14.3-32-32-32L384 0 96 0zm0 384l256 0 0 64L96 448c-17.7 0-32-14.3-32-32s14.3-32 32-32zm32-240c0-8.8 7.2-16 16-16l192 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-192 0c-8.8 0-16-7.2-16-16zm16 48l192 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-192 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/></svg> Editor Documentation</button></a>
            </div>
        </div>
        <script>
        const outputs = ${JSON.stringify(outputs)}
        const inputs = ${JSON.stringify(inputs)}
        const source = '${JSON.stringify(this.ToRaw())}'
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
        const downloadSourceButton = document.getElementById("downloadSourceButton")
        downloadSourceButton.addEventListener("click", downloadSource)
        function downloadSource() {
            const blob = new Blob([source], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = "${this.name}.json"
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
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
            grid-template-areas: "input output" "footer footer";
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 100px; 
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
        .footer{
            grid-area: footer;
            display: flex;
            justify-content: center;
            align-items: center;
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
            display: inline-flex;
            justify-content: center;
            align-items: center;
        }
        h1{
            display: flex;
            align-items: center;
        }
        button > svg{
            width: 20px;
            margin-right: 5px;
        }
        button > svg > path{
            fill: white;
        }
        </style>
        `
        return html
    }
}

export { Item }