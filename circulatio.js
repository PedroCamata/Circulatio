"use strict";

// Config variables
var circulatioBeforeDropItem;
var circulatioBeforeRemoveItem;
var circulatioBeforeRemoveColumn;
var circulatioRenameColumn;

// UI clicks
var circulatioNewColumnBtnClick;
var circulatioNewItemBtnClick;
var circulatioColumnAction;
var circulatioItemClick;

var circulatio = {
    columnActionBtns: [],
    includeNewColumnBtn: false,
    includeNewItemBtn: false,
    allowRenameColumn: false,
    createPlaceholder: () => {
        let elem = document.createElement("div");
        elem.classList.add("circulatio-p");
        return elem;
    },
    createItem: (itemId, name) => {
        let elem = document.createElement("div");
        elem.classList.add("circulatio-i");
        elem.dataset.itemId = itemId;
        elem.setAttribute("draggable", true);
        elem.innerHTML = "<div class='circulatio-i-content'><div class='circulatio-i-name'>" + name + "</div></div>"
        return elem;
    },
    createColumn: (columnId, name) => {
        let newColumn = document.createElement("div");
        newColumn.classList.add("circulatio-c");
        newColumn.dataset.columnId = columnId;
        newColumn.innerHTML = "<div class='circulatio-c-name-content'><div class='labelInput'><div class='text circulatio-c-name'>" + name + "</div><input class='input circulatio-c-rename' name='c-" + columnId + "' type='text' value='" + name + "'/></div><div class='circulatio-c-content'></div>";

        if (circulatio.columnActionBtns) {
            let actionButtons = "";
            for (let k = 0; k < circulatio.columnActionBtns.length; k++) {
                actionButtons += "<div class='dropdown-option' data-action='" + circulatio.columnActionBtns[k].action + "'>" + circulatio.columnActionBtns[k].label + "</div>";
            }

            newColumn.insertAdjacentHTML("afterbegin", "<div class='dropdown'><button>...</button><div class='dropdown-content'>" + actionButtons + "</div></div>")
        }

        if (circulatio.includeNewItemBtn) {
            newColumn.insertAdjacentHTML("beforeend", "<div class='circulatio-btn-new-i'>+ Add new item</div>");
        }



        return newColumn;
    },
    moveItem: (itemNode, columnId, order) => {
        if (!itemNode || itemNode.nodeType !== Node.ELEMENT_NODE) {
            console.error("itemNode isn't a node element");
            return false;
        }

        let columnNode = circulatio.getColumnContentNodeByColumnId(columnId);
        if (!columnNode || itemNode.nodeType !== Node.ELEMENT_NODE) {
            console.error("Column with columnId(" + columnId + ") not found");
            return false;
        }

        let qtyColumnItems = columnNode.childElementCount;
        if (qtyColumnItems > 0 && qtyColumnItems > order) {
            let childNode = columnNode.children[order];
            columnNode.insertBefore(itemNode, childNode);
        } else {
            columnNode.appendChild(itemNode);
        }

        return true;
    },
    moveColumn: (columnNode, order) => {
        if (!columnNode || columnNode.nodeType !== Node.ELEMENT_NODE) {
            console.error("Column with columnId(" + columnId + ") not found");
            return false;
        }

        let circulatioNode = document.getElementsByClassName("circulatio")[0];
        let qtyColumns = circulatioNode.childElementCount;
        if (qtyColumns > 0 && qtyColumns > order) {
            let childNode = circulatioNode.children[order];
            circulatioNode.insertBefore(columnNode, childNode);
        } else {
            circulatioNode.appendChild(columnNode);
        }

        if (circulatio.includeNewColumnBtn) {
            let newColumnBtn = document.getElementsByClassName("circulatio-btn-new-c")[0];
            if (newColumnBtn) {
                circulatioNode.appendChild(newColumnBtn);
            } else {
                circulatio.getCirculatio().insertAdjacentHTML("beforeend", "<div class='circulatio-btn-new-c'>+ Add new column</div>");
            }
        }

        return true;
    },
    removeAllCirculatioElements: () => {
        circulatio.getCirculatio().innerHTML = "";
        return true;
    },
    removeItem: (itemId) => {
        if (circulatioBeforeRemoveItem && !circulatioBeforeRemoveItem(itemId)) {
            return false;
        }
        circulatio.getItemNodeByItemId(itemId).remove();
        return true;
    },
    removeColumn: (columnId) => {
        if (circulatioBeforeRemoveItem && !circulatioBeforeRemoveColumn(columnId)) {
            return false;
        }
        circulatio.getColumnNodeByColumnId(columnId).remove();
        return true;
    },
    getColumnNodeByColumnId: (columnId) => {
        let columns = document.getElementsByClassName("circulatio-c");
        for (let i = 0; i < columns.length; i++) {
            if (columns[i].dataset.columnId == columnId) {
                return columns[i];
            }
        }
        return null;
    },
    getColumnContentNodeByColumnId: (columnId) => {
        let columns = document.getElementsByClassName("circulatio-c");
        for (let i = 0; i < columns.length; i++) {
            if (columns[i].dataset.columnId == columnId) {
                return columns[i].getElementsByClassName("circulatio-c-content")[0];
            }
        }
        return null;
    },
    getItemNodeByItemId: (itemId) => {
        let items = document.getElementsByClassName("circulatio-i");
        for (let i = 0; i < items.length; i++) {
            if (items[i].dataset.itemId == itemId) {
                return items[i];
            }
        }
        return null;
    },
    getCirculatio: () => {
        return document.getElementsByClassName("circulatio")[0];
    },
    circulatioToJson: ($circulatioId) => {
        let circulatioNode = document.getElementById($circulatioId);
        let columnNodes = circulatioNode.getElementsByClassName("circulatio-c");

        let circulatioData = {
            columns: [],
            columnAction: []
        }

        for (let i = 0; i < columnNodes.length; i++) {
            let columnId = columnNodes[i].dataset.columnId;
            let columnName = columnNodes[i].getElementsByClassName("circulatio-c-name")[0].innerHTML;

            let columnItems = columnNodes[i].getElementsByClassName("circulatio-i");
            let columnItemsData = [];

            for (let j = 0; j < columnItems.length; j++) {
                let itemId = columnItems[j].dataset.itemId;
                let itemName = columnItems[j].getElementsByClassName("circulatio-i-name")[0].innerHTML;

                let newItem = {
                    "id": itemId,
                    "name": itemName
                };

                columnItemsData.push(newItem);
            }

            let columnData = {
                "id": columnId,
                "name": columnName,
                "items": columnItemsData
            }

            circulatioData.columns.push(columnData);
        }

        return circulatioData;
    },
    jsonToCirculatio: (data) => {
        let dataColumns = data.columns;

        for (let i = 0; i < dataColumns.length; i++) {

            // Config
            circulatio.columnActionBtns = data.includeColumnActionDropdown;
            circulatio.includeNewColumnBtn = data.includeNewColumnBtn;
            circulatio.includeNewItemBtn = data.includeNewItemBtn;
            circulatio.allowRenameColumn = data.allowRenameColumn;

            let newColumn = circulatio.createColumn(dataColumns[i].id, dataColumns[i].name);

            // Always add it to the end
            circulatio.moveColumn(newColumn, Number.MAX_SAFE_INTEGER);

            let dataItems = dataColumns[i].items;
            for (let j = 0; j < dataItems.length; j++) {
                let newItem = circulatio.createItem(dataItems[j].id, dataItems[j].name);

                // Always add it to the end
                circulatio.moveItem(newItem, dataColumns[i].id, Number.MAX_SAFE_INTEGER);
            }
        }

        if (!circulatio.allowRenameColumn) {

            let labelInputElems = document.getElementsByClassName("labelInput");
            while (labelInputElems.length > 0) {
                labelInputElems[0].classList.remove("labelInput");
            }

            let labelInputRenameInputElems = document.getElementsByClassName("circulatio-c-rename");
            while (labelInputRenameInputElems.length > 0) {
                labelInputRenameInputElems[0].remove();
            }
        }

        return true;
    }
};

