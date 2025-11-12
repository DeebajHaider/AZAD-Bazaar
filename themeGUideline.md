# Mobile App Style Guidelines

## 🎨 Color System

### Light Mode
- **Background:** `bg-white`
- **Surface/Cards:** `bg-gray-50`
- **Text Primary:** `text-gray-900`
- **Text Secondary:** `text-gray-600`
- **Borders:** `border-gray-200`

### Dark Mode
- **Background:** `dark:bg-slate-950`
- **Surface/Cards:** `dark:bg-slate-900`
- **Text Primary:** `dark:text-slate-50`
- **Text Secondary:** `dark:text-slate-400`
- **Borders:** `dark:border-slate-800`

### Accent Colors
- **Primary:** `bg-blue-500` / `dark:bg-blue-600`
- **Success:** `bg-green-500` / `dark:bg-green-600`
- **Danger:** `bg-red-500` / `dark:bg-red-600`
- **Warning:** `bg-amber-500` / `dark:bg-amber-600`

## 📏 Layout & Spacing

### Container
- **Max Width:** `max-w-[430px]`
- **Full Height:** `h-screen` or `min-h-screen`
- **Centering:** `mx-auto`

### Padding
- **Page/Screen:** `p-4` (16px)
- **Cards/Sections:** `p-4` or `p-5` (16px or 20px)
- **Buttons:** `px-6 py-3` (24px horizontal, 12px vertical)
- **Small Elements:** `p-2` or `p-3` (8px or 12px)

### Gaps & Margins
- **Between sections:** `space-y-4` or `gap-4`
- **Between elements:** `space-y-2` or `gap-2`
- **Large spacing:** `space-y-6` or `gap-6`

## 🔘 Interactive Elements

### Buttons
- **Minimum Height:** `min-h-12` (48px for touch targets)
- **Padding:** `px-6 py-3`
- **Border Radius:** `rounded-lg`
- **Font:** `font-medium`
- **Hover:** `hover:bg-opacity-90` or specific hover colors
- **Transition:** `transition-all duration-200`

### Touch Targets
- All interactive elements should be **minimum 44-48px** in height/width
- Use `min-h-12` or `min-h-11` for buttons and clickable areas

## 🎯 Borders & Radius

### Border Radius
- **Small:** `rounded` (4px)
- **Medium:** `rounded-lg` (8px)
- **Large:** `rounded-xl` (12px)
- **Full:** `rounded-full` (pills/circles)

### Borders
- **Standard:** `border border-gray-200 dark:border-slate-800`
- **Dividers:** `border-b border-gray-200 dark:border-slate-800`
- **Subtle:** `border border-gray-100 dark:border-slate-900`

## 📝 Typography

### Font Sizes
- **Headings (h1):** `text-2xl` or `text-3xl`
- **Subheadings (h2):** `text-xl`
- **Body:** `text-base` (default)
- **Small text:** `text-sm`
- **Tiny text:** `text-xs`

### Font Weights
- **Headings:** `font-semibold` or `font-bold`
- **Buttons:** `font-medium`
- **Body:** `font-normal` (default)

## 🎭 Common Patterns

### Card Component
```
bg-gray-50 dark:bg-slate-900 
border border-gray-200 dark:border-slate-800 
rounded-lg p-4
```

### Input Fields
```
w-full px-4 py-3 
border border-gray-200 dark:border-slate-800 
rounded-lg 
bg-white dark:bg-slate-950
text-gray-900 dark:text-slate-50
focus:ring-2 focus:ring-blue-500 focus:border-transparent
```

### Primary Button
```
min-h-12 px-6 py-3 
bg-blue-500 hover:bg-blue-600 
dark:bg-blue-600 dark:hover:bg-blue-700
text-white font-medium rounded-lg 
transition-all duration-200
```

### Secondary Button
```
min-h-12 px-6 py-3 
bg-gray-100 hover:bg-gray-200 
dark:bg-slate-800 dark:hover:bg-slate-700
text-gray-900 dark:text-slate-50 
font-medium rounded-lg 
transition-all duration-200
```

## ⚡ Performance

- Use `transition-all duration-200` for smooth interactions
- Apply `will-change-transform` sparingly for heavy animations
- Prefer `transform` and `opacity` for animations

## 🌙 Dark Mode Implementation

Always pair light and dark mode classes:
```jsx
className="bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-50"
```

Use Tailwind's `dark:` prefix for all color-related utilities.

## 📱 Mobile-Specific

- **Viewport:** Set `max-w-[430px] mx-auto` on root container
- **Safe Areas:** Consider using `pb-safe` if using iOS safe area insets
- **Scrolling:** Use `overflow-y-auto` for scrollable content
- **Fixed Elements:** Bottom nav should use `fixed bottom-0 w-full max-w-[430px]`

## ✨ Shadows & Elevation

- **Subtle:** `shadow-sm`
- **Medium:** `shadow-md`
- **Large:** `shadow-lg`
- **Dark mode:** Shadows are less visible, consider using borders instead