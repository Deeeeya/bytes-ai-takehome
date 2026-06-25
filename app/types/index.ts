export type ModifierOption = {
    id: string,
    label: string,
    priceDelta: number
}

export type Modifier = {
    id: string,
    label: string,
    required: boolean,
    multiple?: boolean // optional
    options: ModifierOption[]
}

export type MenuItem = {
    id: string,
    name: string,
    basePrice: number,
    available: boolean,
    modifiers?: Modifier[] // optional
}

export type Category = {
    name: string,
    items: MenuItem[]
}

export type Menu = {
    restaurant: string,
    currency: string,
    categories: Category[]
}

// used to track which modifiers the customer selected and the quantity of the item

export type CartItem = {
    menuItemId: string,
    name: string,
    quantity: number,
    selectedModifiers: ModifierOption[],
    unitPrice: number,
    totalPrice: number
}

// what gets saved when a customer checks out

export type Order = {
    id: string,
    items: CartItem[],
    total: number,
    status: "new" | "preparing" | "ready" | "completed",
    createdAt: Date
}