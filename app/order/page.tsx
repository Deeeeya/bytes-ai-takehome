"use client" // needs to be a client component to use state and event handlers

import { useState } from "react"
import { Menu, MenuItem, CartItem, Modifier, ModifierOption } from "../types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import menuData from "@/menu.json"

export default function OrderPage() {
    const [cart, setCart] = useState<CartItem[]>([]) // current list of items in cart, starts empty
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null) // tracks which item customer customer clicked on, modifier popup appears and when closed, its back to null
    const [selections, setSelections] = useState<Record<string, string | string[]>>({}) // tracks what customer picked inside modifier popup

    const handleAddClick = (item: MenuItem) => { // this allows you to configure an item that has modifiers before adding to cart
        if (item.modifiers && item.modifiers.length > 0) {
            setSelectedItem(item)
        } else {
            const existing = cart.find((c) => c.menuItemId === item.id)
            if (existing) {
                setCart(cart.map((c) => c.menuItemId === item.id
                    ? { ...c, quantity: c.quantity + 1, totalPrice: c.totalPrice + item.basePrice }
                    : c
                ))
            } else {
                const cartItem: CartItem = {
                    menuItemId: item.id,
                    name: item.name,
                    quantity: 1,
                    selectedModifiers: [],
                    unitPrice: item.basePrice,
                    totalPrice: item.basePrice
                }
                setCart([...cart, cartItem])
            }
        }
    }

    const handleModifierSelect = (modifier: Modifier, option: ModifierOption) => { // runs when a customer clicks on a modifier option --> 'Full' or 'Avocado'
        if (modifier.multiple) { // this whole section allows you to ADD or REMOVE the option depending on whether its already selected
            const current = (selections[modifier.id] as string[]) || []
            const already = current.includes(option.id)
            const updated = already
                ? current.filter((id) => id !== option.id)
                : [...current, option.id]
            setSelections({ ...selections, [modifier.id]: updated })
        } else {
            // handles single selection
            setSelections({ ...selections, [modifier.id]: option.id }) // single option id instead of array of option ids
        }
    }

    const handleConfirmAdd = () => {
        if (!selectedItem) return

        // starting with base price
        let price = selectedItem?.basePrice

        // loop through each modifier and add the price delta of the selected option
        selectedItem.modifiers?.forEach((modifier) => {
            const selected = selections[modifier.id]
            if (modifier.multiple) {
                // for multiple selections, add up all selected option deltas
                const selectedIds = selected as string[]
                selectedIds?.forEach((id) => {
                    const option = modifier.options.find((o) => o.id === id)
                    if (option) price += option.priceDelta
                })
            } else {
                // for single selection, find the selected option and add its delta
                const option = modifier.options.find((o) => o.id === selected)
                if (option) price += option.priceDelta
            }
        })

        // bulding cart item
        const cartItem: CartItem = {
            menuItemId: selectedItem.id,
            name: selectedItem.name,
            quantity: 1,
            selectedModifiers: [],
            unitPrice: price,
            totalPrice: price
        }

        // add to cart, close the dialog, and reset selections
        const existing = cart.find((c) => c.menuItemId === selectedItem.id)
        if (existing) {
            setCart(cart.map((c) => c.menuItemId === selectedItem.id
                ? { ...c, quantity: c.quantity + 1, totalPrice: c.totalPrice + price }
                : c
            ))
        } else {
            setCart([...cart, cartItem])
        }
        setSelectedItem(null)
        setSelections({})
    }

    // uses filter to create a new cart array that excludes the item at the given index
    const handleRemoveItem = (index: number) => {
        setCart(cart.filter((_, i) => i !== index))
    }

    const handleCheckout = async () => { // after clicking checkout, the cart gets sent to /api/orders
        const total = cart.reduce((sum, item) => sum + item.totalPrice, 0)
        const response = await fetch("/api/orders", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items: cart, total })
        })

        if (response.ok) {
            setCart([]) // resetting the cart
        }

    }

    return (
        <main className="min-h-screen bg-black text-white">
            <div className="max-w-6xl mx-auto p-6">
                <div className="py-8 border-b border-zinc-800 mb-8">
                    <h1 className="text-3xl font-bold">Uncle's Deli</h1>
                    <p className="mt-1" style={{ color: "#FF5500" }}>Order fresh, order fast</p>
                </div>
                <div className="flex gap-8">
                    {/* menu - left side */}
                    <div className="flex-1">
                        {(menuData as any).categories.map((category: any) => ( // we map over each category (array) and return a div for it, TS already knows the shape of the data ['as any']
                            <div key={category.name} className="mb-10">
                                <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">
                                    {category.name}
                                </h2>
                                <div className="flex flex-col gap-3">
                                    {category.items.map((item: any) => ( // just like categories, we are mapping over the items (array) in each category
                                        <div
                                            key={item.id}
                                            className={`flex justify-between items-center p-4 rounded-xl border ${item.available
                                                ? "border-zinc-800 bg-zinc-900 hover:border-zinc-600 transition-colors"
                                                : "border-zinc-800 bg-zinc-950 opacity-50"
                                                }`}
                                        >
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-zinc-400">${item.basePrice.toFixed(2)}</p> {/* toFixed(2) formats price to always show 2 decimal places */}
                                            </div>
                                            <button
                                                disabled={!item.available}
                                                onClick={() => handleAddClick(item)}
                                                className="px-4 py-2 text-white text-sm font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                                style={{ backgroundColor: item.available ? "#FF5500" : "#555" }}
                                            >
                                                {item.available ? "Add" : "Unavailable"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* cart - right side */}
                    <div className="w-80">
                        <h2 className="text-lg font-semibold mb-4">Your Cart</h2>
                        {cart.length === 0 ? ( // if the cart is empty, it'll display the paragraph below
                            <p className="text-zinc-500 text-sm">Your cart is empty</p>
                        ) : ( // else, it will show cart items
                            <>
                                {cart.map((cartItem, index) => (
                                    <div key={index} className="flex justify-between items-start mb-4 pb-4 border-b border-zinc-800">
                                        <div>
                                            <p className="font-medium text-sm">{cartItem.name}</p>
                                            <p className="text-zinc-400 text-xs mt-1">x{cartItem.quantity}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm">${cartItem.totalPrice.toFixed(2)}</p>
                                            <button
                                                onClick={() => handleRemoveItem(index)}
                                                className="text-zinc-500 hover:text-white cursor-pointer transition-colors"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-between font-semibold mt-4 pt-4 border-t border-zinc-700">
                                    <span>Total</span>
                                    <span>${cart.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}</span> {/* cart.reduce loops over an array and accumulates a single value */}
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    className="w-full py-3 mt-6 rounded-lg text-white font-medium cursor-pointer"
                                    style={{ backgroundColor: "#FF5500" }}
                                >
                                    Checkout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Modifier Popup */}
            <Dialog open={selectedItem !== null} onOpenChange={() => setSelectedItem(null)}>
                <DialogContent className="bg-zinc-900 text-white border-zinc-800">
                    <DialogHeader>
                        <DialogTitle>{selectedItem?.name}</DialogTitle>
                    </DialogHeader>
                    {selectedItem?.modifiers?.map((modifier) => ( // modifiers is set to optional in index.ts
                        <div key={modifier.id} className="mb-4">
                            <p className="font-medium mb-2">
                                {modifier.label}
                                {modifier.required && <span style={{ color: "#FF5500" }} className="text-sm ml-1">*required</span>}
                            </p>
                            <div className="flex flex-col gap-2">
                                {modifier.options.map((option) => (
                                    <button // checks if option is currently in 'selections' and if so, highlights it with an orange border
                                        key={option.id}
                                        className={`p-3 rounded-lg border text-left transition-colors ${modifier.multiple
                                            ? (selections[modifier.id] as string[])?.includes(option.id)
                                                ? "border-orange-500 bg-zinc-800"
                                                : "border-zinc-700 hover:border-orange-500"
                                            : selections[modifier.id] === option.id
                                                ? "border-orange-500 bg-zinc-800"
                                                : "border-zinc-700 hover:border-orange-500"
                                            }`}
                                        onClick={() => handleModifierSelect(modifier, option)}
                                    >
                                        <span>{option.label}</span>
                                        {option.priceDelta > 0 && (
                                            <span className="text-zinc-400 text-sm ml-2">+${option.priceDelta.toFixed(2)}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={handleConfirmAdd}
                        className="w-full py-3 mt-4 rounded-lg text-white font-medium transition-colors"
                        style={{ backgroundColor: "#FF5500" }}
                    >
                        Add to Cart
                    </button>
                </DialogContent>
            </Dialog>
        </main>
    )
}
