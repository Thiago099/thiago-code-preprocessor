import hljs from "highlight.js";

function splitInput(input){
    input = input.trim()

    if(input.length == 0){
        return null
    }

    return input.match(/(?:[^,"']+|"[^"]*"|'[^']*')+/g);
}
function getRefs(input){
    const refs = []
    const pairs = splitInput(input)
    
    if(pairs == null){
        return []
    }

    for (const pair of pairs) {
        if(pair.trim().startsWith("@")){
            const name = pair.trim().slice(1).toLocaleLowerCase()
            refs.push(name)
        }
    }

    return refs
}
function parseStringToObject(input) {

    let obj = {};
    const pairs = splitInput(input)

    if(pairs == null){
        return {}
    }

    for (const pair of pairs) {
        if(pair.trim().startsWith("@")){
            continue
        }
        const [key, value] = pair.split(/:(?=(?:[^"]*"[^"]*")*[^"]*$)/);
        if (key && value) {
            let trimValue = value.trim()
            if(trimValue.length > 2 && trimValue[0] == "\""&&trimValue.at(-1) == "\""){
                trimValue = trimValue.substring(1, trimValue.length - 1)
            }
            if(trimValue){
                obj[key.trim().toLocaleLowerCase()] = trimValue;
            }
        }
    }

    return obj;
}

class Parser {
    static Parse(input, language) {
        const context = {};

        const exp = /@(define|output|data)\s+([\w ]+)(.*?)(?=@define|@output|@data|$)/gs;

        let match;

        const output = {}
        const data = {}

        while ((match = exp.exec(input))) {
            if(match[1] == "define"){
                context[match[2].trim().toLocaleLowerCase()] = match[3].trim();
            } else if(match[1] == "output"){
                output[match[2].trim()] = match[3].trim();
            } else if(match[1] == "data"){
                let props = match[3].trim()
                props = props.substring(1, props.length - 1)
                data[match[2].trim().toLocaleLowerCase()] = {obj: parseStringToObject(props), refs: getRefs(props), done: false}
            }
        }


        for(const [key, value] of Object.entries(data)){
            dataLoop(value)
        }
        
        function dataLoop(value){

            if(value.done) {
                return
            }

            value.done = true

            for(const item of value.refs){
                if(item in data){
                    dataLoop(data[item])
                    value.obj = {...data[item].obj, ...value.obj}
                }
            }
        }


        const regex = /@([a-zA-Z0-9_]+)(\(.*?\)){0,1}/gs;

        function loop(main, obj) {
            if(!main) return ""
            return main.replace(regex, (match, varName, props) => {

                varName = varName.trim().toLocaleLowerCase()

                let result = ""

                if (props) {
                    props = props.trim();
                    props = props.substring(1, props.length - 1)

                    let localData = parseStringToObject(props)
                    const localRefs = getRefs(props)

                    for(const item of localRefs){
                        if(item in data){
                            localData = {...data[item].obj, ...localData}
                        }
                    }

                    if(varName in context){
                        const parameters = { ...obj, ...localData }
                        result = loop(context[varName], parameters)
                    }
                }
                else {
                    result = obj[varName] || match;
                }

                return result;
            });
        }
        let result = ""
        
        for(const [key, value] of Object.entries(output)){
            const code = loop(value, {})
            result+= `<h3>${key} <button class="form-control output-copy-button" onclick="window.copyToClipboard('${btoa(code)}')"><i class="fa-solid fa-copy"></i> Copy Code</button></h3><pre class="code-block">${hljs.highlight(code,{language:language}).value}</pre>`;
        }

        return result
    }
}

export { Parser }