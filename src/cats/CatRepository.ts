import { Cat } from './Cat'
import { catsById, exampleCats } from './exampleCats'

export class CatRepository {
    public getById(id: string): Cat | undefined {
        return catsById[id]
    }

    public getAll(): Cat[] {
        return exampleCats
    }
}
