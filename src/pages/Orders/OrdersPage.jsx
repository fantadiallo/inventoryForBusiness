import React from "react";
import Orders from "../../components/Orders/Orders";

export default function OrdersPage() {
    return (
        <div className="container mt-4">
        <h1 className="mb-4 text-center">Orders</h1>
        <Orders />
        </div>
    );
    }