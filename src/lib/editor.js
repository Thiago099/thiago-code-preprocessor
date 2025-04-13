import * as monaco from 'monaco-editor'

function highlight(model, matches, start, end, className){
    const startPosition = model.getPositionAt(start);
    const endPosition = model.getPositionAt(end);
    matches.push({
        range: new monaco.Range(
            startPosition.lineNumber,
            startPosition.column,
            endPosition.lineNumber,
            endPosition.column
        ),
        options: {
            inlineClassName: className
        }
    });
}

function split(data, exp){
    let match;
    const result = []
    while ((match = exp.exec(data.substring(1, data.length - 1))) !== null) {
        result.push(match[0])
    }
    return result
}

class Editor {
    constructor(element, language, value = "", readOnly = false) {

        this.editor = monaco.editor.create(element, {
            value: value,
            language: language,
            theme: 'vs-dark',
            readOnly: readOnly,
            automaticLayout: true
        })
        this.editor.updateOptions({renderValidationDecorations: 'off', showDeprecated: false});
        this.editor.onDidChangeModelContent((event) => {
            this.highlightSpecialVariables()
        });
        this.decorationsCollection = null; 
    }
    set language(value){
        const model = this.editor.getModel();
        monaco.editor.setModelLanguage(model, value);
    }
    get language(){
        const model = this.editor.getModel();
        return model.getLanguageId();
    }
    set value(value) {
        this.editor.setValue(value)
    }
    get value() {
        return this.editor.getValue()
    }
    static get languages(){
        return monaco.languages.getLanguages();
    }
    addEventListener(callback) {
        this.editor.onDidChangeModelContent((event) => {
            callback(this.value)
        });
    }
    
    highlightSpecialVariables() {
        // Get the model
        const model = this.editor.getModel();
        if (!model) return;
        
        const text = model.getValue();
        const matches = [];
        
        // Find all occurrences of @myVar
        const regex = /@data(\s*[a-zA-Z0-9_]+\s*)(\(.*?\)){0,1}|@([a-zA-Z0-9_]+\s*)(\(.*?\)){0,1}/gs;
        let match;
        
        while ((match = regex.exec(text)) !== null) {

            // if(match[1]){
            //     highlight(model, matches, match.index, match.index+7, "instruction-highlight")
            //     highlight(model, matches, match.index + 8, match.index + 8 + match[2].length, "variable-highlight")
            // }
            // else{
            const instructions = ["define","output"]
            let start;
            if(match[1]){
                start = match.index + "data".length+1
                highlight(model, matches, match.index, start,  "instruction-highlight")
                highlight(model, matches, start, start + match[1].length,  "variable-highlight")
                start += match[1].length
            }
            else{
                start = match.index + match[3].length+1 
                highlight(model, matches, match.index, start, instructions.includes(match[3].trim().toLocaleLowerCase())? "instruction-highlight" :"variable-highlight")
            }
            const name = match[1]?"data":match[3].trim().toLocaleLowerCase();
            if(match[2] || match[4]){

                const data = match[2] || match[4];
                const end = start + data.length
                
                highlight(model, matches, start, start+1, "parenthesis-highlight")
                highlight(model, matches, end-1, end, "parenthesis-highlight")

                if(!["define","output"].includes(name)){
                    let pad = start

                    for(const item of split(data, /(?:[^,"']+|"[^"]*"|'[^']*')+/gs))
                    {
                        const itemSplit =item.split(/:(?=(?:[^"]*"[^"]*")*[^"]*$)/)
    
                        if(itemSplit.length == 2){
                            const c = pad + itemSplit[0].length + 1
                            highlight(model, matches, pad+1, c, "var-highlight")
                            highlight(model, matches, c, c+1, "parenthesis-highlight")
                            highlight(model, matches, c+1, pad+item.length+1, "value-highlight")
                        }
                        else{
                            highlight(model, matches, pad+1, pad+item.length+1, "var-highlight")
                        }
    
                        pad += item.length + 1
                    }
                }

            }
        }
        
        if (this.decorationsCollection) {
            this.decorationsCollection.clear();
        }
        this.decorationsCollection = this.editor.createDecorationsCollection(matches);
    }

  
}

export { Editor }