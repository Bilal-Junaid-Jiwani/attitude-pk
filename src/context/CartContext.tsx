'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/ToastProvider';

export interface CartItem {
    _id: string; // Product ID
    name: string;
    price: number;
    imageUrl: string;
    quantity: number;
    subCategory?: string; // e.g. "Shampoo + Wash"
    originalPrice?: number; // Added to track discounts
    variantId?: string; // For variant stock tracking
    productId?: string; // Main Product ID (for API lookup)
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: CartItem) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    restoreCart: (items: CartItem[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { addToast } = useToast();

    // Load from LocalStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('attitude_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
    }, []);

    // Save to LocalStorage on change
    useEffect(() => {
        localStorage.setItem('attitude_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product: CartItem) => {

        setCart((prev) => {
            const existing = prev.find((item) => item._id === product._id);
            if (existing) {
                // If checking here, we effectively run this twice if we need the toast message, 
                // but since setCart updater must be pure, we set the message outside or use effect.
                // A better pattern:

                // We'll calculate the new cart state first
                const newState = prev.map((item) =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + product.quantity }
                        : item
                );
                return newState;
            }
            return [...prev, product];
        });

        // We can't know for sure if it was update or add inside the setter without side effects.
        // So let's check current state (approximation) or just show a generic "Added" message,
        // OR check existing BEFORE set state.

        // Let's check existing before setting state to be precise with toast
        const existingItem = cart.find(item => item._id === product._id);
        if (existingItem) {
            addToast(`Updated quantity for ${product.name}`, 'success');
        } else {
            addToast(`Added ${product.name} to cart`, 'success');
        }

        setIsCartOpen(true); // Open drawer on add
    };

    const removeFromCart = (id: string) => {
        setCart((prev) => prev.filter((item) => item._id !== id));
        addToast('Removed from cart', 'info');
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item._id === id) {
                    const newQty = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQty };
                }
                return item;
            })
        );
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('attitude_cart');
    };

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartCount,
                cartTotal,
                isCartOpen,
                openCart,
                closeCart,
                restoreCart: (items: CartItem[]) => {
                    setCart(items);
                    localStorage.setItem('attitude_cart', JSON.stringify(items));
                    addToast('Cart restored successfully', 'success');
                }
            }}
        >
            {children}
            {/* We will render the Drawer inside the Provider or Layout. 
                Ideally layout, but we can do it here if we import it, 
                BUT that might cause circular deps if Drawer uses useCart.
                Better to put Drawer in Layout.
            */}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
