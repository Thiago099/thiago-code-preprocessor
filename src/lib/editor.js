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
            automaticLayout: true,
            showUnused:false
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
        this.editor.setPosition({ lineNumber: 1, column: 1 })
        // this.editor.focus()
        this.editor.setScrollTop(0)
    }
    get value() {
        return this.editor.getValue()
    }
    static get languages(){
        return monaco.languages.getLanguages();
    }
    static GetLanguageName(input){
        if(input == null){
            return null
        }
        for(const language of this.languages){
            if(language.id == input){
                if(language.aliases){
                    return language.aliases[0]
                }
                return language.id
            }
        }
        return null
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
        const regex = /#data(\s*[a-zA-Z0-9_]+\s*)(\(.*?\)){0,1}|(#define)(\s*\w+)|(#output)(\s*[^\n]+)|@([a-zA-Z0-9_]+\s*)(\(.*?\))|\$([a-zA-Z0-9_]+)/gs;
        let match;
        
        while ((match = regex.exec(text)) !== null) {

            // if(match[1]){
            //     highlight(model, matches, match.index, match.index+7, "instruction-highlight")
            //     highlight(model, matches, match.index + 8, match.index + 8 + match[2].length, "variable-highlight")
            // }
            // else{
            let start;
            if(match[1]){
                start = match.index + "data".length+1
                highlight(model, matches, match.index, start,  "instruction-highlight")
                highlight(model, matches, start, start + match[1].length,  "data-highlight")
                start += match[1].length
            } else if(match[3] || match[5]){
                const name = match[3] ?? match[5]
                const prop = match[4] ?? match[6]
                start = match.index + name.length
                highlight(model, matches, match.index, start, "instruction-highlight")
                highlight(model, matches, start, start + prop.length, match[4] ? "function-highlight" : "value-highlight")
            }
            else if(match[7]){
                start = match.index + match[7].length+1 
                 highlight(model, matches, match.index, start, match[8]?"function-highlight":"property-highlight")
            }
            else if(match[9]){
                start = match.index + match[9].length+1 
                highlight(model, matches, match.index, start, match[8]?"function-highlight":"property-highlight")
            }
            
            if(match[2] || match[8]){
                const name = match[1] ? "data" : match[7]?.trim()?.toLocaleLowerCase();

                const data = match[2] || match[8];
                const end = start + data.length
                
                highlight(model, matches, start, start+1, "parenthesis-highlight")
                highlight(model, matches, end-1, end, "parenthesis-highlight")

                let pad = start

                for(const item of split(data, /(?:[^,"']+|"[^"]*"|'[^']*')+/gs))
                {
                    const itemSplit =item.split(/:(?=(?:[^"]*"[^"]*")*[^"]*$)/)

                    if(itemSplit.length == 2){
                        const c = pad + itemSplit[0].length + 1
                        highlight(model, matches, pad+1, c, "property-highlight")
                        highlight(model, matches, c, c+1, "parenthesis-highlight")
                        highlight(model, matches, c+1, pad+item.length+1, "value-highlight")
                    }
                    else{
                        const isVariable = item.trim().startsWith("@")
                        highlight(model, matches, pad+1, pad+item.length+1, isVariable ? "data-highlight" : "property-highlight")
                    }

                    pad += item.length + 1
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