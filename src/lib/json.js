import { Persistence } from "./persistence";
class Json{
    static  load() {
      return Persistence.load(".json")
      .then(x=>{
        const json = JSON.parse(x);
        return json
      })
    }

    static save(obj, filename = 'data.json') {
      const jsonString = JSON.stringify(obj, null, 2);
      Persistence.save(jsonString, filename)
    }
}

export { Json }