class GlobalData {
    data = {}
    constructor(){
    }
    Add(key, value){
        this.data[key] = value
    }
    ReplaceAll(text){
        for(const value of Object.values(this.data)){
            for(const item of value){
                text = item.ReplaceAll(text)
            }
        }
        return text
    }
}

export { GlobalData }