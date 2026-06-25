import { NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/store";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { // dynamic route params are passed as a second argument
    const { id } = await params
    const { status } = await request.json()
    updateOrderStatus(id, status) // updates order in the array
    return NextResponse.json({ success: true })
}
