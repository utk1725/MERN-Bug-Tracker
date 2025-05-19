import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock axios
vi.mock('axios');

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock environment variables
vi.stubEnv('VITE_BASE_API_URL', 'http://localhost:5000');

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock Material-UI components
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    TextField: ({ label, error, helperText, ...props }) => (
      <div>
        <label>{label}</label>
        <input {...props} />
        {error && <div className="error">{helperText}</div>}
      </div>
    ),
    Select: ({ children, value, onChange, label, ...props }) => (
      <div>
        <label>{label}</label>
        <select value={value} onChange={onChange} {...props}>
          {children}
        </select>
      </div>
    ),
    MenuItem: ({ children, value, ...props }) => (
      <option value={value} {...props}>
        {children}
      </option>
    ),
  };
}); 