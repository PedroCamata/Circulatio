"use strict";

// Hooks / overrides
let circulatioBeforeDropItem;
let circulatioBeforeDropColumn;
let circulatioBeforeRemoveItem;
let circulatioBeforeRemoveColumn;
let circulatioRenameColumn;

let circulatioNewColumnBtnClick;
let circulatioNewItemBtnClick;
let circulatioColumnAction;
let circulatioItemClick;

const circulationClasses = {
    circulatio: "circulatio",
    circulatioColumn: "circulatio-c",
    circulatioItem: "circulatio-i",
    circulatioItemName: "circulatio-i-name",
    circulatioItemContent: "circulatio-i-content",
    circulatioColumnContent: "circulatio-c-content",
    circulatioColumnName: "circulatio-c-name",
    circulatioColumnAction: "circulatio-c-action",
    circulatioNewItemBtn: "circulatio-btn-new-i",
    circulatioNewColumnBtn: "circulatio-btn-new-c",
    circulatioItemPlaceholder: "circulatio-p-i",
    circulatioColumnPlaceholder: "circulatio-p-c",
    circulatioDropdown: "dropdown",
    circulatioDropdownButton: "dropdown-button",
    circulatioDropdownContent: "dropdown-content",
    circulatioDropdownOption: "dropdown-option",
    circulatioLabelInput: "labelInput", // Used
    circulatioTextInput: "input",
    circulatioText: "text"
};

