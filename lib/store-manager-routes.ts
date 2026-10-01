export const storeManagerRoutes = {
  Dashboard: "/store-manager/dashboard",
  Orders: "/store-manager/Orders%20%26%20Order%20Detail",
  Deliveries: "/store-manager/delivery-tracking",
  Issues: "/store-manager/issues",
} as const;

export const workflowViews = {
  "create-order": "Create Restock Order",
  "order-review": "Review Restock Order",
  "order-confirmed": "Restock Order Confirmed",
  "delivery-tracking": "Delivery Tracking",
  "receive-delivery": "Receive Delivery",
  "receive-review": "Received Delivery Review",
  issues: "Store Delivery Issues",
  "issue-detail": "Resolved Store Delivery Issues",
  "issue-resolution": "Critical Store Delivery Issue",
} as const;

export type WorkflowView = keyof typeof workflowViews;