// Internal circulatio variables
const MINIMAL_WAIT_TIME = 33; // Around 30 times per second
var circulatioDraggedItemNode = null;
var IsCirculatioDrag = false;
var placeholderNode = circulatio.createPlaceholder();

document.addEventListener("dragstart", (event) => {
    var elem = event.target.closest(".circulatio-i");
    if (!elem || !elem.matches(".circulatio-i")) {
        // User isn't dragging a circulation item
        IsCirculatioDrag = false;
        return;
    }

    IsCirculatioDrag = true;
    circulatioDraggedItemNode = event.target;

    placeholderNode.style.height = elem.clientHeight + "px";

    setTimeout(() => {
        circulatioDraggedItemNode.style.display = "none";
    }, MINIMAL_WAIT_TIME);
});

document.addEventListener("drop", (event) => {
    if (!IsCirculatioDrag) {
        return;
    }

    let columnNode;
    let elem = event.target;

    if (elem.matches(".circulation-c")) {
        columnNode = elem;
    } else {
        columnNode = elem.closest(".circulatio-c");
    }

    if (!columnNode) {
        // User didn't drop it to a circulatio column
        dropFinish();
        return;
    }

    let columnContentNode = columnNode.getElementsByClassName("circulatio-c-content")[0];

    if (!columnContentNode) {
        console.error("Column content div doesn't exist in this column");
        dropFinish();
        return;
    }

    if (circulatioBeforeDropItem) {
        let columnId = columnNode.dataset.columnId;
        let itemId = circulatioDraggedItemNode.dataset.itemId;

        if (!columnId) {
            console.warn("Circulation column doesn't have an Id, after drop function can't be executed");
            dropFinish();
        }

        if (!itemId) {
            console.warn("Circulation item doesn't have an Id, after drop function can't be executed");
            dropFinish();
        }

        // Remove dragged item from array to count the order correctly
        let order = 0;
        let parentChildren = placeholderNode.parentNode.childNodes;
        for (let i = 0; i < parentChildren.length; i++) {
            if (parentChildren[i] == circulatioDraggedItemNode) {
                order--;
            }

            if (parentChildren[i] == placeholderNode) {
                order += i;
                break;
            }
        }

        circulatioBeforeDropItem(columnId, itemId, order)
            .then((result) => {
                if (result) {
                    // Move element to the placeholder position
                    placeholderNode.parentNode.insertBefore(circulatioDraggedItemNode, placeholderNode);
                    dropFinish();
                }
            }).catch((err) => {
                console.error("circulatioBeforeDropFunction API error" + err);
            });

    }

    function dropFinish() {
        circulatioDraggedItemNode.style.display = null;
        placeholderNode.remove();
    }
});

