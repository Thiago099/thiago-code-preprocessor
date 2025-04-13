import hljs from "highlight.js";
function parseStringToObject(input) {
    const pairs = input.match(/(?:[^,"']+|"[^"]*"|'[^']*')+/g);
    const obj = {};
    for (const pair of pairs) {
        const [key, value] = pair.split(/:\s*/gi);
        if (key && value) {
            let trimValue = value.trim()
            if(trimValue.length > 2 && trimValue[0] == "\""&&trimValue.at(-1) == "\""){
                trimValue = trimValue.substring(1, trimValue.length - 1)
            }
            obj[key.trim()] = trimValue;
        }
    }
    return obj;
}

class Parser {
    static Parse(input, language) {
        const context = {};

        const exp = /@(define|output)\s+([\w ]+)(.*?)(?=@define|@output|$)/gs;

        let match;

        const output = {}

        while ((match = exp.exec(input))) {
            if(match[1] == "define"){
                context[match[2]] = match[3].trim();
            } else if(match[1] == "output"){
                output[match[2]] = match[3].trim();
            }
        }

        const regex = /@([a-zA-Z0-9_]+)(\(.*?\)){0,1}/gs;

        function loop(main, obj) {
            if(!main) return ""
            return main.replace(regex, (match, varName, props) => {

                varName = varName.trim()

                let result = ""

                if (props && varName in context) {
                    const parameters = { ...obj, ...parseStringToObject(props.substring(1, props.length - 1)) }
                    result = loop(context[varName], parameters)
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