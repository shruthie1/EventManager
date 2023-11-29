export type CatGender = 'female' | 'male' | 'diverse'

export interface Cat {
    id: string
    name: string
    breed: string
    gender: CatGender
    age: number
}

export interface CatsStatistics {
    amount: number
    averageAge: number
}