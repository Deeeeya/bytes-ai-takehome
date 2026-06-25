import { NextResponse } from "next/server";
import { getOrders, addOrder } from "@/lib/store";

export function GET() {
    // get all orders and return as JSON
    const orders = getOrders()
    return NextResponse.json(orders)
}

export async function POST(request: Request) {
    // function receives data in the request body (cart items the customer checks out with)
    const body = await request.json()

    if (!body.items || body.items.length === 0) { // make sure cart isnt empty and body.items does exist
        return NextResponse.json({ error: "Empty cart" } , { status: 400 })
    }
    const newOrder = {
        id: crypto.randomUUID(), // generate random id
        items: body.items,
        total: body.total,
        status: "new" as const, // makes sure it uses the exact status string
        createdAt: new Date()
    }

    addOrder(newOrder)
    return NextResponse.json(newOrder, { status: 201 })
}