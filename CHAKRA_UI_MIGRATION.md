# Chakra UI Migration Guide

This guide outlines the migration from Tailwind CSS to Chakra UI with Inter font.

## Dependencies Added

```json
{
  "@chakra-ui/react": "^2.8.2",
  "@emotion/react": "^11.11.1", 
  "@emotion/styled": "^11.11.0",
  "framer-motion": "^10.16.4"
}
```

## Font Integration

- **Font**: Inter (modern web font from Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800, 900
- **Applied to**: Both heading and body text

## Theme Configuration

Custom theme with:
- **Brand colors**: Orange gradient (#FB8B24 to #DDAA52)
- **Dark mode**: Default color mode
- **Typography**: Inter font family

## Component Migration Pattern

### Before (Tailwind)
```tsx
<div className="bg-black min-h-screen">
  <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
    <button className="px-4 py-2 rounded-lg font-medium text-white">
      Button
    </button>
  </nav>
</div>
```

### After (Chakra UI)
```tsx
<Box minH="100vh" bg="gray.900">
  <Box bg="whiteAlpha.100" backdropFilter="blur(10px)" borderBottom="1px" borderColor="whiteAlpha.200">
    <Button size="sm" color="white" _hover={{ bg: 'whiteAlpha.100' }}>
      Button
    </Button>
  </Box>
</Box>
```

## Key Conversions

| Tailwind Class | Chakra UI Prop |
|----------------|----------------|
| `bg-black` | `bg="gray.900"` |
| `text-white` | `color="white"` |
| `px-4 py-2` | `px={4} py={2}` |
| `rounded-lg` | `borderRadius="lg"` |
| `flex items-center` | `<Flex align="center">` |
| `space-x-4` | `<HStack spacing={4}>` |
| `bg-gradient-to-r` | `bgGradient="linear(to-r, ...)"` |

## Migration Status

### ✅ Completed
- Package dependencies
- Theme setup with Inter font
- Main App.tsx navigation
- EventDiscovery header section

### 🔄 In Progress
- Individual component migration
- Form components
- Modal components
- Card components

### 📋 Next Steps
1. Install dependencies: `npm install`
2. Migrate remaining components one by one
3. Update custom CSS to use Chakra tokens
4. Test responsive design
5. Remove Tailwind CSS dependencies

## Benefits

- **Consistent Design System**: Built-in design tokens
- **Accessibility**: ARIA compliant components
- **TypeScript Support**: Full type safety
- **Modern Font**: Inter for better readability
- **Theme Customization**: Easy brand color integration
- **Responsive**: Built-in responsive props