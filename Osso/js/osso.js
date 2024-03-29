"use strict";

let labelInputBeforeAction = false;
let labelInputAction = false;

document.addEventListener('click', (event) => {
    if (event.target.matches('.modal-btn')
        || event.target.matches('.modal')) {

        event.preventDefault();

        var modals = document.getElementsByClassName(event.target.target);
        var validId = true;

        if (modals.length === 0) {
            modals = document.getElementsByClassName('modal');
            validId = false;
        }

        for (const i of modals) {
            if (i.classList.contains('modal-img-zoom')) {
                i.remove();
                return;
            }

            if (i.classList.contains('show')) {
                i.classList.remove('show');
            } else if (validId) {
                i.classList.add('show');
            }
        }

    } else if (event.target.matches('.zoomable')
        && event.target.matches('img')) {

        event.preventDefault();
        // Zoom img
        document.getElementsByTagName('body')[0].innerHTML += "<div class='modal modal-img-zoom show'><div class= 'modal-body center'><div class= 'modal-close modal-btn'>x</div><img id='img-zoom' class='full' src='" + event.target.currentSrc + "'></div></div>";

    } else if (event.target.matches('.tab-btn')) {

        event.preventDefault();
        var btn = event.target;
        var tabGroup = btn.closest('.tabmenu').getAttribute('tab-group');

        // Hide everything in tabGroup
        for (const g of document.getElementsByClassName(tabGroup)) {
            for (const t of g.getElementsByClassName('tab')) {
                t.classList.remove('show');
            }
        }

        // Show active tab in tabGroup
        for (const i of document.querySelectorAll('.' + tabGroup + ' .' + btn.getAttribute('tab'))) {
            if (!i.classList.contains('show')) {
                i.classList.add('show');
            }
        }

        for (const b of document.getElementsByClassName("tab-btn")) {
            b.classList.remove('primary');
            if (b.getAttribute('tab') == btn.getAttribute('tab')) {
                b.classList.add('primary');
            }
        }
    } else if (event.target.matches('.card-close')) {
        var elem = event.target;
        var card = elem.closest('.card');
        if (card == null) {
            elem.parentElement().remove();
        }
        card.remove();
    }

    // Dropdown
    if (event.target.matches(".dropdown button")) {
        let targetElem = event.target.closest(".dropdown");

        let dropDownContent = targetElem.getElementsByClassName("dropdown-content")[0];

        if (dropDownContent.style.display != "block") {
            dropDownContent.style.display = "block";
        } else {
            dropDownContent.style.display = "none";
        }
    } else {
        let allColumnOptions = document.getElementsByClassName("dropdown-content");

        for (let i = 0; i < allColumnOptions.length; i++) {
            allColumnOptions[i].style.display = "none";
        }
    }

    // Label input click
    if (event.target.matches(".labelInput .text")) {

        hideAndSaveAllLabelInputs();

        // Show input
        let textLabelInput = event.target;
        let inputElem = textLabelInput.closest(".labelInput")
            .getElementsByClassName("input")[0];

        // Get style from text element
        let textStyle = window.getComputedStyle(textLabelInput);

        // Asign some of text element style to input element
        Object.assign(inputElem.style, {
            display: "inline-block",
            fontSize: textStyle.getPropertyValue("font-size"),
            padding: textStyle.getPropertyValue("padding"),
            margin: textStyle.getPropertyValue("margin"),
            lineHeight: textStyle.getPropertyValue("line-height"),
            textAlign: textStyle.getPropertyValue("text-align")
        });

        // Hide text
        textLabelInput.style.display = "none";

        // Call API
        if (labelInputBeforeAction) {
            labelInputBeforeAction(inputElem.name);
        }

    } else if (!event.target.matches(".labelInput .input")) {
        hideAndSaveAllLabelInputs();
    }

    // Private function
    function hideAndSaveAllLabelInputs() {
        let labelInputElems = document.getElementsByClassName("labelInput");
        for (let i = 0; i < labelInputElems.length; i++) {
            let inputElem = labelInputElems[i].getElementsByClassName("input")[0];

            // Remove <script> tags
            let inputValueSanitized = inputElem.value
                .replace(/<script[^>]*>/gi, "<code>")
                .replace(/<\/script>/gi, "</code>");
            inputElem.value = inputValueSanitized;

            let textElem = labelInputElems[i].getElementsByClassName("text")[0];

            if (inputValueSanitized != textElem.innerHTML
                && labelInputAction) {
                // Call API
                if (labelInputAction(inputElem.name, inputValueSanitized)) {
                    // Replace string line break to <br>
                    textElem.innerHTML = inputValueSanitized.replace(/(?:\r\n|\r|\n)/g, "<br>");
                }
            }

            textElem.style.display = ""; // inherit
            inputElem.style.display = ""; // none by default
        }
    }
}, false);

