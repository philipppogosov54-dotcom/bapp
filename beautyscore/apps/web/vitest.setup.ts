import '@testing-library/jest-dom'
import { vi } from 'vitest'
import { createElement } from 'react'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/app',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => 
    createElement('a', { href }, children),
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => createElement('div', props, children),
    button: ({ children, ...props }: any) => createElement('button', props, children),
    span: ({ children, ...props }: any) => createElement('span', props, children),
    p: ({ children, ...props }: any) => createElement('p', props, children),
    h1: ({ children, ...props }: any) => createElement('h1', props, children),
    h2: ({ children, ...props }: any) => createElement('h2', props, children),
    h3: ({ children, ...props }: any) => createElement('h3', props, children),
    a: ({ children, ...props }: any) => createElement('a', props, children),
    input: (props: any) => createElement('input', props),
    form: ({ children, ...props }: any) => createElement('form', props, children),
    section: ({ children, ...props }: any) => createElement('section', props, children),
  },
  AnimatePresence: ({ children }: any) => children,
  useAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
  }),
  useInView: () => true,
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}))
