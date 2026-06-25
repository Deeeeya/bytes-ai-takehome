"use client"

import { useEffect, useState } from "react"
import { Order } from "../types"

export default function DashboardPage() {
    const [orders, setOrders] = useState<Order[]>([]) // holds list of all orders fetched from '/api/orders'
    const [filter, setFilter] = useState<Order["status"] | "all">("all") // tracks which status the staff wants to see (could be all or any of the 4 statuses)

    // add polling to keep the dashboard live by using useEffect

    const fetchOrders = async () => {
        const response = await fetch("/api/orders")
        const data = await response.json()
        setOrders(data)
    }

    useEffect(() => {
        fetchOrders() // fetches immediately on load
        const interval = setInterval(fetchOrders, 5000) // every 5 seconds
        return () => clearInterval(interval) // cleanup function that runs when we leave the page to prevent memory leak
    }, [])

    const todaysOrders = orders.filter(order => new Date(order.createdAt).toDateString() === new Date().toDateString()) // filters full 'orders' array to only keep orders when the date matches todays date
    const totalRevenue = todaysOrders.reduce((sum, o) => sum + o.total, 0)
    const avgOrderValue = todaysOrders.length > 0 ? totalRevenue / todaysOrders.length : 0

    const handleStatusUpdate = async (orderId: string, currentStatus: Order["status"]) => {
        const statusFlow: Record<Order["status"], Order["status"] | null> = { // tells where each status will proceed next
            "new": "preparing",
            "preparing": "ready",
            "ready": "completed",
            "completed": null
        }

        const nextStatus = statusFlow[currentStatus]
        if (!nextStatus) return

        await fetch(`/api/orders/${orderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: nextStatus })
        })

        fetchOrders() // refresh orders immediately after update
    }

    return (
        <main className="min-h-screen bg-black text-white">
            <div className="max-w-6xl mx-auto p-6">
                <h1 className="text-3xl font-bold py-8 border-b border-zinc-800 mb-8">
                    Uncle's Deli — <span style={{ color: "#FF5500" }}>Dashboard</span>
                </h1>
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <p className="text-zinc-400 text-sm">Total Orders Today</p>
                        <p className="text-2xl font-bold mt-1">{todaysOrders.length}</p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <p className="text-zinc-400 text-sm">Total Revenue</p>
                        <p className="text-2xl font-bold mt-1">${totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <p className="text-zinc-400 text-sm">Avg Order Value</p>
                        <p className="text-2xl font-bold mt-1">${avgOrderValue.toFixed(2)}</p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <p className="text-zinc-400 text-sm">Orders by Status</p>
                        <div className="mt-1 text-sm">
                            {["new", "preparing", "ready", "completed"].map(status => ( // mapping over array of 4 possible statuses, we create a row for each one
                                <div key={status} className="flex justify-between">
                                    <span className="text-zinc-400 capitalize">{status}</span>
                                    <span>{todaysOrders.filter(o => o.status === status).length}</span> {/* shows how many of todays orders we have for that specific status */}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 mb-6">
                    {["all", "new", "preparing", "ready", "completed"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status as Order["status"] | "all")}
                            className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors cursor-pointer"
                            style={{
                                backgroundColor: filter === status ? "#FF5500" : "#18181b",
                                border: filter === status ? "1px solid #FF5500" : "1px solid #3f3f46"
                            }}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <div className="flex flex-col gap-4">
                    {orders
                        .filter(order => filter === "all" || order.status === filter)
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // sorts orders by newest first, if b is newer than a, then b comes first
                        .map(order => (
                            <div key={order.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm text-zinc-400">Order #{order.id.slice(0, 8)}</p>
                                        <p className="text-sm text-zinc-400 mt-1">{new Date(order.createdAt).toLocaleTimeString()}</p>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                                        style={{ backgroundColor: "#FF5500", color: "white" }}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="mb-4">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex justify-between text-sm py-1">
                                            <span>{item.name} x{item.quantity}</span>
                                            <span className="text-zinc-400">${item.totalPrice.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-zinc-800">
                                    <span className="font-semibold">Total: ${order.total.toFixed(2)}</span>
                                    {order.status !== "completed" && (
                                        <button
                                            onClick={() => handleStatusUpdate(order.id, order.status)}
                                            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
                                            style={{ backgroundColor: "#FF5500" }}
                                        >
                                            Mark as {order.status === "new" ? "Preparing" : order.status === "preparing" ? "Ready" : "Completed"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </main>
    )
}