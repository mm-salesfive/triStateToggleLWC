import { LightningElement, api } from 'lwc';

/**
 * SLDS-styled toggle that behaves like lightning-input type="toggle" by default.
 * With enableTriState, null shows as the center position. By default the user commits
 * to true/false once (binary thereafter). With enableFullTriState, null stays selectable.
 */
export default class TriStateToggle extends LightningElement {
    _checked = false;
    _enableTriState = false;
    _enableFullTriState = false;
    _triStateLocked = false;
    _userControlled = false;
    _lastExternalChecked = undefined;
    _checkedExplicitlyProvided = false;
    _hasAppliedInitialState = false;

    @api label;
    @api name;
    @api disabled = false;
    @api messageToggleActive = '';
    @api messageToggleInactive = '';
    @api messageToggleUnset = '';
    @api variant = 'standard';

    /**
     * Record-page initial value when enableTriState is true: unset | true | false.
     * Default unset (null, center thumb). Parent components normally use checked instead.
     */
    @api initialState = 'unset';

    /**
     * When false (default), null is treated as false and the control is binary only.
     * When true, null shows the unset (center) state until the user picks a side once.
     */
    @api
    get enableTriState() {
        return this._enableTriState;
    }

    set enableTriState(value) {
        this._enableTriState = value === true || value === 'true';
        if (!this._enableTriState) {
            this._triStateLocked = true;
            if (this._checked === null) {
                this._checked = false;
            }
        }
    }

    /**
     * Requires enableTriState. When true, users can always select null (center) again via
     * the middle third of the track. When false (default), null is only available until
     * the first true/false selection.
     */
    @api
    get enableFullTriState() {
        return this._enableFullTriState;
    }

    set enableFullTriState(value) {
        this._enableFullTriState = value === true || value === 'true';
        if (this._enableFullTriState && this._checked === null) {
            this._triStateLocked = false;
        }
    }

    /**
     * Boolean or null. Null = unset (center).
     */
    @api
    get checked() {
        return this._checked;
    }

    set checked(value) {
        if (value === undefined) {
            return;
        }

        if (this.shouldDeferFalseToUnset(value)) {
            return;
        }

        this._checkedExplicitlyProvided = true;

        const normalized = this.normalizeCheckedInput(value);

        if (
            this._userControlled &&
            normalized === this._lastExternalChecked
        ) {
            return;
        }

        this._lastExternalChecked = normalized;
        this.applyCheckedState(normalized);
    }

    connectedCallback() {
        this.applyConfiguredInitialState();
    }

    shouldDeferFalseToUnset(value) {
        if (this._checkedExplicitlyProvided || this._userControlled) {
            return false;
        }
        if (!this._enableTriState || this._hasAppliedInitialState) {
            return false;
        }
        const isFalse = value === false || value === 'false';
        return isFalse && this.parseInitialState(this.initialState) === null;
    }

    applyConfiguredInitialState() {
        if (this._hasAppliedInitialState || this._userControlled) {
            return;
        }
        this._hasAppliedInitialState = true;

        if (this._checkedExplicitlyProvided) {
            return;
        }

        const state = this.resolveInitialState();
        this._lastExternalChecked = state;
        this.applyCheckedState(state);
    }

    resolveInitialState() {
        const parsed = this.parseInitialState(this.initialState);

        if (!this._enableTriState) {
            return parsed === null ? false : parsed;
        }

        return parsed;
    }

    parseInitialState(value) {
        const normalized = (value ?? 'unset').toString().trim().toLowerCase();

        if (normalized === 'unset' || normalized === 'null' || normalized === '') {
            return null;
        }
        if (normalized === 'true') {
            return true;
        }
        if (normalized === 'false') {
            return false;
        }

        return null;
    }

    get isDisabled() {
        return this.disabled === true || this.disabled === '';
    }

    get isFullTriStateActive() {
        return this._enableTriState && this._enableFullTriState;
    }

    get isUnset() {
        return this._enableTriState && this._checked === null;
    }

    get isChecked() {
        return this._checked === true;
    }