const circulatio = {
    columnActionBtns: [],
    includeNewColumnBtn: false,
    includeNewItemBtn: false,
    allowRenameColumn: false,
    allowMoveItems: false,



    createItemPlaceholder: () => {
        const elem = document.createElement("div");
        elem.classList.add("circulatio-p-i");
        return elem;
    },

    createColumnPlaceholder: () => {
        const elem = document.createElement("div");
        elem.classList.add("circulatio-p-c");
        return elem;
    },

    createItem: (itemId, name) => {
        const elem = document.createElement("div");
        elem.classList.add("circulatio-i");
        elem.dataset.itemId = itemId;
        elem.setAttribute("draggable", circulatio.allowMoveItems);
        elem.innerHTML = `
      <div class="circulatio-i-content">
        <div class="circulatio-i-name">${name}</div>
      </div>`;
        return elem;
    },

    _buildColumnActionDropdownHTML: () => {
        if (!Array.isArray(circulatio.columnActionBtns) || circulatio.columnActionBtns.length === 0) {
            return "";
        }
        const options = circulatio.columnActionBtns
            .map(btn => `<div class="dropdown-option" data-action="${btn.action}">${btn.label}</div>`)
            .join("");
        return `<div class="dropdown">
              <button>...</button>
              <div class="dropdown-content">${options}</div>
            </div>`;
    },

    createColumn: (columnId, name) => {
        const newColumn = document.createElement("div");
        newColumn.classList.add("circulatio-c");
        newColumn.dataset.columnId = columnId;
        newColumn.setAttribute("draggable", circulatio.allowMoveItems);

        newColumn.innerHTML = `
      ${circulatio._buildColumnActionDropdownHTML()}
      <div class="circulatio-c-name-content">
        <div class="${circulationClasses.circulatioLabelInput}">
          <input class="input circulatio-c-rename" name="c-${columnId}" type="text" value="${name}"/>
          <div class="text circulatio-c-name">${name}</div>
        </div>
        <div class="circulatio-c-content"></div>
      </div>`;

        if (circulatio.includeNewItemBtn) {
            newColumn.insertAdjacentHTML("beforeend", `<div class="circulatio-btn-new-i">+ Add new item</div>`);
        }

        return newColumn;
    },

    moveItem: (itemNode, columnId, position) => {
        if (!itemNode || itemNode.nodeType !== Node.ELEMENT_NODE) {
            console.error("itemNode isn't a node element");
            return false;
        }

        const columnNode = circulatio.getColumnContentNodeByColumnId(columnId);
        if (!columnNode) {
            console.error(`Column with columnId(${columnId}) not found`);
            return false;
        }

        const qtyColumnItems = columnNode.childElementCount;
        if (qtyColumnItems > position && position >= 0) {
            columnNode.insertBefore(itemNode, columnNode.children[position]);
        } else {
            columnNode.appendChild(itemNode);
        }
        return true;
    },

    moveColumn: (columnNode, position) => {
        if (!columnNode || columnNode.nodeType !== Node.ELEMENT_NODE) {
            console.error("Invalid columnNode passed to moveColumn");
            return false;
        }

        const circulatioNode = circulatio.getCirculatio();
        if (!circulatioNode) {
            console.error("Circulatio root container not found");
            return false;
        }

        let columnListNode = document.getElementsByClassName("circulatio-c-list")[0];
        if (!columnListNode) {
            columnListNode = document.createElement("div");
            columnListNode.classList.add("circulatio-c-list");
            circulatioNode.appendChild(columnListNode);
        }

        const qtyColumns = columnListNode.childElementCount;
        if (qtyColumns > position && position >= 0) {
            columnListNode.insertBefore(columnNode, columnListNode.children[position]);
        } else {
            columnListNode.appendChild(columnNode);
        }

        if (circulatio.includeNewColumnBtn) {
            const newColumnBtn = document.getElementsByClassName("circulatio-btn-new-c")[0];
            if (newColumnBtn) {
                columnListNode.appendChild(newColumnBtn);
            } else {
                columnListNode.insertAdjacentHTML("beforeend", `<div class="circulatio-btn-new-c">+ Add new column</div>`);
            }
        }

        return true;
    },

    removeAllCirculatioElements: () => {
        const root = circulatio.getCirculatio();
        if (root) {
            root.innerHTML = "";
            return true;
        }
        return false;
    },

    removeItem: (itemId) => {
        if (circulatioBeforeRemoveItem && !circulatioBeforeRemoveItem(itemId)) {
            return false;
        }
        const node = circulatio.getItemNodeByItemId(itemId);
        if (node) node.remove();
        return true;
    },

    removeColumn: (columnId) => {
        if (circulatioBeforeRemoveColumn && !circulatioBeforeRemoveColumn(columnId)) {
            return false;
        }
        const node = circulatio.getColumnNodeByColumnId(columnId);
        if (node) node.remove();
        return true;
    },

    getColumnNodeByColumnId: (columnId) => {
        return Array.from(document.getElementsByClassName("circulatio-c")).find(
            col => col.dataset.columnId == columnId
        ) || null;
    },

    getColumnContentNodeByColumnId: (columnId) => {
        const column = circulatio.getColumnNodeByColumnId(columnId);
        if (!column) return null;
        return column.getElementsByClassName("circulatio-c-content")[0] || null;
    },

    getItemNodeByItemId: (itemId) => {
        return Array.from(document.getElementsByClassName("circulatio-i")).find(
            item => item.dataset.itemId == itemId
        ) || null;
    },

    getCirculatio: () => {
        return document.getElementsByClassName("circulatio")[0] || null;
    },

    circulatioToJson: ($circulatioId) => {
        const circulatioNode = document.getElementById($circulatioId);
        if (!circulatioNode) return null;

        const columnNodes = circulatioNode.getElementsByClassName("circulatio-c");
        const circulatioData = { columns: [], columnAction: [] };

        Array.from(columnNodes).forEach(column => {
            const columnId = column.dataset.columnId;
            const nameElem = column.getElementsByClassName("circulatio-c-name")[0];
            const columnName = nameElem ? nameElem.innerHTML : "";

            const items = column.getElementsByClassName("circulatio-i");
            const columnItemsData = Array.from(items).map(item => {
                const itemId = item.dataset.itemId;
                const itemNameElem = item.getElementsByClassName("circulatio-i-name")[0];
                const itemName = itemNameElem ? itemNameElem.innerHTML : "";
                return { id: itemId, name: itemName };
            });

            circulatioData.columns.push({
                id: columnId,
                name: columnName,
                items: columnItemsData
            });
        });

        return circulatioData;
    },

    jsonToCirculatio: (data) => {
        if (!data || !Array.isArray(data.columns)) return false;

        circulatio.columnActionBtns = data.includeColumnActionDropdown;
        circulatio.includeNewColumnBtn = data.includeNewColumnBtn;
        circulatio.includeNewItemBtn = data.includeNewItemBtn;
        circulatio.allowRenameColumn = data.allowRenameColumn;
        circulatio.allowMoveItems = data.allowMoveItems;

        data.columns.forEach(col => {
            const newColumn = circulatio.createColumn(col.id, col.name);
            circulatio.moveColumn(newColumn, Number.MAX_SAFE_INTEGER);

            if (Array.isArray(col.items)) {
                col.items.forEach(item => {
                    const newItem = circulatio.createItem(item.id, item.name);
                    circulatio.moveItem(newItem, col.id, Number.MAX_SAFE_INTEGER);
                });
            }
        });

        if (!circulatio.allowRenameColumn) {
            // Remove rename UI affordances
            const labelInputElems = Array.from(document.getElementsByClassName(circulationClasses.circulatioLabelInput));
            labelInputElems.forEach(el => el.classList.remove(circulationClasses.circulatioLabelInput));

            const renameInputs = Array.from(document.getElementsByClassName("circulatio-c-rename"));
            renameInputs.forEach(input => input.remove());
        }

        return true;
    }
};

