import { UUID } from "../lib/uuid";

class Property {
    key = ""
    id = "@" + UUID.Create()
    defaultValue = ""
    value = $state("")
    constructor(key, defaultValue) {
        this.key = key
        this.defaultValue = defaultValue
        this.value = defaultValue
    }
    ReplaceAll(text) {
        return text.replaceAll(this.id, this.value ?? this.defaultValue)
    }
}

export { Property }