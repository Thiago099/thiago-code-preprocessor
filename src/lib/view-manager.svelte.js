class ViewManager{
    displayLeftPanel = $state(this.Load("displayLeftPanel"))
    displayRightPanel = $state(this.Load("displayRightPanel"))
    displayLeftView = $state(this.Load("displayLeftView"))
    displayRightView = $state(this.Load("displayRightView"))

    Save(name, value){
        localStorage.setItem("tcp-enable-"+name, JSON.stringify(value))
    }

    Load(name){
        const result = JSON.parse(localStorage.getItem("tcp-enable-"+name))??true
        return result
    }

    get all(){
        const areas = []
        const header = []
        const columns = []

        if(this.displayLeftPanel){
            areas.push("panel")
            header.push("header")
            columns.push("300px")
        }
        if(this.displayLeftView){
            areas.push("left")
            header.push("header")
            columns.push("minmax(0, 1fr)")
        }
        if(this.displayRightView){
            areas.push("right")
            header.push("header")
            columns.push("minmax(0, 1fr)")
        }
        if(this.displayBlank){
            areas.push("blank")
            header.push("header")
            columns.push("minmax(0, 1fr)")
        }
        if(this.displayRightPanel){
            areas.push("panel2")
            header.push("header")
            columns.push("300px")
        }
        return {header, areas, columns}
    }
    get gridColumns(){
        const all = this.all
        return all.columns.join(" ")
    }
    get gridAreas(){
        const all = this.all
        return [all.header, all.areas].map(x=>`'${x.join(' ')}'`).join("\n")
    }
    get displayBlank(){
        return !this.displayLeftView && !this.displayRightView
    }
}
export { ViewManager }