// Internal state
const MINIMAL_WAIT_TIME = 33; // ~30fps
let circulatioDraggedItemNode = null;
let circulatioDraggedColumnNode = null;
let IsCirculatioDrag = false;
const itemPlaceholderNode = circulatio.createItemPlaceholder();
const columnPlaceholderNode = circulatio.createColumnPlaceholder();
let avoidDragOverFunction = false;

document.addEventListener("dragstart", (event) => {
    if (!circulatio.allowMoveItems) return;

    circulatioDraggedItemNode = null;
    circulatioDraggedColumnNode = null;

    const itemElem = event.target.closest(".circulatio-i");
    if (itemElem) {
        IsCirculatioDrag = true;
        circulatioDraggedItemNode = itemElem;
        itemPlaceholderNode.style.height = `${itemElem.clientHeight}px`;

        setTimeout(() => {
            circulatioDraggedItemNode.style.display = "none";
        }, MINIMAL_WAIT_TIME);
        return;
    }

    const columnElem = event.target.closest(".circulatio-c");
    if (columnElem) {
        IsCirculatioDrag = true;
        circulatioDraggedColumnNode = columnElem;
        columnPlaceholderNode.style.width = `${columnElem.clientWidth}px`;

        if (circulatioDraggedColumnNode.nextSibling) {
            circulatioDraggedColumnNode.parentNode.insertBefore(columnPlaceholderNode, circulatioDraggedColumnNode.nextSibling);
        } else {
            circulatio.moveColumn(columnPlaceholderNode, Number.MAX_SAFE_INTEGER);
        }

        setTimeout(() => {
            circulatioDraggedColumnNode.style.display = "none";
        }, MINIMAL_WAIT_TIME);
    }
});

document.addEventListener("dragend", (event) => {
    if (!IsCirculatioDrag) return;

    const finishDrag = () => {
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
    };

    // Item drop handling
    if (circulatioDraggedItemNode) {
        let columnNode = event.target.closest(".circulatio-c");
        if (!columnNode) {
            finishDrag();
            return;
        }

        const columnContent = columnNode.getElementsByClassName("circulatio-c-content")[0];
        if (!columnContent) {
            console.error("Column content div doesn't exist in this column");
            finishDrag();
            return;
        }

        if (circulatioBeforeDropItem) {
            const columnId = columnNode.dataset.columnId;
            const itemId = circulatioDraggedItemNode.dataset.itemId;

            if (!columnId || !itemId) {
                console.warn("Missing columnId or itemId, before-drop callback skipped");
                finishDrag();
                return;
            }

            // Compute placeholder position
            let position = 0;
            const parentChildren = Array.from(itemPlaceholderNode.parentNode.childNodes);
            for (let i = 0; i < parentChildren.length; i++) {
                if (parentChildren[i] === circulatioDraggedItemNode) position--;
                if (parentChildren[i] === itemPlaceholderNode) {
                    position += i;
                    break;
                }
            }

            circulatioBeforeDropItem(columnId, itemId, position)
                .then(result => {
                    if (result) {
                        itemPlaceholderNode.parentNode.insertBefore(circulatioDraggedItemNode, itemPlaceholderNode);
                        finishDrag();
                    }
                })
                .catch(err => {
                    console.error("circulatioBeforeDropItem API error", err);
                });
        } else {
            finishDrag();
        }
    }

    // Column drop handling
    if (circulatioDraggedColumnNode) {
        if (!circulatioDraggedColumnNode.dataset.columnId) {
            console.warn("Dragged column missing ID; before-drop callback skipped");
            finishDrag();
            return;
        }

        const columnId = circulatioDraggedColumnNode.dataset.columnId;

        // Compute placeholder position
        let position = 0;
        const parentChildren = Array.from(columnPlaceholderNode.parentNode.childNodes);
        for (let i = 0; i < parentChildren.length; i++) {
            const child = parentChildren[i];
            if (!child.matches?.(".circulatio-c") && !child.matches?.(".circulatio-p-c")) break;
            if (child === circulatioDraggedColumnNode) position--;
            if (child === columnPlaceholderNode) {
                position += i;
                break;
            }
        }

        if (circulatioBeforeDropColumn) {
            circulatioBeforeDropColumn(columnId, position)
                .then(result => {
                    if (result) {
                        columnPlaceholderNode.parentNode.insertBefore(circulatioDraggedColumnNode, columnPlaceholderNode);
                        finishDrag();
                    }
                })
                .catch(err => {
                    console.error("circulatioBeforeDropColumn API error", err);
                });
        } else {
            finishDrag();
        }
    }
});

