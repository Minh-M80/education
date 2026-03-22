import "@testing-library/jest-dom";

// Mock localStorage with proper implementation
let localStorageStore: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] || null),
  setItem: vi.fn((key: string, value: string) => { localStorageStore[key] = value; }),
  removeItem: vi.fn((key: string) => { delete localStorageStore[key]; }),
  clear: vi.fn(() => { localStorageStore = {}; }),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Reset localStorage store before each test with default values
beforeEach(() => {
  localStorageStore = {
    'lms_registered_emails': JSON.stringify([])
  };
});

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
