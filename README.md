README
Overview

This project is a full food shop system with a React Native app using Expo and a Node Express server with MongoDB.
Users can register and log in with username and password or with SMS one time codes.
Each user has a role either customer or admin.
Admins get a management interface for products and orders.
Customers can browse the menu add items to a cart place orders and track order status.

Main technologies

Mobile app
React Native with Expo
React Navigation for routing
A custom theme provider for colors and dark mode

Server
Node with Express
MongoDB with Mongoose
JWT for authentication
Twilio for SMS verification

How the system works

Authentication and authorization
When a user logs in the server issues a JWT that includes user id username and role.
The mobile app stores the token in AsyncStorage.
Every protected API call sends the token in the Authorization header with the Bearer scheme.
The endpoint me returns the current user and role.
The app shows different tab sets by role.

Roles
Default role is customer
Admins see additional management screens

Products
Admin can create products update fields and change stock.
Creating a product requires a valid http or https image URL.
Each product has title price inventory and image.

Orders
Customer creates an order that stores items total and creation time.
Every order has a status from this set
pending
preparing
ready
on_the_way
picked_up
Admin sees all orders and can update the status.
Customer sees only their own orders and the current status.

App experience

Customer
Login and registration screens
Menu of products
Product details
Cart and checkout
Orders screen that shows history and status

Admin
Product management screen with create edit and stock controls
Admin orders screen that lists every order from all users and lets the admin set status

Key app screens

Customer tabs
Menu
Orders
Info

Admin tabs
Manage products
Orders admin
Info

Product management screen
List of products with quick edit fields
Update button
Change inventory buttons plus one and minus one
Floating action button that opens a modal for creating a product
Create modal requires title price inventory and image URL and shows a live preview

Admin orders screen
All orders sorted newest first
Displays items totals and time
Status selector with immediate update on the server

Customer orders screen
Only the current user orders
Color badge for status
Items summary and total

Important server endpoints

Auth
POST /auth/register
POST /auth/login
GET /auth/me
POST /auth/otp/send
POST /auth/otp/verify-login
POST /auth/otp/verify-register

Products
GET /products
POST /products admin only
PUT /products/:id admin only
PATCH /products/:id/inventory admin only

Orders
GET /api/orders for the current user
POST /api/orders create order
GET /api/orders/admin admin only returns all orders
PATCH /api/orders/:id/status admin only

Data models

User
username string unique
password string hashed
phone string unique
phoneVerified boolean
role string one of customer admin default customer

Product
title string
price number
inventory number
image string

Order
userId string
items array of productId title price qty image
total number
status one of the allowed values
createdAt date

Running the server

Set environment variables for Mongo connection JWT secret and Twilio credentials.
Install dependencies then start the server

npm install
npm start

Running the mobile app

Set API_URL in the mobile config so it points to your server.
Install dependencies then start the Expo dev server

npm install
npx expo start

Open with Expo Go on a device or run on a simulator.

Demo login

Admin
username ofir
password ofir2002
phone 0522226889

Customer
username ofir2
password ofir2002

After login as admin the app shows the admin tabs with product management and all the orders management.
After login as customer the app shows the regular tabs for menu orders and info.

change this 172.29.176.1 to your ip in client->config.ts
const fallback = "http://172.29.176.1:5000";
console.debug("[config] API fallback (manual IP):", fallback);
return fallback;