document.addEventListener("dragover", (event) => {
    event.preventDefault();
    if (!IsCirculatioDrag || avoidDragOverFunction) return;

    const throttleReset = () => {
        setTimeout(() => {
            avoidDragOverFunction = false;
        }, MINIMAL_WAIT_TIME);
    };

    if (circulatioDraggedItemNode) {
        avoidDragOverFunction = true;
        throttleReset();

        let target = event.target;
        if (!target || target.nodeType !== Node.ELEMENT_NODE || target.matches(".circulatio-p-i")) return;

        let itemListNode;
        let hoveredItem = target.closest(".circulatio-i");
        if (hoveredItem) {
            itemListNode = hoveredItem.parentNode;
        } else {
            const columnNode = target.closest(".circulatio-c");
            if (!columnNode) return;
            itemListNode = columnNode.getElementsByClassName("circulatio-c-content")[0];
            hoveredItem = columnNode;
        }

        const addAbove = (hoveredItem.offsetHeight / 2) - event.layerY > 0;

        if (hoveredItem.matches(".circulatio-i")) {
            if (addAbove) {
                itemListNode.insertBefore(itemPlaceholderNode, hoveredItem);
            } else if (hoveredItem.nextSibling) {
                itemListNode.insertBefore(itemPlaceholderNode, hoveredItem.nextSibling);
            } else {
                itemListNode.appendChild(itemPlaceholderNode);
            }
        } else {
            if (addAbove) {
                itemListNode.prepend(itemPlaceholderNode);
            } else {
                itemListNode.appendChild(itemPlaceholderNode);
            }
        }
        return;
    }

    if (circulatioDraggedColumnNode) {
        avoidDragOverFunction = true;
        throttleReset();

        const target = event.target;
        if (!target || target.nodeType !== Node.ELEMENT_NODE || target.matches(".circulatio-p-c")) return;

        const columnNode = target.closest(".circulatio-c");
        if (!columnNode) return;
        const columnParent = columnNode.parentNode;

        const addAbove = (target.offsetWidth / 2) - event.layerX > 0;
        if (addAbove) {
            columnParent.insertBefore(columnPlaceholderNode, columnNode);
        } else if (columnNode.nextSibling) {
            columnParent.insertBefore(columnPlaceholderNode, columnNode.nextSibling);
        } else {
            columnParent.appendChild(columnPlaceholderNode);
        }

        if (circulatio.includeNewColumnBtn) {
            const newColumnBtn = document.getElementsByClassName("circulatio-btn-new-c")[0];
            if (newColumnBtn) {
                columnParent.appendChild(newColumnBtn);
            }
        }
        return;
    }
});

document.addEventListener("click", (event) => {
    handleCirculatioButtonClicks(event);
});

function handleCirculatioButtonClicks(event) {
    const target = event.target;

    // Column action
    if (target.matches(".circulatio-c .dropdown-option")) {
        const columnNode = target.closest(".circulatio-c");
        const columnId = columnNode?.dataset.columnId;
        const action = target.dataset.action;
        if (action && columnId && typeof circulatioColumnAction === "function") {
            circulatioColumnAction(action, columnId);
        }
        return;
    }

    // New item
    if (target.matches(".circulatio-btn-new-i")) {
        const columnNode = target.closest(".circulatio-c");
        const columnId = columnNode?.dataset.columnId;
        if (columnId && typeof circulatioNewItemBtnClick === "function") {
            circulatioNewItemBtnClick(columnId);
        }
        return;
    }

    // New column
    if (target.matches(".circulatio-btn-new-c")) {
        if (typeof circulatioNewColumnBtnClick === "function") {
            circulatioNewColumnBtnClick();
        }
        return;
    }

    // Rename affordance: disable dragging when selecting name
    if (
        target.matches(`.${circulationClasses.circulatioLabelInput} .text.circulatio-c-name`) ||
        target.matches(`.${circulationClasses.circulatioLabelInput} .input.circulatio-c-rename`)
    ) {
        const columnNode = target.closest(".circulatio-c");
        if (columnNode) columnNode.setAttribute("draggable", "false");
    } else {
        Array.from(document.getElementsByClassName("circulatio-c")).forEach(col => {
            col.setAttribute("draggable", "true");
        });
    }

    // Item click
    const itemElem = target.closest(".circulatio-i");
    if (itemElem) {
        const columnNode = target.closest(".circulatio-c");
        const columnId = columnNode?.dataset.columnId;
        const itemId = itemElem.dataset.itemId;
        if (columnId && itemId && typeof circulatioItemClick === "function") {
            circulatioItemClick(itemId, columnId);
        }
    }
}