# Tri-State Toggle (LWC)

A Lightning Web Component that looks and feels like the standard Salesforce **toggle** (`lightning-input type="toggle"`), with optional support for a third **unset** state (`null`)—useful for consent fields, optional booleans, and “not answered yet” workflows.

## Features

- **Binary mode** (default) — same width and visual language as the SLDS two-state toggle.
- **Tri-state (commit once)** — starts at **unset** (center, grey track); user picks **false** (left) or **true** (right), then toggles only between on/off.
- **Full tri-state** — user can return to **unset** anytime via the center zone of the track.
- **Record-page ready** — exposed in App Builder with design attributes.
- **Accessible** — keyboard support for state changes; `aria-checked` includes `mixed` for unset.

## Operating modes

| Mode | Properties | Behavior |
|------|------------|----------|
| Standard toggle | `enable-tri-state={false}` | `true` / `false` only. |
| Tri-state (default) | `enable-tri-state` + `enable-full-tri-state={false}` | `null` until first selection; then binary. |
| Full tri-state | `enable-tri-state` + `enable-full-tri-state` | Always **left** = false, **center** = null, **right** = true. |

### Click zones (tri-state enabled)

```
┌─────────────────────────────┐
│  false  │  null  │   true   │
│  (left) │(center)│  (right) │
└─────────────────────────────┘
```

In **commit-once** mode, only the first interaction uses left/right halves (center is shown but selecting false/true uses half-track targets). In **full tri-state** mode, the track is split into thirds.

### Keyboard

| Key | Tri-state | Full tri-state |
|-----|-----------|----------------|
| `←` | false | false |
| `→` | true | true |
| `↓` | — | null (unset) |
| `Space` / `Enter` | Toggle on/off (binary mode only) | — |

## Installation

### Deploy to a Salesforce org

```bash
# Authorize your org (once)
sf org login web --alias myOrg

# Deploy the component
sf project deploy start --source-dir force-app/main/default/lwc/triStateToggle
```

Or deploy the whole project:

```bash
sf project deploy start
```

### Use in another SFDX project

Copy `force-app/main/default/lwc/triStateToggle` into your project’s `force-app` tree, or add this repo as a submodule / package dependency and deploy.

## Usage

### Lightning App Builder

1. Edit a **Record**, **App**, or **Home** page.
2. Drag **Tri-State Toggle** onto the page.
3. Configure:
   - **Enable tri-state** — third (unset) state.
   - **Enable full tri-state** — allow returning to unset after true/false (requires tri-state).
   - **Initial state** — `unset`, `true`, or `false` (when tri-state is on).

### Inside a parent LWC

```html
<c-tri-state-toggle
    label="Marketing consent"
    enable-tri-state
    enable-full-tri-state
    checked={consentValue}
    message-toggle-active="On"
    message-toggle-inactive="Off"
    message-toggle-unset="Not set"
    onchange={handleConsentChange}
></c-tri-state-toggle>
```

```javascript
// consentValue: true | false | null
handleConsentChange(event) {
    this.consentValue = event.detail.checked;
}
```

### Programmatic reset to unset

```javascript
const toggle = this.template.querySelector('c-tri-state-toggle');
toggle.resetTriState(); // requires enable-tri-state
```

## Public API

| Attribute / method | Type | Default | Description |
|--------------------|------|---------|-------------|
| `label` | `String` | — | Field label. |
| `name` | `String` | — | Input name (form semantics). |
| `checked` | `Boolean \| null` | `false` | Current value. `null` = unset (tri-state). |
| `disabled` | `Boolean` | `false` | Disables interaction. |
| `enableTriState` | `Boolean` | `false` | Enables unset / tri-state behavior. |
| `enableFullTriState` | `Boolean` | `false` | Allows returning to `null` after commit. |
| `initialState` | `String` | `'unset'` | App Builder initial value: `unset`, `true`, `false`. |
| `messageToggleActive` | `String` | `''` | Assistive / on label. |
| `messageToggleInactive` | `String` | `''` | Assistive / off label. |
| `messageToggleUnset` | `String` | `''` | Assistive text for unset (defaults to “Not set”). |
| `variant` | `String` | `'standard'` | `'label-hidden'` hides the label. |
| `resetTriState()` | method | — | Sets `checked` to `null` when tri-state is enabled. |
| `focus()` | method | — | Focuses the control. |

### Events

| Event | `detail` | Description |
|-------|----------|-------------|
| `change` | `{ checked: true \| false \| null }` | Fired when the user changes the value. |

## Styling

Override CSS custom properties on the host to match your org’s toggle colors:

```css
c-tri-state-toggle {
    --tri-state-track-bg-off: #747474;
    --tri-state-track-bg-on: #009900; /* e.g. match lightning-input toggle */
}
```

| Variable | Default | Purpose |
|----------|---------|---------|
| `--tri-state-track-width` | `3rem` | Track width (matches standard SLDS toggle). |
| `--tri-state-track-height` | `1.5rem` | Track height. |
| `--tri-state-track-bg-off` | `#747474` | False / unset track. |
| `--tri-state-track-bg-on` | `#2e844a` | True track (checkmark + green). |
| `--tri-state-thumb-size` | `1.125rem` | Thumb diameter. |

## Development

### Prerequisites

- [Salesforce CLI](https://developer.salesforce.com/tools/salesforcecli)
- Node.js 18+ (for linting and unit tests)

### Scripts

```bash
npm install

# Unit tests
npm test

# Lint LWC JavaScript
npm run lint

# Format
npm run prettier
```

### Project layout

```
force-app/main/default/lwc/triStateToggle/
├── triStateToggle.html
├── triStateToggle.js
├── triStateToggle.css
├── triStateToggle.js-meta.xml
└── __tests__/triStateToggle.test.js
```

## API version

- Component bundle: **API 65.0**
- Project default (`sfdx-project.json`): **66.0**

## License

This project is provided as-is for use in Salesforce orgs. Add your preferred license file if you publish the repository publicly.
