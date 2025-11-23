# AZAD-Bazaar

Abdul Wasay, Zuhair And Deebaj bazaar

AZAD-Bazaar is a new application focused on improving the user interface and user experience gaps found in the original Bazaar app.

## TL;DR

A modern, accessible, and easy-to-use marketplace UI that keeps Bazaar's strengths while removing common usability pain points: discoverability, dense layouts, poor accessibility support, and confusing checkout flows.

## Why this project

Bazaar is a popular marketplace, but many users and evaluators have reported repeated UI deficiencies that reduce engagement and increase errors. AZAD-Bazaar targets those issues by:

- Redesigning navigation and content hierarchy for better discoverability.
- Prioritizing accessibility (keyboard navigation, screen-reader labels, contrast, and focus states).
- Simplifying product pages and the checkout flow to reduce cognitive load.
- Being modular so UI improvements can be adopted incrementally.

## Key features (planned)

- Clean, responsive product and category pages.
- Improved search with instant suggestions and filters.
- Accessible components (ARIA roles, keyboard shortcuts, focus outlines).
- Streamlined cart and checkout with clear progress indicators.
- Theme support (light/dark) and localization scaffolding.

## A note on the name

AZAD stands for Abdul Wasay (A), Zuhair (Z), and Deebaj (D). It also evokes the word "azad" (which means "free" in several South Asian languages), reflecting our aim to free users from frustrating UI patterns.

## Text‑to‑Speech (TTS) Context

The app includes a `TTSProvider` (Capacitor plugin `@capacitor-community/text-to-speech`) that lets any component speak a translation key.

### Features
- Auto language selection based on current i18n `lang`.
- Uses Urdu (`ur-PK` / variants) if supported, otherwise falls back to English.
- If a Urdu translation key is missing, falls back to roman Urdu (from `roman-ur.json`), then English.
- Simple hook API via `useTTS()`.

### Basic Usage
```jsx
import TTSDemoButton from './component/TTSDemoButton'
// Somewhere inside providers tree
<TTSDemoButton translationKey="hello" />
```

### Programmatic Usage
```jsx
import { useTTS } from '../context/TTSContext'

function SpeakCartEmpty() {
	const { speakKey } = useTTS()
	return <button onClick={() => speakKey('cart.empty.title')}>Speak Empty Cart</button>
}
```

### Adding Roman Urdu Fallbacks
Add keys to `src/locales/roman-ur.json`. TTS will prefer:
1. Urdu translation
2. Roman Urdu translation
3. English translation
4. Raw key (last resort)

### Notes
- If TTS plugin fails or is not ready, buttons are disabled.
- Customize rate/pitch/volume by passing options to `speakKey(key, { rate, pitch, volume })`.
- Provider inserted in `App.jsx` wrapping the rest of providers.

### Native Sync
After installing the dependency: `npm install @capacitor-community/text-to-speech` run `npx cap sync` (done already).


