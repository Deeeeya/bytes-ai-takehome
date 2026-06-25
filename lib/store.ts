import { Order } from "@/app/types";

let orders: Order[] = [] // this holds a list of orders which starts off empty

export function getOrders(): Order[] {
    // return all orders
    return orders
}

export function addOrder(order: Order): void {
    // add the order to orders array
    orders.push(order)
}

export function updateOrderStatus(id: string, status: Order["status"]): void {
    // find the order with the matching id and update status
    const order = orders.find((o) => o.id === id)
    if (order) {
        order.status = status
    }
}