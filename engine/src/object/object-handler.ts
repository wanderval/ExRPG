
import { ObjectData, ObjectOption } from "./object-data";

export async function initObjects(resPath: string) {
    const objMap = new Map<string, ObjectData>()
    const objList: string[] = []

    const data = await fetch(resPath + "/data/object.json").then(text => text.json())
    data.forEach((objData: any) => {
        const id = objData.id
        const name = objData.name
        const sprite = objData.sprite
        const width = objData.width ? objData.width : 1
        const options: ObjectOption[] = objData.options ? objData.options.map((option: string) => [
            option, option.toLowerCase().replace(" ", "_")
        ]) : []

        if(objMap.has(id)) {
            throw "IMPORTANT - duplicate object id: " + id
        }

        objList.push(id)
        objMap.set(id, new ObjectData(id, name, resPath + "/obj/" + sprite + ".png", width, options))
    });

    return new ObjectHandler(objMap, objList)
}

export class ObjectHandler {

    private readonly objMap: Map<string, ObjectData>
    private readonly objList: string[]

    constructor(objMap: Map<string, ObjectData>, objList: string[]) {
        this.objMap = objMap
        this.objList = objList
    }

    public search(prefix: string) {
        return this.objList.filter(obj => obj.startsWith(prefix))
    }

    public get(id: string) {
        return this.objMap.get(id)
    }

}