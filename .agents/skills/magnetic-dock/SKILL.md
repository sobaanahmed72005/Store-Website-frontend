---
name: magnetic-dock
description: >-
  macOS-style Magnetic Dock navigation component featuring Framer Motion spring physics, cursor distance scaling, customizable magnetic falloff, and glassmorphic styling by @componentry.
---

# Magnetic Dock Skill

The **Magnetic Dock** is an interactive, spring-animated navigation dock built with Framer Motion and Tailwind CSS.

## Features
- **Spring Physics Scaling:** Magnifies dock items smoothly based on mouse proximity (`useTransform`, `useSpring`).
- **Glassmorphic Styling:** `backdrop-blur-md`, subtle border highlights, and dark mode support.
- **Customizable Variants:** Supports icons, tooltips, active indicators, and click handlers.

## Usage Example

```jsx
import { MagneticDock, MagneticDockItem } from '@/components/ui/magnetic-dock'
import { Home, ShoppingBag, Heart, User, Search } from 'lucide-react'

export function DockDemo() {
  return (
    <MagneticDock>
      <MagneticDockItem onClick={() => console.log('Home')}>
        <Home className="w-5 h-5" />
      </MagneticDockItem>
      <MagneticDockItem onClick={() => console.log('Shop')}>
        <ShoppingBag className="w-5 h-5" />
      </MagneticDockItem>
      <MagneticDockItem onClick={() => console.log('Wishlist')}>
        <Heart className="w-5 h-5" />
      </MagneticDockItem>
      <MagneticDockItem onClick={() => console.log('Account')}>
        <User className="w-5 h-5" />
      </MagneticDockItem>
    </MagneticDock>
  )
}
```