    get showLabel() {
        return this.variant !== 'label-hidden';
    }

    get labelTabIndex() {
        return this.isDisabled ? '-1' : '0';
    }

    get labelClass() {
        const classes = ['tri-state-toggle__label', 'slds-grid'];
        if (this.isDisabled) {
            classes.push('tri-state-toggle--disabled');
        }
        return classes.join(' ');
    }

    get trackClass() {
        const classes = ['tri-state-toggle__track'];
        if (this.isUnset) {
            classes.push('tri-state-toggle__track--unset');
        } else if (this.isChecked) {
            classes.push('tri-state-toggle__track--true');
        } else {
            classes.push('tri-state-toggle__track--false');
        }
        return classes.join(' ');
    }

    get showCheckmark() {
        return !this.isUnset && this.isChecked;
    }

    get ariaChecked() {
        if (this.isUnset) {
            return 'mixed';
        }
        return this.isChecked ? 'true' : 'false';
    }

    get activeMessage() {
        if (this.isUnset) {
            return this.messageToggleUnset || 'Not set';
        }
        return this.isChecked ? this.messageToggleActive : this.messageToggleInactive;
    }

    normalizeCheckedInput(value) {
        if (value === null || value === undefined) {
            return null;
        }
        return value === true || value === 'true';
    }

    applyCheckedState(value) {
        if (value === null) {
            this._checked = null;
            if (this._enableTriState) {
                this._triStateLocked = false;
            } else {
                this._checked = false;
                this._triStateLocked = true;
            }
            return;
        }

        this._checked = value;
        if (!this.isFullTriStateActive) {
            this._triStateLocked = true;
        }
    }

    /**
     * Clears the one-way lock and returns to the center unset state (enableTriState must be true).
     */
    @api
    resetTriState() {
        if (!this._enableTriState) {
            return;
        }
        this._userControlled = false;
        this._checkedExplicitlyProvided = false;
        this._hasAppliedInitialState = false;
        this._checked = null;
        this._triStateLocked = false;
        this._lastExternalChecked = null;
        this.applyConfiguredInitialState();
    }

    @api
    focus() {
        this.template.querySelector('[data-toggle-input]')?.focus();
    }

    commitSelection(nextChecked) {
        if (this.isDisabled || nextChecked === this._checked) {
            return;
        }

        this._userControlled = true;
        this._checked = nextChecked;
        this._lastExternalChecked = nextChecked;

        if (!this.isFullTriStateActive && nextChecked !== null) {
            this._triStateLocked = true;
        } else if (nextChecked === null) {
            this._triStateLocked = false;
        }

        this.dispatchChange();
    }

    resolveClickFromTrack(event) {
        const track = this.template.querySelector('[data-tri-state-track]');
        if (!track) {
            return undefined;
        }

        const rect = track.getBoundingClientRect();
        if (!rect.width) {
            return undefined;
        }

        const ratio = (event.clientX - rect.left) / rect.width;

        if (this.isFullTriStateActive) {
            if (ratio < 1 / 3) {
                return false;
            }
            if (ratio > 2 / 3) {
                return true;
            }
            return null;
        }

        if (ratio < 0.5) {
            return false;
        }
        if (ratio > 0.5) {
            return true;
        }

        return undefined;
    }

    handleActivate(event) {
        event.preventDefault();
        if (this.isDisabled) {
            return;
        }

        if (this._enableTriState) {
            const selection = this.resolveClickFromTrack(event);
            if (selection === undefined) {
                return;
            }
            this.commitSelection(selection);
            return;
        }

        this.commitSelection(!this.isChecked);
    }

    handleKeydown(event) {
        if (this.isDisabled) {
            return;
        }

        if (this._enableTriState) {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                this.commitSelection(false);
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                this.commitSelection(true);
            } else if (this.isFullTriStateActive && event.key === 'ArrowDown') {
                event.preventDefault();
                this.commitSelection(null);
            }
            return;
        }

        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            this.handleActivate(event);
        }
    }

    dispatchChange() {
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: { checked: this._checked },
                bubbles: true,
                composed: true
            })
        );
    }
}
