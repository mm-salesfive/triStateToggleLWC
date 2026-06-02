import { createElement } from '@lwc/engine-dom';
import TriStateToggle from 'c/triStateToggle';

describe('c-tri-state-toggle', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    function createToggle(props = {}) {
        const element = createElement('c-tri-state-toggle', {
            is: TriStateToggle
        });
        Object.assign(element, props);
        document.body.appendChild(element);
        return element;
    }

    function getTrack(element) {
        return element.shadowRoot.querySelector('[data-tri-state-track]');
    }

    function clickTrack(element, side) {
        const track = getTrack(element);
        const rect = {
            left: 100,
            top: 10,
            width: 200,
            height: 24,
            right: 300,
            bottom: 34
        };
        jest.spyOn(track, 'getBoundingClientRect').mockReturnValue(rect);

        const clientX = side === 'left' ? 130 : 270;
        const label = element.shadowRoot.querySelector('.tri-state-toggle__label');
        label.dispatchEvent(
            new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                clientX
            })
        );
    }

    it('renders false track when tri-state is disabled', () => {
        const element = createToggle({
            label: 'Marketing',
            checked: false,
            enableTriState: false
        });

        const track = getTrack(element);
        expect(track.classList.contains('tri-state-toggle__track--false')).toBe(true);
        expect(element.shadowRoot.querySelector('.slds-checkbox_faux')).toBeNull();
    });

    it('defaults to unset center when tri-state is enabled without checked', () => {
        const element = createToggle({
            enableTriState: true
        });

        expect(element.checked).toBeNull();
        const track = getTrack(element);
        expect(track.classList.contains('tri-state-toggle__track--unset')).toBe(true);
    });

    it('selects false on left click and true on right click when unset', async () => {
        const element = createToggle({
            enableTriState: true
        });

        const handler = jest.fn();
        element.addEventListener('change', handler);

        clickTrack(element, 'left');
        await Promise.resolve();

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler.mock.calls[0][0].detail.checked).toBe(false);
        expect(getTrack(element).classList.contains('tri-state-toggle__track--false')).toBe(
            true
        );

        element.resetTriState();
        await Promise.resolve();

        clickTrack(element, 'right');
        await Promise.resolve();

        expect(handler).toHaveBeenCalledTimes(2);
        expect(handler.mock.calls[1][0].detail.checked).toBe(true);
        expect(getTrack(element).classList.contains('tri-state-toggle__track--true')).toBe(true);
        expect(element.shadowRoot.querySelector('.tri-state-toggle__check')).not.toBeNull();
    });

    it('toggles between true and false after committed', async () => {
        const element = createToggle({
            enableTriState: true,
            initialState: 'false'
        });

        element.shadowRoot.querySelector('.tri-state-toggle__label').click();
        await Promise.resolve();
        expect(element.checked).toBe(true);
        expect(getTrack(element).classList.contains('tri-state-toggle__track--true')).toBe(true);

        element.shadowRoot.querySelector('.tri-state-toggle__label').click();
        await Promise.resolve();
        expect(element.checked).toBe(false);
        expect(getTrack(element).classList.contains('tri-state-toggle__track--false')).toBe(
            true
        );
    });

    it('allows returning to null when full tri-state is enabled', async () => {
        const element = createToggle({
            enableTriState: true,
            enableFullTriState: true,
            initialState: 'false'
        });

        const handler = jest.fn();
        element.addEventListener('change', handler);

        clickTrack(element, 'left');
        await Promise.resolve();
        expect(element.checked).toBe(false);

        clickTrack(element, 'right');
        await Promise.resolve();
        expect(element.checked).toBe(true);

        const track = getTrack(element);
        const rect = {
            left: 100,
            top: 10,
            width: 300,
            height: 24,
            right: 400,
            bottom: 34
        };
        jest.spyOn(track, 'getBoundingClientRect').mockReturnValue(rect);

        const label = element.shadowRoot.querySelector('.tri-state-toggle__label');
        label.dispatchEvent(
            new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                clientX: 150
            })
        );
        await Promise.resolve();

        expect(element.checked).toBeNull();
        expect(track.classList.contains('tri-state-toggle__track--unset')).toBe(true);
        expect(handler).toHaveBeenCalledTimes(3);
    });

    it('resetTriState returns to unset when tri-state is enabled', async () => {
        const element = createToggle({
            checked: true,
            enableTriState: true
        });

        element.resetTriState();
        await Promise.resolve();

        expect(element.checked).toBeNull();
        expect(getTrack(element).classList.contains('tri-state-toggle__track--unset')).toBe(true);
    });
});
