# GengoBot Theme Documentation

> **Purpose**: Design system reference for creating consistent landing pages and marketing materials outside the main application (e.g., WordPress sites).

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Shadows & Borders](#shadows--borders)
5. [Animations](#animations)
6. [Component Patterns](#component-patterns)
7. [Layout Guidelines](#layout-guidelines)
8. [CSS Variables Reference](#css-variables-reference)
9. [Implementation Examples](#implementation-examples)

---

## Design Philosophy

GengoBot uses a **Neobrutalism** design style—a modern take on brutalist design that combines:

- **Bold, solid borders** (no subtle shadows)
- **Offset drop shadows** (flat, not blurred)
- **Vibrant, playful colors** with a pink accent
- **Clean geometric shapes** with slight rounding
- **High contrast** between elements
- **Playful micro-interactions** with bounce/translate effects

### Key Characteristics

| Aspect       | GengoBot Style                            |
| ------------ | ----------------------------------------- |
| Borders      | 2-3px solid black, always visible         |
| Shadows      | Solid offset (4px 4px), not blurred       |
| Colors       | Vibrant pink primary, cyan accents        |
| Corners      | Slightly rounded (4-8px), not pill-shaped |
| Typography   | Bold, modern sans-serif (Space Grotesk)   |
| Interactions | Translate + shadow removal on hover       |
| Tone         | Friendly, approachable, educational       |

---

## Color System

### Primary Colors

| Name               | Light Mode | Dark Mode | Usage                         |
| ------------------ | ---------- | --------- | ----------------------------- |
| **Primary (Pink)** | `#ff5e75`  | `#ff5e75` | Main accent, CTAs, highlights |
| **Background**     | `#F8F8F8`  | `#292A2E` | Page background               |
| **Foreground**     | `#171717`  | `#fafafa` | Primary text                  |
| **Secondary BG**   | `#eeeeee`  | `#191722` | Cards, containers             |
| **Muted**          | `#f5f5f5`  | `#27272a` | Subtle backgrounds            |
| **Muted Text**     | `#737373`  | `#a1a1aa` | Secondary text                |

### Accent Colors

| Name       | Hex Code  | RGB                | Usage                                |
| ---------- | --------- | ------------------ | ------------------------------------ |
| **Cyan**   | `#73cfd9` | rgb(115, 207, 217) | Charts, highlights, secondary accent |
| **Green**  | `#7fbf50` | rgb(127, 191, 80)  | Success states, positive indicators  |
| **Yellow** | `#f2eda0` | rgb(242, 237, 160) | Warnings, kanji cards                |
| **Purple** | `#d99ad5` | rgb(217, 154, 213) | Charts, decorative                   |
| **Salmon** | `#f2727d` | rgb(242, 114, 125) | Charts, softer pink variant          |

### Card Type Colors (Japanese Learning Categories)

| Type       | Border Color | Background | Usage                   |
| ---------- | ------------ | ---------- | ----------------------- |
| Hiragana   | `#FFB6C1`    | `#FFF0F3`  | Hiragana practice cards |
| Katakana   | `#87CEEB`    | `#E8F4F8`  | Katakana practice cards |
| Kanji      | `#f2eda0`    | `#FFFAE0`  | Kanji study cards       |
| Vocabulary | `#98D8AA`    | `#E8F5E9`  | Word learning cards     |
| Grammar    | `#73cfd9`    | `#aaf0f8`  | Grammar explanations    |

### JLPT Level Colors (Difficulty Gradient)

| Level | Color  | Hex       | Meaning            |
| ----- | ------ | --------- | ------------------ |
| N5    | Green  | `#22c55e` | Easiest / Beginner |
| N4    | Lime   | `#84cc16` | Elementary         |
| N3    | Yellow | `#eab308` | Intermediate       |
| N2    | Orange | `#f97316` | Upper Intermediate |
| N1    | Red    | `#ef4444` | Advanced / Hardest |

### Semantic Colors

| Purpose               | Light Mode | Dark Mode |
| --------------------- | ---------- | --------- |
| **Destructive/Error** | `#ef4343`  | `#ff6467` |
| **Success**           | `#22c55e`  | `#4ade80` |
| **Warning**           | `#f59e0b`  | `#fbbf24` |
| **Info**              | `#3b82f6`  | `#60a5fa` |

### Color Usage Guidelines

```
Primary Pink (#ff5e75):
├── Call-to-action buttons
├── Active states
├── Important highlights
├── Links on hover
└── Brand accent elements

Cyan (#73cfd9):
├── Secondary actions
├── Charts and graphs
├── Decorative accents
└── Complementary highlights

Black (#000000):
├── All borders
├── All shadows
├── Primary text (light mode)
└── High contrast elements
```

---

## Typography

### Font Stack

| Purpose                       | Font Family           | Fallbacks                                           |
| ----------------------------- | --------------------- | --------------------------------------------------- |
| **Primary (Headings & Body)** | `Space Grotesk`       | system-ui, sans-serif                               |
| **Japanese Gothic**           | `Zen Kaku Gothic New` | "Hiragino Kaku Gothic Pro", "Yu Gothic", sans-serif |
| **Japanese Serif**            | `Shippori Mincho`     | "Hiragino Mincho Pro", "Yu Mincho", serif           |
| **Monospace**                 | `Roboto Mono`         | monospace                                           |

### Font Loading (Google Fonts)

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Zen+Kaku+Gothic+New:wght@400;700&family=Shippori+Mincho:wght@400;700&display=swap"
  rel="stylesheet"
/>
```

### Typography Scale

| Element | Size    | Weight | Line Height | Letter Spacing |
| ------- | ------- | ------ | ----------- | -------------- |
| H1      | 48-64px | 700    | 1.1         | -0.02em        |
| H2      | 36-48px | 700    | 1.2         | -0.01em        |
| H3      | 24-30px | 600    | 1.3         | 0              |
| H4      | 20-24px | 600    | 1.4         | 0              |
| Body    | 16px    | 400    | 1.6         | 0              |
| Small   | 14px    | 400    | 1.5         | 0              |
| Caption | 12px    | 500    | 1.4         | 0.01em         |

### Typography CSS

```css
/* Headings */
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  color: #171717; /* Light mode */
}

/* Body text */
body {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #171717;
}

/* Japanese text */
.japanese-text {
  font-family: 'Zen Kaku Gothic New', 'Hiragino Kaku Gothic Pro', sans-serif;
}

.japanese-serif {
  font-family: 'Shippori Mincho', 'Hiragino Mincho Pro', serif;
}
```

---

## Shadows & Borders

### Border System

| Type              | Value               | Usage                    |
| ----------------- | ------------------- | ------------------------ |
| **Standard**      | `2px solid #000000` | Buttons, inputs, cards   |
| **Heavy**         | `3px solid #000000` | Featured cards, emphasis |
| **Border Radius** | `4px` - `8px`       | Slightly rounded corners |

### Shadow System (Neobrutalism)

All shadows are **solid black offsets** without blur:

| Size     | Value                     | Usage                   |
| -------- | ------------------------- | ----------------------- |
| **2XS**  | `2px 2px 0px 0px #000000` | Tiny elements           |
| **XS**   | `2px 2px 0px 0px #000000` | Small buttons           |
| **SM**   | `3px 3px 0px 0px #000000` | Inputs, small cards     |
| **Base** | `4px 4px 0px 0px #000000` | Standard buttons, cards |
| **MD**   | `4px 4px 0px 0px #000000` | Medium elements         |
| **LG**   | `5px 5px 0px 0px #000000` | Large cards             |
| **XL**   | `6px 6px 0px 0px #000000` | Featured sections       |
| **2XL**  | `8px 8px 0px 0px #000000` | Hero elements           |

### Shadow CSS

```css
/* Standard shadow */
.neo-shadow {
  box-shadow: 4px 4px 0px 0px #000000;
}

/* Large shadow */
.neo-shadow-lg {
  box-shadow: 6px 6px 0px 0px #000000;
}

/* Dark mode shadow */
.dark .neo-shadow {
  box-shadow: 4px 4px 0px 0px #010101;
}
```

---

## Animations

### Keyframe Definitions

```css
/* Slide animations */
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-in-left {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-in-top {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slide-in-bottom {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Fade animation */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Scale animation */
@keyframes scale-in {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Bounce animation */
@keyframes bounce-in {
  0% {
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

/* Shake animation */
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-10px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(10px);
  }
}

/* Pulse animation */
@keyframes pulse-slow {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Wiggle animation */
@keyframes wiggle {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(10deg);
  }
  75% {
    transform: rotate(-10deg);
  }
}
```

### Animation Timing

| Animation  | Duration | Easing                                 | Usage               |
| ---------- | -------- | -------------------------------------- | ------------------- |
| **Slide**  | 0.3s     | ease-out                               | Page transitions    |
| **Fade**   | 0.3s     | ease-out                               | Element appearance  |
| **Scale**  | 0.3s     | ease-out                               | Modal open          |
| **Bounce** | 0.5s     | cubic-bezier(0.68, -0.55, 0.265, 1.55) | Success states      |
| **Shake**  | 0.5s     | ease-in-out                            | Error feedback      |
| **Pulse**  | 2s       | ease-in-out infinite                   | Loading, highlights |

### Hover Interactions (Key Pattern)

The signature GengoBot hover effect pushes the element and removes the shadow:

```css
/* Button/Card hover effect */
.neo-button {
  border: 2px solid #000000;
  box-shadow: 4px 4px 0px 0px #000000;
  transition: all 0.2s ease;
}

.neo-button:hover {
  transform: translate(4px, 4px);
  box-shadow: none;
}

/* Reverse hover (pulls inward) */
.neo-button-reverse:hover {
  transform: translate(-4px, -4px);
  box-shadow: 4px 4px 0px 0px #000000;
}
```

### Global Transition

```css
/* Apply to all interactive elements */
* {
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
```

---

## Component Patterns

### Buttons

```css
/* Primary Button */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  background-color: #ff5e75;
  border: 2px solid #000000;
  border-radius: 4px;
  box-shadow: 4px 4px 0px 0px #000000;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translate(4px, 4px);
  box-shadow: none;
}

/* Secondary Button */
.btn-secondary {
  color: #171717;
  background-color: #eeeeee;
  border: 2px solid #000000;
  border-radius: 4px;
  box-shadow: 4px 4px 0px 0px #000000;
}

/* Ghost Button */
.btn-ghost {
  color: #171717;
  background-color: transparent;
  border: 2px solid transparent;
  box-shadow: none;
}

.btn-ghost:hover {
  background-color: #f5f5f5;
  transform: none;
}

/* Button Sizes */
.btn-sm {
  height: 36px;
  padding: 0 12px;
}
.btn-md {
  height: 40px;
  padding: 0 16px;
}
.btn-lg {
  height: 44px;
  padding: 0 32px;
}
```

### Cards

```css
.neo-card {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background-color: #ffffff;
  border: 2px solid #000000;
  border-radius: 8px;
  box-shadow: 4px 4px 0px 0px #000000;
}

.neo-card-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.neo-card-title {
  font-size: 20px;
  font-weight: 600;
  color: #171717;
}

.neo-card-description {
  font-size: 14px;
  color: #737373;
}

.neo-card-content {
  flex: 1;
}

/* Hover effect (optional) */
.neo-card-interactive:hover {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px 0px #000000;
}
```

### Input Fields

```css
.neo-input {
  width: 100%;
  height: 40px;
  padding: 8px 12px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  color: #171717;
  background-color: #eeeeee;
  border: 2px solid #000000;
  border-radius: 4px;
  outline: none;
  transition: all 0.2s ease;
}

.neo-input:focus {
  outline: 2px solid #ff5e75;
  outline-offset: 2px;
}

.neo-input::placeholder {
  color: rgba(23, 23, 23, 0.5);
}

/* Selection highlight */
.neo-input::selection {
  background-color: #ff5e75;
  color: #ffffff;
}
```

### Badges

```css
.neo-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  border: 2px solid #000000;
  border-radius: 4px;
}

.neo-badge-primary {
  color: #ffffff;
  background-color: #ff5e75;
}

.neo-badge-secondary {
  color: #171717;
  background-color: #eeeeee;
}

.neo-badge-success {
  color: #ffffff;
  background-color: #22c55e;
}

.neo-badge-warning {
  color: #171717;
  background-color: #f59e0b;
}
```

### Navigation Bar

```css
.neo-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background-color: rgba(248, 248, 248, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 2px solid #000000;
}

/* Logo with drop shadow */
.neo-logo {
  filter: drop-shadow(2px 2px 0px rgba(0, 0, 0, 1));
}
```

---

## Layout Guidelines

### Container

```css
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}
```

### Section Spacing

```css
.section {
  padding: 80px 0;
}

.section-lg {
  padding: 128px 0;
}

/* Gap between content blocks */
.content-gap {
  gap: 48px;
}
```

### Grid System

```css
/* Two columns */
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

/* Three columns */
.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* Four columns */
.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

/* Responsive */
@media (max-width: 768px) {
  .grid-2,
  .grid-3,
  .grid-4 {
    grid-template-columns: 1fr;
  }
}
```

### Z-Index Layers

| Layer      | Z-Index | Usage                |
| ---------- | ------- | -------------------- |
| Background | -1      | Decorative elements  |
| Content    | 0       | Main content         |
| Elevated   | 10      | Cards on hover       |
| Sticky     | 40      | Sticky headers       |
| Navigation | 50      | Fixed nav, modals    |
| Overlay    | 100     | Full-screen overlays |

---

## CSS Variables Reference

```css
:root {
  /* Colors - Light Mode */
  --color-primary: #ff5e75;
  --color-primary-foreground: #ffffff;
  --color-background: #f8f8f8;
  --color-foreground: #171717;
  --color-secondary: #eeeeee;
  --color-secondary-foreground: #0d0d0d;
  --color-muted: #f5f5f5;
  --color-muted-foreground: #737373;
  --color-border: #000000;
  --color-ring: #ff99a7;

  /* Accent Colors */
  --color-cyan: #73cfd9;
  --color-green: #7fbf50;
  --color-yellow: #f2eda0;
  --color-purple: #d99ad5;
  --color-salmon: #f2727d;

  /* Destructive */
  --color-destructive: #ef4343;

  /* JLPT Levels */
  --color-jlpt-n5: #22c55e;
  --color-jlpt-n4: #84cc16;
  --color-jlpt-n3: #eab308;
  --color-jlpt-n2: #f97316;
  --color-jlpt-n1: #ef4444;

  /* Typography */
  --font-sans: 'Space Grotesk', system-ui, sans-serif;
  --font-japanese: 'Zen Kaku Gothic New', 'Hiragino Kaku Gothic Pro', sans-serif;
  --font-japanese-serif: 'Shippori Mincho', 'Hiragino Mincho Pro', serif;

  /* Spacing */
  --spacing-base: 0.25rem;
  --radius-base: 4px;
  --radius-lg: 8px;

  /* Shadows */
  --shadow-sm: 3px 3px 0px 0px #000000;
  --shadow-base: 4px 4px 0px 0px #000000;
  --shadow-lg: 6px 6px 0px 0px #000000;
  --shadow-xl: 8px 8px 0px 0px #000000;

  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-base: 0.2s ease;
  --transition-slow: 0.3s ease;
}

/* Dark Mode */
.dark {
  --color-background: #292a2e;
  --color-foreground: #fafafa;
  --color-secondary: #191722;
  --color-secondary-foreground: #fafafa;
  --color-muted: #27272a;
  --color-muted-foreground: #a1a1aa;
  --color-border: #010101;
  --color-ring: #71717b;
  --color-destructive: #ff6467;

  /* Shadows use slightly different black */
  --shadow-sm: 3px 3px 0px 0px #010101;
  --shadow-base: 4px 4px 0px 0px #010101;
  --shadow-lg: 6px 6px 0px 0px #010101;
}
```

---

## Implementation Examples

### Hero Section

```html
<section class="hero">
  <div class="container">
    <div class="hero-content">
      <span class="neo-badge neo-badge-primary">Learn Japanese</span>
      <h1>Master Japanese with <span class="text-gradient">GengoBot</span></h1>
      <p>
        AI-powered Japanese learning platform with interactive flashcards, grammar lessons, and
        conversation practice.
      </p>
      <div class="hero-buttons">
        <a href="#" class="btn-primary btn-lg">Get Started Free</a>
        <a href="#" class="btn-secondary btn-lg">Learn More</a>
      </div>
    </div>
  </div>
</section>
```

```css
.hero {
  padding: 160px 0 80px;
  background: linear-gradient(to bottom right, rgba(255, 94, 117, 0.1), rgba(115, 207, 217, 0.1));
}

.hero-content {
  max-width: 640px;
  text-align: center;
  margin: 0 auto;
}

.hero h1 {
  font-size: 48px;
  font-weight: 700;
  margin: 24px 0;
  line-height: 1.1;
}

.text-gradient {
  background: linear-gradient(to right, #ff5e75, #73cfd9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero p {
  font-size: 18px;
  color: #737373;
  margin-bottom: 32px;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}
```

### Feature Card Grid

```html
<section class="features">
  <div class="container">
    <h2>Why Choose GengoBot?</h2>
    <div class="grid-3">
      <div class="neo-card">
        <div class="feature-icon">📚</div>
        <h3>Smart Flashcards</h3>
        <p>AI-powered spaced repetition system adapts to your learning pace.</p>
      </div>
      <div class="neo-card">
        <div class="feature-icon">🎯</div>
        <h3>JLPT Preparation</h3>
        <p>Structured content for all JLPT levels from N5 to N1.</p>
      </div>
      <div class="neo-card">
        <div class="feature-icon">💬</div>
        <h3>AI Conversations</h3>
        <p>Practice speaking with our AI tutor anytime, anywhere.</p>
      </div>
    </div>
  </div>
</section>
```

```css
.features {
  padding: 80px 0;
}

.features h2 {
  text-align: center;
  margin-bottom: 48px;
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}
```

### Pricing Table

```html
<div class="pricing-card pricing-pro">
  <div class="pricing-badge">Most Popular</div>
  <h3>Pro</h3>
  <div class="pricing-price">
    <span class="price">$9.99</span>
    <span class="period">/month</span>
  </div>
  <ul class="pricing-features">
    <li>✓ Unlimited flashcards</li>
    <li>✓ All JLPT levels</li>
    <li>✓ AI conversation practice</li>
    <li>✓ Progress analytics</li>
  </ul>
  <button class="btn-primary btn-lg">Start Pro Trial</button>
</div>
```

```css
.pricing-card {
  padding: 32px;
  background: #ffffff;
  border: 2px solid #000000;
  border-radius: 8px;
  box-shadow: 6px 6px 0px 0px #000000;
  text-align: center;
}

.pricing-pro {
  border-color: #ff5e75;
  box-shadow: 6px 6px 0px 0px #ff5e75;
}

.pricing-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #ff5e75;
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
  margin-bottom: 16px;
}

.pricing-price {
  margin: 24px 0;
}

.pricing-price .price {
  font-size: 48px;
  font-weight: 700;
}

.pricing-price .period {
  color: #737373;
}

.pricing-features {
  list-style: none;
  padding: 0;
  margin: 24px 0;
  text-align: left;
}

.pricing-features li {
  padding: 8px 0;
  border-bottom: 1px solid #eeeeee;
}
```

---

## Quick Reference Cheat Sheet

### Colors to Copy

```
Primary Pink:    #ff5e75
Cyan Accent:     #73cfd9
Background:      #F8F8F8 (light) / #292A2E (dark)
Text:            #171717 (light) / #fafafa (dark)
Muted Text:      #737373
Border:          #000000
Secondary BG:    #eeeeee (light) / #191722 (dark)
```

### Essential CSS Pattern

```css
/* The GengoBot Look */
.neo-element {
  background: #ffffff;
  border: 2px solid #000000;
  border-radius: 4px;
  box-shadow: 4px 4px 0px 0px #000000;
  transition: all 0.2s ease;
}

.neo-element:hover {
  transform: translate(4px, 4px);
  box-shadow: none;
}
```

### Font Import

```html
<link
  href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

---

## Brand Assets

- **Logo**: Use with drop-shadow effect `drop-shadow(2px 2px 0px rgba(0,0,0,1))`
- **Favicon**: Available in standard sizes
- **App Screenshots**: Use neobrutalist border treatment

---

_This documentation is designed to help recreate the GengoBot visual identity across different platforms while maintaining brand consistency._
