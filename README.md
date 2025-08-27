🍔 Restaurant App
📖 Overview

The Restaurant App is a full-stack mobile application (React Native + Node.js + MongoDB) that allows customers to browse a restaurant’s menu, view product details, add items to the cart, register/login (with phone OTP or password), and place orders.
The app also includes admin/employee features for managing products and orders.

🚀 Features
👤 Authentication

Register & Login with username/password or phone number + OTP (Twilio)

Support for biometric login (fingerprint/faceID)

Secure token storage with AsyncStorage + SecureStore

🍽 Menu & Products

Dynamic menu display (products fetched from server / MongoDB)

Product details screen with image, description, and price

Add/remove items from the cart

🛒 Cart & Orders

Persistent cart saved locally with AsyncStorage

Quantity updates & total price calculation

Checkout screen (server integration ready)

ℹ️ Info Screen

Restaurant details (address, contact, social links)

Google Maps integration (with dark mode option)

Share & copy to clipboard functionality

🎨 Theme

System, light & dark mode via ThemeProvider

Stored user preference in AsyncStorage

📱 Mobile Ready

Built with React Native + Expo

Navigation with React Navigation (stack + bottom tabs)

🛠 Tech Stack

Frontend (Mobile): React Native (Expo), TypeScript, React Navigation, AsyncStorage, SecureStore

Backend: Node.js, Express.js, MongoDB, Mongoose

Auth: JWT, Twilio (SMS OTP), Biometric Login

Maps: React Native Maps, Google Maps API

UI: Custom ThemeProvider (light/dark mode), Ionicons
