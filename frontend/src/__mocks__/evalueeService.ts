import { vi } from 'vitest';

export const evalueeService = {
  getAll: vi.fn().mockResolvedValue([]),
  getById: vi.fn().mockResolvedValue({
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: '1990-01-01',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }),
  create: vi.fn().mockResolvedValue({
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: '1990-01-01',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }),
  update: vi.fn().mockResolvedValue({
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: '1990-01-01',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }),
  delete: vi.fn().mockResolvedValue(undefined)
};
