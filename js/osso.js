"use strict";

// State hooks
let labelInputBeforeAction = null; // function(name)
let labelInputAction = null; // function(name, value) => boolean

// Utility helpers
const sanitizeLabelInputValue = (value) => {
    return value
        .replace(/<script[^>]*>/gi, "<code>")
        .replace(/<\/script>/gi, "</code>");
};

const closeAllDropdowns = () => {
    document.querySelectorAll('.dropdown-content').forEach(dc => {
        dc.style.display = 'none';
    });
};

const toggleDropdown = (button) => {
    const dropdown = button.closest('.dropdown');
    if (!dropdown) return;
    const content = dropdown.querySelector('.dropdown-content');
    if (!content) return;
    const isOpen = content.style.display === 'block';
    closeAllDropdowns();
    content.style.display = isOpen ? 'none' : 'block';
};

const hideAndSaveAllLabelInputs = () => {
    document.querySelectorAll('.labelInput').forEach(container => {
        const inputElem = container.querySelector('.input');
        const textElem = container.querySelector('.text');
        if (!inputElem || !textElem) return;

        // Sanitize value
        const sanitized = sanitizeLabelInputValue(inputElem.value);
        inputElem.value = sanitized;

        if (sanitized !== textElem.innerHTML && typeof labelInputAction === 'function') {
            const accepted = labelInputAction(inputElem.name, sanitized);
            if (accepted) {
                textElem.innerHTML = sanitized.replace(/(?:\r\n|\r|\n)/g, '<br>');
            }
        }

        textElem.style.display = ''; // reset to default
        inputElem.style.display = ''; // hide (CSS should control if needed)
    });
};

const showZoomModal = (imgElem) => {
    if (!imgElem || !(imgElem instanceof HTMLImageElement)) return;
    const existing = document.querySelector('.modal-img-zoom');
    if (existing) {
        existing.remove();
        return; // toggle off
    }
    const body = document.body;
    const modal = document.createElement('div');
    modal.className = 'modal modal-img-zoom show';
    modal.innerHTML = `
    <div class='modal-body center'>
      <div class='modal-close modal-btn'>x</div>
      <img id='img-zoom' class='full' src='${imgElem.currentSrc || imgElem.src}' />
    </div>`;
    body.appendChild(modal);
};

const handleTabButton = (btn) => {
    const tabmenu = btn.closest('.tabmenu');
    if (!tabmenu) return;
    const tabGroup = tabmenu.getAttribute('tab-group');
    if (!tabGroup) return;

    // Hide all tabs in group
    document.querySelectorAll(`.${tabGroup} .tab`).forEach(t => t.classList.remove('show'));

    // Show target tab(s)
    const targetTabName = btn.getAttribute('tab');
    if (targetTabName) {
        document.querySelectorAll(`.${tabGroup} .${CSS.escape(targetTabName)}`).forEach(i => {
            i.classList.add('show');
        });
    }

    // Update active button style
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('primary');
        if (b.getAttribute('tab') === targetTabName) {
            b.classList.add('primary');
        }
    });
};

const handleCardClose = (elem) => {
    const card = elem.closest('.card');
    if (card) {
        card.remove();
    } else if (elem.parentElement) {
        elem.parentElement.remove();
    }
};

// Global click listener with delegation
document.addEventListener('click', (event) => {
    const target = event.target;

    // Modal toggle (by .modal-btn or .modal) using target property as class
    if (target.matches('.modal-btn') || target.matches('.modal')) {
        event.preventDefault();
        // Determine class to look up; fallback to all modals
        const className = target.target; // legacy usage; may be undefined
        let modals = className ? Array.from(document.getElementsByClassName(className)) : [];
        let validId = true;
        if (modals.length === 0) {
            modals = Array.from(document.getElementsByClassName('modal'));
            validId = false;
        }

        modals.forEach(m => {
            if (m.classList.contains('modal-img-zoom')) {
                m.remove();
                return;
            }
            if (m.classList.contains('show')) {
                m.classList.remove('show');
            } else if (validId) {
                m.classList.add('show');
            }
        });
        return;
    }

    // Zoomable image
    if (target.matches('.zoomable') && target.tagName.toLowerCase() === 'img') {
        event.preventDefault();
        showZoomModal(target);
        return;
    }

    // Tabs
    if (target.matches('.tab-btn')) {
        event.preventDefault();
        handleTabButton(target);
        return;
    }

    // Card close
    if (target.matches('.card-close')) {
        handleCardClose(target);
        return;
    }

    // Dropdown button
    if (target.matches('.dropdown button')) {
        toggleDropdown(target);
    } else {
        closeAllDropdowns();
    }

    // Label input focus / save
    if (target.matches('.labelInput .text')) {
        hideAndSaveAllLabelInputs(); // finalize others
        const container = target.closest('.labelInput');
        if (!container) return;
        const inputElem = container.querySelector('.input');
        if (!inputElem) return;

        // Copy computed styles to input for seamless transition
        const textStyle = window.getComputedStyle(target);
        Object.assign(inputElem.style, {
            display: 'inline-block',
            fontSize: textStyle.fontSize,
            padding: textStyle.padding,
            margin: textStyle.margin,
            lineHeight: textStyle.lineHeight,
            textAlign: textStyle.textAlign
        });
        target.style.display = 'none';

        if (typeof labelInputBeforeAction === 'function') {
            labelInputBeforeAction(inputElem.name);
        }
        return;
    }

    if (!target.matches('.labelInput .input')) {
        hideAndSaveAllLabelInputs();
    }
}, false);