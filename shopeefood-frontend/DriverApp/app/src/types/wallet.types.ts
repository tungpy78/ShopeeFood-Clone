export interface Wallet{
    balance: Number,
    transactions:Transactions[]
}

export interface Transactions{
    id:string,
    driver_id: number,
    amount: number,
    type: string,
    description: string,
    createdAt: string,
    updatedAt: string
}