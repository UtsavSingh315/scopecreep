# Responsive Design Guidelines

## Overview

This project follows a **mobile-first responsive design approach**. All components and pages must be responsive across all device sizes. Future development must adhere to these guidelines.

## Tailwind CSS Breakpoints

The project uses Tailwind CSS v4 with the following breakpoints:

- **Mobile**: `< 640px` (default, no prefix)
- **Small (sm)**: `≥ 640px` (tablets)
- **Medium (md)**: `≥ 768px` (landscape tablets)
- **Large (lg)**: `≥ 1024px` (desktops)
- **Extra Large (xl)**: `≥ 1280px` (large desktops)

## Design Patterns

### 1. Typography Sizing

Always scale text sizes responsively:

```jsx
// Headings
<h1 className="text-2xl md:text-3xl lg:text-4xl">

// Body text
<p className="text-sm md:text-base">

// Small text
<span className="text-xs md:text-sm">
```

### 2. Spacing & Padding

Use responsive spacing for better mobile experience:

```jsx
// Container padding
<div className="p-4 sm:p-6 lg:p-8">

// Vertical spacing
<div className="space-y-4 md:space-y-6">

// Margin
<div className="mt-2 md:mt-4 lg:mt-6">
```

### 3. Layout Patterns

#### Flex Layouts

Stack vertically on mobile, horizontal on larger screens:

```jsx
<div className="flex flex-col sm:flex-row gap-4">
  {/* Items stack on mobile, side-by-side on tablet+ */}
</div>
```

#### Grid Layouts

Responsive column counts:

```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 column mobile, 2 tablet, 3 desktop */}
</div>
```

### 4. Navigation - Sidebar Pattern

The sidebar follows this mobile-first pattern:

- **Mobile**: Hamburger menu with slide-in sidebar
- **Desktop**: Fixed sidebar always visible

```jsx
{
  /* Mobile: Fixed header with hamburger */
}
<header className="fixed top-0 left-0 right-0 z-50 lg:hidden">
  <button onClick={toggleMenu}>{isMenuOpen ? <X /> : <Menu />}</button>
</header>;

{
  /* Sidebar: Hidden on mobile, transforms in when open */
}
<aside
  className={`fixed lg:static transform transition-transform 
  ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} 
  lg:translate-x-0`}>
  {/* Navigation items */}
</aside>;

{
  /* Main content: Padding-top for mobile header clearance */
}
<main className="pt-20 lg:pt-8 p-4 sm:p-6 lg:p-8">{/* Page content */}</main>;
```

### 5. Tables & Data Display

Tables need horizontal scrolling on mobile:

```jsx
<div className="overflow-x-auto">
  <table className="w-full min-w-150">
    <thead>
      <tr>
        <th className="p-2 md:p-4 text-xs md:text-sm">Header</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td className="p-2 md:p-4 text-xs md:text-sm">Data</td>
      </tr>
    </tbody>
  </table>
</div>
```

### 6. Buttons & Form Elements

Full-width on mobile, auto-width on larger screens:

```jsx
<button className="w-full sm:w-auto px-4 py-2">
  Click Me
</button>

<input className="w-full sm:max-w-md" />
```

### 7. Cards & Content Blocks

Responsive padding and sizing:

```jsx
<div className="bg-white rounded-lg p-4 md:p-6">
  <h3 className="text-lg md:text-xl">Card Title</h3>
  <p className="text-sm md:text-base">Content</p>
</div>
```

### 8. Modal Dialogs

Modals automatically adapt to screen size using shadcn/ui Dialog component:

```jsx
<DialogContent className="max-w-2xl">
  {/* Content automatically responsive */}
</DialogContent>
```

## Component-Specific Guidelines

### Homepage (`page.jsx`)

- Hero section with responsive text sizing
- Feature boxes that wrap on mobile
- Data table with horizontal scroll

### Sidebar (`Sidebar.jsx`)

- Mobile: Hamburger menu + slide-in sidebar
- Desktop: Fixed sidebar navigation
- Overlay backdrop on mobile when open

### User Pages

- **Profile**: Responsive cards and text sizes
- **Settings**: Toggle items stack vertically on mobile
- **My Projects**: Header and buttons stack on mobile, table scrolls horizontally

### Project Pages

- **Dashboard**: Stats cards use responsive grid (1/2/3 columns)
- **Baselines**: Expandable rows with responsive padding and text
- **Changes**: Similar to Baselines, priority badges scale appropriately

### Authentication Pages

- **Login/Signup**: Split-screen layout
  - Mobile: Branding header + form below
  - Desktop: Branding left, form right (50/50)

## Testing Checklist

When developing new features, test at these breakpoints:

- [ ] **Mobile Portrait** (375px - iPhone SE)
- [ ] **Mobile Landscape** (667px)
- [ ] **Tablet Portrait** (768px - iPad)
- [ ] **Tablet Landscape** (1024px)
- [ ] **Desktop** (1280px)
- [ ] **Large Desktop** (1920px)

## Browser Dev Tools

Use responsive design mode:

- Chrome: `Ctrl+Shift+M` (Windows) / `Cmd+Shift+M` (Mac)
- Firefox: `Ctrl+Shift+M` (Windows) / `Cmd+Option+M` (Mac)

## Common Issues & Solutions

### Issue: Text Overflow

**Solution**: Use `truncate` or responsive text sizing

```jsx
<p className="truncate md:text-clip text-sm md:text-base">
```

### Issue: Tables Breaking Layout

**Solution**: Always wrap in `overflow-x-auto` container

```jsx
<div className="overflow-x-auto">
  <table className="min-w-150">
```

### Issue: Buttons Too Small on Mobile

**Solution**: Use `w-full sm:w-auto` pattern

```jsx
<button className="w-full sm:w-auto px-4 py-2">
```

### Issue: Content Hidden Behind Fixed Header

**Solution**: Add top padding to main content

```jsx
<main className="pt-20 lg:pt-8">
```

## Color Theme Integration

The blue theme is consistently applied with responsive considerations:

- **Light Mode**: `bg-blue-50`, `text-slate-800`, `border-blue-200`
- **Dark Mode**: `bg-slate-900`, `text-blue-100`, `border-blue-800`

All responsive components maintain theme consistency across breakpoints.

## Future Development Requirements

**IMPORTANT**: All new components and pages MUST be responsive from the start.

Before committing new code, ensure:

1. ✅ Mobile-first approach is followed
2. ✅ Breakpoints are used appropriately
3. ✅ Text scales responsively
4. ✅ Spacing adapts to screen size
5. ✅ Tables have horizontal scroll on mobile
6. ✅ Navigation works on all devices
7. ✅ Tested at all major breakpoints
8. ✅ Theme colors are applied correctly

## Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Tailwind CSS Breakpoints](https://tailwindcss.com/docs/screens)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

**Last Updated**: 2024  
**Maintainer**: Development Team  
**Status**: ✅ All existing pages are responsive
