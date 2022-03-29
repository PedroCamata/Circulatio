"use strict";

// Config variables
var circulatioBeforeDropItem;
var circulatioBeforeDropColumn;
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
    allowMoveItems: false,
    createItemPlaceholder: () => {
        let elem = document.createElement("div");
        elem.classList.add("circulatio-p-i");
        return elem;
    },
    createColumnPlaceholder: () => {
        let elem = document.createElement("div");
        elem.classList.add("circulatio-p-c");
        return elem;
    },
    createItem: (itemId, name) => {
        let elem = document.createElement("div");
        elem.classList.add("circulatio-i");
        elem.dataset.itemId = itemId;
        elem.setAttribute("draggable", circulatio.allowMoveItems);
        elem.innerHTML = "<div class='circulatio-i-content'><div class='circulatio-i-name'>" + name + "</div></div>"
        return elem;
    },
    createColumn: (columnId, name) => {
        let newColumn = document.createElement("div");
        newColumn.classList.add("circulatio-c");
        newColumn.dataset.columnId = columnId;
        newColumn.setAttribute("draggable", circulatio.allowMoveItems);
        newColumn.innerHTML = "<div class='circulatio-c-name-content'><div class='labelInput'><input class='input circulatio-c-rename' name='c-" + columnId + "' type='text' value='" + name + "'/><div class='text circulatio-c-name'>" + name + "</div></div><div class='circulatio-c-content'></div>";

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
    moveItem: (itemNode, columnId, position) => {
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
        if (qtyColumnItems > 0 && qtyColumnItems > position) {
            let childNode = columnNode.children[position];
            columnNode.insertBefore(itemNode, childNode);
        } else {
            columnNode.appendChild(itemNode);
        }

        return true;
    },
    moveColumn: (columnNode, position) => {
        if (!columnNode || columnNode.nodeType !== Node.ELEMENT_NODE) {
            console.error("Column with columnId(" + columnId + ") not found");
            return false;
        }

        let circulatioNode = circulatio.getCirculatio();
        let columnListNode = document.getElementsByClassName("circulatio-c-list")[0];
        if (!columnListNode) {
            // Create list
            columnListNode = document.createElement("div");
            columnListNode.classList.add("circulatio-c-list");
            circulatioNode.appendChild(columnListNode);
        }

        let qtyColumns = columnListNode.childElementCount;
        if (qtyColumns > 0 && qtyColumns > position) {
            let childNode = columnListNode.children[position];
            columnListNode.insertBefore(columnNode, childNode);
        } else {
            columnListNode.appendChild(columnNode);
        }

        if (circulatio.includeNewColumnBtn) {
            let newColumnBtn = document.getElementsByClassName("circulatio-btn-new-c")[0];
            if (newColumnBtn) {
                columnListNode.appendChild(newColumnBtn);
            } else {
                columnListNode.insertAdjacentHTML("beforeend", "<div class='circulatio-btn-new-c'>+ Add new column</div>");
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
            circulatio.allowMoveItems = data.allowMoveItems;

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
var circulatioDraggedColumnNode = null;
var IsCirculatioDrag = false;
var itemPlaceholderNode = circulatio.createItemPlaceholder();
var columnPlaceholderNode = circulatio.createColumnPlaceholder();

document.addEventListener("dragstart", (event) => {
    if (!circulatio.allowMoveItems) {
        return;
    }

    circulatioDraggedItemNode = null;

    let elem = event.target.closest(".circulatio-i");
    if (elem && elem.matches(".circulatio-i")) {
        // Circulatio item drag
        IsCirculatioDrag = true;
        circulatioDraggedItemNode = elem;
        itemPlaceholderNode.style.height = elem.clientHeight + "px";

        setTimeout(() => {
            circulatioDraggedItemNode.style.display = "none";
        }, MINIMAL_WAIT_TIME);
        return;
    }

    elem = event.target.closest(".circulatio-c");
    if (elem && elem.matches(".circulatio-c")) {
        // Circulatio column drag
        IsCirculatioDrag = true;
        circulatioDraggedColumnNode = elem;
        columnPlaceholderNode.style.width = elem.clientWidth + "px";

        if (circulatioDraggedColumnNode.nextSibling) {
            circulatioDraggedColumnNode.parentNode.insertBefore(columnPlaceholderNode, circulatioDraggedColumnNode.nextSibling);
        } else {
            circulatio.moveColumn(columnPlaceholderNode, Number.MAX_SAFE_INTEGER);
        }

        setTimeout(() => {
            circulatioDraggedColumnNode.style.display = "none";
        }, MINIMAL_WAIT_TIME);
        return;
    }
});

document.addEventListener("dragend", (event) => {
    if (!IsCirculatioDrag) {
        return;
    }

    // Circulatio item drop
    if (circulatioDraggedItemNode) {
        let columnNode;
        let elem = event.target;

        if (elem.matches(".circulation-c")) {
            columnNode = elem;
        } else {
            columnNode = elem.closest(".circulatio-c");
        }

        if (!columnNode) {
            // User didn't drop it to a circulatio column
            circulatioElemDropFinish();
            return;
        }

        let columnContentNode = columnNode.getElementsByClassName("circulatio-c-content")[0];

        if (!columnContentNode) {
            console.error("Column content div doesn't exist in this column");
            circulatioElemDropFinish();
            return;
        }

        if (circulatioBeforeDropItem) {
            let columnId = columnNode.dataset.columnId;
            let itemId = circulatioDraggedItemNode.dataset.itemId;

            if (!columnId) {
                console.warn("Circulation column doesn't have an Id, before drop function can't be executed");
                circulatioElemDropFinish();
            }

            if (!itemId) {
                console.warn("Circulation item doesn't have an Id, before drop function can't be executed");
                circulatioElemDropFinish();
            }

            // Remove dragged item from array to count the position correctly
            let position = 0;
            let parentChildren = itemPlaceholderNode.parentNode.childNodes;
            for (let i = 0; i < parentChildren.length; i++) {
                if (parentChildren[i] == circulatioDraggedItemNode) {
                    position--;
                }

                if (parentChildren[i] == itemPlaceholderNode) {
                    position += i;
                    break;
                }
            }

            circulatioBeforeDropItem(columnId, itemId, position)
                .then((result) => {
                    if (result) {
                        // Move element to the placeholder position
                        itemPlaceholderNode.parentNode.insertBefore(circulatioDraggedItemNode, itemPlaceholderNode);
                        circulatioElemDropFinish();
                    }
                }).catch((err) => {
                    console.error("circulatioBeforeDropItem API error" + err);
                });
        }
    }

    if (circulatioDraggedColumnNode) {
        let columnNode = event.target; // Placeholder

        if (!columnNode) {
            // User didn't drop it to a circulatio column
            circulatioElemDropFinish();
            return;
        }

        if (circulatioDraggedColumnNode) {
            let columnId = circulatioDraggedColumnNode.dataset.columnId;

            if (!columnId) {
                console.warn("Circulation dragged column doesn't have an Id, before drop function can't be executed");
                circulatioElemDropFinish();
            }

            // Remove dragged item from array to count the position correctly
            let position = 0;
            let parentChildren = columnPlaceholderNode.parentNode.childNodes;
            for (let i = 0; i < parentChildren.length; i++) {

                // Ignore all elements that aren't column or column placeholder
                if (!parentChildren[i].matches(".circulatio-c")
                    && !parentChildren[i].matches(".circulatio-p-c")) {
                    break;
                }

                if (parentChildren[i] == circulatioDraggedColumnNode) {
                    position--;
                }

                if (parentChildren[i] == columnPlaceholderNode) {
                    position += i;
                    break;
                }
            }

            circulatioBeforeDropColumn(columnId, position)
                .then((result) => {
                    if (result) {
                        // Move element to the placeholder position
                        columnPlaceholderNode.parentNode.insertBefore(circulatioDraggedColumnNode, columnPlaceholderNode);
                        circulatioElemDropFinish();
                    }
                }).catch((err) => {
                    console.error("circulatioBeforeDropColumn API error" + err);
                });
        }
    }

    function circulatioElemDropFinish() {
        if (circulatioDraggedItemNode) {
            circulatioDraggedItemNode.style.display = null;
            itemPlaceholderNode.remove();
            circulatioDraggedItemNode = null;
        }

        if (circulatioDraggedColumnNode) {
            circulatioDraggedColumnNode.style.display = null;
            columnPlaceholderNode.remove();
            circulatioDraggedColumnNode = null;
        }

        IsCirculatioDrag = false;
    }
});

// Maximum 30 frames per second
var avoidDragOverFunction = false;
document.addEventListener("dragover", (event) => {
    event.preventDefault();

    if (!IsCirculatioDrag || avoidDragOverFunction) {
        return;
    }

    if (circulatioDraggedItemNode) {
        avoidDragOverFunction = true;
        setTimeout(() => {
            avoidDragOverFunction = false;
        }, MINIMAL_WAIT_TIME);

        let targetElem = event.target;
        if (!targetElem
            || targetElem.nodeType != Node.ELEMENT_NODE
            || targetElem.matches(".circulatio-p-i")) {
            return;
        }

        let itemListNode;
        targetElem = targetElem.closest(".circulatio-i");

        if (targetElem) {
            itemListNode = targetElem.parentNode;
        } else {
            targetElem = event.target;
            let columnNode = targetElem.closest(".circulatio-c");
            if (columnNode) {
                targetElem = columnNode;
                itemListNode = columnNode.getElementsByClassName("circulatio-c-content")[0];
            } else {
                // In case user isn't dragging over a circulatio column
                return;
            }
        }

        // Calculates if it should insert item before or after the hovered item
        let addPlaceholderAboveTargetElement = (targetElem.offsetHeight / 2) - event.layerY > 0;

        if (targetElem.matches(".circulatio-i")) {
            if (addPlaceholderAboveTargetElement) {
                // Insert on the top of the target
                itemListNode.insertBefore(itemPlaceholderNode, targetElem);

            } else if (targetElem.nextSibling) {
                // Insert on the bottom of the target
                itemListNode.insertBefore(itemPlaceholderNode, targetElem.nextSibling);
            } else {
                itemListNode.appendChild(itemPlaceholderNode);
            }
        } else {
            if (addPlaceholderAboveTargetElement) {
                itemListNode.prepend(itemPlaceholderNode)
            } else {
                itemListNode.appendChild(itemPlaceholderNode);
            }
        }

        return;
    }

    if (circulatioDraggedColumnNode) {
        avoidDragOverFunction = true;
        setTimeout(() => {
            avoidDragOverFunction = false;
        }, MINIMAL_WAIT_TIME);

        let targetElem = event.target;
        if (!targetElem
            || targetElem.nodeType != Node.ELEMENT_NODE
            || targetElem.matches(".circulatio-p-c")) {
            return;
        }

        let columnNode = targetElem.closest(".circulatio-c");
        let columnParent;

        if (columnNode) {
            columnParent = columnNode.parentNode;
        } else {
            // In case user isn't dragging over a circulatio column
            return;
        }

        // Calculates if it should insert column before or after the hovered target element
        let addPlaceholderAboveTargetElement = (targetElem.offsetWidth / 2) - event.layerX > 0;

        if (addPlaceholderAboveTargetElement) {
            // Insert on the top of the target
            columnParent.insertBefore(columnPlaceholderNode, columnNode);
        } else if (columnNode.nextSibling) {
            // Insert on the bottom of the target
            columnParent.insertBefore(columnPlaceholderNode, columnNode.nextSibling);
        } else {
            columnParent.appendChild(columnPlaceholderNode);
        }

        if (circulatio.includeNewColumnBtn) {
            let newColumnBtn = document.getElementsByClassName("circulatio-btn-new-c")[0];
            if (newColumnBtn) {
                columnParent.appendChild(newColumnBtn);
            }
        }
        return;
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

    // Enable select column name text on draggable columns
    if (event.target.matches(".labelInput .text.circulatio-c-name")
        || event.target.matches(".labelInput .input.circulatio-c-rename")) {
        let columnNode = event.target.closest(".circulatio-c");
        columnNode.setAttribute("draggable", false);
    } else {
        let allColumns = document.getElementsByClassName("circulatio-c");
        for (let i = 0; i < allColumns.length; i++) {
            allColumns[i].setAttribute("draggable", true);
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