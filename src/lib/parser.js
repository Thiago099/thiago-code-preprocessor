import { PropertyReplacer, Property } from "../entity/_entity";

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
    static Parse(input) {
        const context = {};

        const exp = /#(define|output|data)\s+([^\n\()]+)(.*?)(?=#define|#output|#data|$)/gs;

        let match;

        const output = {}
        const data = {}

        const globalVariables = new PropertyReplacer()

        while ((match = exp.exec(input))) 
        {
            if (match[1] == "define")
            {
                context[match[2].trim().toLocaleLowerCase()] = match[3].trim();
            } 
            else if (match[1] == "output")
            {
                output[match[2].trim()] = match[3].trim();
            } 
            else if (match[1] == "data")
            {
                let props = match[3].trim()
                props = props.substring(1, props.length - 1)
                const parsed = parseStringToObject(props)
                const obj = {}
                const out = []
                
                for (const [key, value] of Object.entries(parsed)) {
                    const current = new Property(key, value)
                    obj[key] = current.id
                    out.push(current)
                }

                if (Object.keys(out).length > 0){
                    globalVariables.Add(match[2].trim(), out)
                }

                data[match[2].trim().toLocaleLowerCase()] = {obj: obj, refs: getRefs(props), done: false}
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

        const regex = /@([a-zA-Z0-9_]+)(\(.*?\))|\$([a-zA-Z0-9_]+)/gs;

        function loop(main, obj) {
            if(!main) return ""
            return main.replace(regex, (match, functionName, props, varName) => {
                let result = match
                if (functionName && props) {
                    functionName = functionName.trim().toLocaleLowerCase()
                    if(functionName in context) {
                        
                        props = props.trim();
                        props = props.substring(1, props.length - 1)

                        let localData = parseStringToObject(props)
                        const localRefs = getRefs(props)

                        for(const item of localRefs){
                            if(item in data){
                                localData = {...data[item].obj, ...localData}
                            }
                        }

                        const parameters = { ...obj, ...localData }
                        result = loop(context[functionName], parameters)
                    }
                }
                else if(varName) {
                    varName = varName.trim().toLocaleLowerCase()
                    if(varName in obj) {
                        result = obj[varName];
                    }
                }

                return result;
            });
        }
        
        let outputs = {}
        
        for(const [key, value] of Object.entries(output)){
            const code = loop(value, {})
            outputs[key] = code
        }

        return [outputs, globalVariables]
    }
}

export { Parser }