// Maximum 30 frames per second
var avoidDragOverFunction = false;
document.addEventListener("dragover", (event) => {
    event.preventDefault();

    if (avoidDragOverFunction) {
        return;
    }

    if (IsCirculatioDrag) {
        avoidDragOverFunction = true;
        setTimeout(() => {
            avoidDragOverFunction = false;
        }, MINIMAL_WAIT_TIME);

        let targetElem = event.target;

        if (!targetElem || targetElem.nodeType != Node.ELEMENT_NODE) {
            placeholderNode.remove();
            return;
        }

        if (targetElem.matches(".circulatio-p")) {
            return;
        }

        targetElem = targetElem.closest(".circulatio-i");

        // In case user isn't dragging over a circulatio item
        if (!targetElem) {
            let columnNode = event.target.closest(".circulatio-c");

            // In case user is dragging over a circulatio column
            if (columnNode) {
                columnNode = columnNode.getElementsByClassName("circulatio-c-content")[0];

                // Calculates if it should move item to the top or bottom of the column
                let addPlaceholderAboveTargetElement = (event.target.offsetHeight / 2) - event.layerY > 0;

                if (addPlaceholderAboveTargetElement) {
                    columnNode.prepend(placeholderNode)
                } else {
                    columnNode.appendChild(placeholderNode);
                }

                return;
            }

            // In case user isn't dragging over a circulatio element
            placeholderNode.remove();
            return;
        }

        // Calculates if it should move item before or after the item
        let addPlaceholderAboveTargetElement = (targetElem.offsetHeight / 2) - event.layerY > 0;

        if (addPlaceholderAboveTargetElement) {
            // Insert on the top of the target
            targetElem.parentNode.insertBefore(placeholderNode, targetElem);

        } else if (targetElem.nextSibling) {
            // Insert on the bottom of the target
            targetElem.parentNode.insertBefore(placeholderNode, targetElem.nextSibling);

        } else {
            targetElem.parentNode.appendChild(placeholderNode);
        }
    }
});

document.addEventListener("click", (event) => {
    circulatioButtonClicks(event);
});

function circulatioButtonClicks(event) {

    // Column action
    if (event.target.matches(".circulatio-c .dropdown-option")) {
        let columnNode = event.target.closest(".circulatio-c");
        let columnId = columnNode.dataset.columnId;
        let action = event.target.dataset.action;

        if (action && columnId) {
            if (circulatioColumnAction) {
                circulatioColumnAction(action, columnId);
            }
        }
    }

    // Button to create new item
    if (event.target.matches(".circulatio-btn-new-i")) {
        let columnNode = event.target.closest(".circulatio-c");
        let columnId = columnNode.dataset.columnId;

        if (columnId) {
            if (circulatioNewItemBtnClick) {
                circulatioNewItemBtnClick(columnId);
            }
        }
    }

    // Button to create new column
    if (event.target.matches(".circulatio-btn-new-c")) {
        if (circulatioNewColumnBtnClick) {
            circulatioNewColumnBtnClick();
        }
    }

    // Click on item
    let elem = event.target.closest(".circulatio-i");
    if (elem) {
        let columnNode = event.target.closest(".circulatio-c");
        let columnId = columnNode.dataset.columnId;

        let itemId = elem.dataset.itemId;

        if (columnId && itemId) {
            if (circulatioItemClick) {
                circulatioItemClick(itemId, columnId);
            }
        }
    }
}