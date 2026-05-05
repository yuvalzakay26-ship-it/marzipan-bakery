import React, { createContext, useContext, useState, useEffect } from 'react';
import { productsData } from '../data/productsData';

// Helper to find product by ID across all categories
const allProducts = Object.values(productsData).flat();
const getProductById = (id) => allProducts.find(item => item.id === id);

// Additive aliases for checkout/order/payment compatibility.
// Original fields (priceValue, image, slug) are preserved.
const withAliases = (item) => ({
    ...item,
    price: item.priceValue,
    image_url: item.image,
    slug: item.slug,
});

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    // Load initial state from localStorage and rehydrate with fresh data
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem('marzipanCart');
            if (!savedCart) return [];

            const parsedCart = JSON.parse(savedCart);

            if (!Array.isArray(parsedCart)) {
                // Legacy format or invalid data - reset cart
                return [];
            }

            // Rehydration logic:
            // 1. Map saved items (which should be just {id, quantity}) to full product details
            // 2. Filter out products that no longer exist
            // 3. Use fresh data (price, name, image) from productsData
            return parsedCart
                .map(savedItem => {
                    const product = getProductById(savedItem.id);
                    if (!product) return null; // Product deleted from catalog
                    return withAliases({ ...product, quantity: savedItem.quantity });
                })
                .filter(item => item !== null);

        } catch (error) {
            console.error("Failed to load cart from localStorage", error);
            return [];
        }
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    // Persist ONLY ID and Quantity to localStorage
    useEffect(() => {
        try {
            const minimizedCart = cartItems.map(item => ({
                id: item.id,
                quantity: item.quantity
            }));
            localStorage.setItem('marzipanCart', JSON.stringify(minimizedCart));
        } catch (error) {
            console.error("Failed to save cart to localStorage", error);
        }
    }, [cartItems]);

    const addToCart = (product) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            // Ensure we use the full product object passed (which should match schema)
            return [...prevItems, withAliases({ ...product, quantity: 1 })];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, value, mode = "delta") => {
        setCartItems(prevItems => {
            return prevItems.map(item => {
                if (item.id === productId) {
                    const newQuantity = mode === "absolute"
                        ? Math.max(0, value)
                        : Math.max(0, item.quantity + value);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            }).filter(item => item.quantity > 0);
        });
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const toggleCart = () => setIsCartOpen(prev => !prev);

    // Calculated values using priceValue
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cartItems.reduce((total, item) => {
        // Fallback to 0 if priceValue is missing for some reason
        const price = typeof item.priceValue === 'number' ? item.priceValue : 0;
        return total + (price * item.quantity);
    }, 0);

    const value = {
        cartItems,
        isCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleCart,
        setIsCartOpen,
        cartCount,
        cartTotal,
        totalPrice: cartTotal
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
