# Color Scheme Design Plan

## Color Palette Overview

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| Text Primary | #FFFFFF | rgb(255, 255, 255) | Main text, headings |
| Background Main | #000000 | rgb(0, 0, 0) | Primary app background |
| Background Add-on | #171717 | rgb(23, 23, 23) | Cards, modals, surfaces |
| Primary Design | #FB8B24 | rgb(251, 139, 36) | CTA buttons, brand elements |
| Supplementary Design | #DDAA52 | rgb(221, 170, 82) | Secondary buttons, highlights |
| Accent Catchy | #A31818 | rgb(163, 24, 24) | Premium features, notifications |
| Accent Add-on | #CF0E0E | rgb(207, 14, 14) | Errors, warnings, alerts |

## Usage Recommendations

### 1. Text Hierarchy
- **Primary Text (#FFFFFF)**: Main headings, body text, important content
- **Secondary Text (#FFFFFF at 70% opacity)**: Subheadings, descriptions
- **Muted Text (#FFFFFF at 50% opacity)**: Timestamps, metadata, placeholders

### 2. Backgrounds
- **Main Background (#000000)**: App background, main container
- **Surface Background (#171717)**: Cards, modals, sidebars, elevated content
- **Overlay Background (#171717 at 80% opacity)**: Modal overlays, dropdowns

### 3. Interactive Elements
- **Primary Buttons**: Background #FB8B24, Text #000000
- **Secondary Buttons**: Border #DDAA52, Text #DDAA52, Background transparent
- **Hover States**: Reduce opacity to 80% or add subtle glow effect
- **Focus States**: Use #DDAA52 for focus outlines

### 4. Status & Feedback
- **Success**: Use #DDAA52 for positive feedback
- **Warning**: Use #FB8B24 for caution states
- **Error**: Use #CF0E0E for errors and destructive actions
- **Premium/Special**: Use #A31818 for premium features and badges

## Accessibility Guidelines

### Contrast Ratios (WCAG AA Compliant)
- White text (#FFFFFF) on black background (#000000): 21:1 (Excellent)
- White text (#FFFFFF) on dark gray (#171717): 15.3:1 (Excellent)
- Black text (#000000) on orange (#FB8B24): 4.8:1 (Good)
- White text (#FFFFFF) on red (#A31818): 8.2:1 (Good)

### Color Blindness Considerations
- Orange (#FB8B24) and red tones (#A31818, #CF0E0E) are distinguishable
- Gold (#DDAA52) provides good contrast against dark backgrounds
- Always pair color with text labels or icons for critical information

### Focus & Interaction States
- Use #DDAA52 for focus indicators
- Ensure minimum 3px focus outline width
- Maintain color contrast in all interactive states

## Effective Color Combinations

### Primary Combination
- Background: #000000 or #171717
- Text: #FFFFFF
- Accent: #FB8B24
- **Use for**: Main content areas, primary actions

### Secondary Combination
- Background: #171717
- Text: #FFFFFF
- Accent: #DDAA52
- **Use for**: Secondary content, supporting information

### Premium Combination
- Background: #171717
- Text: #FFFFFF
- Accent: #A31818
- **Use for**: Premium features, special offers

### Alert Combination
- Background: rgba(207, 14, 14, 0.1)
- Border: #CF0E0E
- Text: #CF0E0E
- **Use for**: Error messages, warnings

## Implementation Guidelines

### CSS Custom Properties
```css
:root {
  --text-primary: #FFFFFF;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-muted: rgba(255, 255, 255, 0.5);
  --bg-main: #000000;
  --bg-surface: #171717;
  --primary: #FB8B24;
  --secondary: #DDAA52;
  --accent: #A31818;
  --error: #CF0E0E;
}
```

### Component Styling Patterns
1. **Cards**: Use #171717 background with #DDAA52 or #FB8B24 borders
2. **Buttons**: Primary (#FB8B24), Secondary (outlined #DDAA52), Danger (#CF0E0E)
3. **Navigation**: Dark background (#171717) with #FB8B24 active states
4. **Forms**: Dark inputs (#171717) with #DDAA52 focus states

### Gradients & Effects
- **Primary Gradient**: linear-gradient(135deg, #FB8B24, #DDAA52)
- **Accent Gradient**: linear-gradient(135deg, #A31818, #CF0E0E)
- **Subtle Glow**: box-shadow: 0 0 20px rgba(251, 139, 36, 0.3)

## Testing Checklist
- [ ] Test all color combinations in light and dark environments
- [ ] Verify contrast ratios meet WCAG AA standards
- [ ] Test with color blindness simulators
- [ ] Ensure interactive elements are clearly distinguishable
- [ ] Validate focus states are visible and accessible