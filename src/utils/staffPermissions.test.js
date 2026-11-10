import { canAccess } from './staffPermissions';

test('employees get only assigned permissions, including separate payment access', () => {
  const employee = { role: 'ADMIN', isEmployee: true, permissions: ['rentals.view', 'properties.view'] };
  expect(canAccess(employee, 'rentals.view')).toBe(true);
  expect(canAccess(employee, 'payments.update')).toBe(false);
  expect(canAccess({ ...employee, employeeActive: false }, 'rentals.view')).toBe(false);
  expect(canAccess({ ...employee, permissions: [...employee.permissions, 'payments.update'] }, 'payments.update')).toBe(true);
  expect(canAccess({ role: 'USER' }, 'rentals.view')).toBeFalsy();
  expect(canAccess({ ...employee, role: 'USER' }, 'rentals.view')).toBeFalsy();
  expect(canAccess({ role: 'ADMIN' }, 'rentals.view')).toBe(true);
});
