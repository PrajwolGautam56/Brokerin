export const canAccess = (user, permission) => !!user && user.role === 'ADMIN' && (user.isSuperAdmin || !user.isEmployee ||
  (user.isEmployee && user.employeeActive !== false && (user.permissions || []).includes(permission)));

export const adminPagePermissions = {
  '/admin': 'dashboard.view', '/admin/properties': 'properties.view', '/admin/furniture': 'furniture.view',
  '/admin/orders': 'orders.view', '/admin/property-requests': 'propertyRequests.view',
  '/admin/furniture-requests': 'furnitureRequests.view', '/admin/rentals': 'rentals.view',
  '/admin/rental-dashboard': 'rentals.view', '/admin/transactions': 'transactions.view',
  '/admin/invoices': 'invoices.view', '/admin/users': 'users.view', '/admin/services': 'services.view',
  '/admin/enquiries': 'enquiries.view', '/admin/analytics': 'analytics.view', '/admin/settings': 'settings.view'
};
