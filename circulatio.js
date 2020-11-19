'use strict'

// Config variables
var circulatioAfterDropFunction;

var circulatio = {
    createPlaceholder: function() {
        var elem = document.createElement("div");
        elem.classList.add("circulatio-p");
        elem.innerHTML = "Temporary Placeholder";
        return elem;
    },
    createItem: function(itemId, name) {
        var elem = document.createElement("div");
        elem.classList.add("circulatio-i");
        elem.dataset.itemId = itemId;
        elem.setAttribute("draggable", true);
        elem.innerHTML = "<div class='circulatio-i-name'>" + name + "</div>"
        return elem;
    },
    moveItemToColumn: function(itemNode, columnId, order) {
        if(!itemNode || itemNode.nodeType !== Node.ELEMENT_NODE) {
            console.error("itemNode isn't a node element");
            return false;
        }
        
        var columnNode = circulatio.getColumnContentNodeByColumnId(columnId);
        if(!columnNode || itemNode.nodeType !== Node.ELEMENT_NODE) {
            console.error("Column with columnId(" + columnId + ") not found");
            return false;
        }

        var qtyColumnItems = columnNode.childElementCount;
        if(qtyColumnItems > 0 && qtyColumnItems > order) {
            var childNode = columnNode.children[order];
            columnNode.insertBefore(itemNode, childNode);
        } else {
            columnNode.appendChild(itemNode);
        }

        return true;
    },
    getColumnContentNodeByColumnId: function(columnId) {
        var columns = document.getElementsByClassName("circulatio-c");
        for (let i = 0; i < columns.length; i++) {
            if(columns[i].dataset.columnId == columnId) {
                return columns[i].getElementsByClassName("circulatio-c-content")[0];
            }
        }
        return null;
    },
    getItemNodeByItemId: function(itemId) {
        var items = document.getElementsByClassName("circulatio-i");
        for (let i = 0; i < items.length; i++) {
            if(items[i].dataset.itemId == itemId) {
                return items[i];
            }
        }
        return null;
    },
    circulatioToJSON: function($circulatioId) {
        var circulatioNode = document.getElementById($circulatioId);
        var columnNodes = circulatioNode.getElementsByClassName("circulatio-c");
    
        var circulatioData = {
            columns: [],
            columnAction: []
        }
    
        for (var i = 0; i < columnNodes.length; i++) {
            var columnId = columnNodes[i].dataset.columnId;
            var columnName = columnNodes[i].getElementsByClassName("circulatio-c-name")[0].innerHTML;
    
            var columnItems = columnNodes[i].getElementsByClassName("circulatio-i");
            var columnItemsData = [];
    
            for (var j = 0; j < columnItems.length; j++) {
                var itemId = columnItems[j].dataset.itemId;
                var itemName = columnItems[j].getElementsByClassName("circulatio-i-name")[0].innerHTML;
    
                var newItem = {
                    "id": itemId,
                    "name": itemName
                };
    
                columnItemsData.push(newItem);
            }
    
            var columnData = {
                "id": columnId,
                "name": columnName,
                "items": columnItemsData
            }
    
            circulatioData.columns.push(columnData);
        }
    
        return circulatioData;
    }
};

// Circulatio variables
const MINIMAL_WAIT_TIME = 33;
var circulatioDraggedItemNode = null;
var IsCirculatioDrag = false;
var placeholderNode = circulatio.createPlaceholder();

document.addEventListener("dragstart", function (event) {
    var elem = event.target.closest(".circulatio-i");
    if (!elem.matches(".circulatio-i")) {
        // User isn't dragging a circulation item
        IsCirculatioDrag = false;
        return;
    }

    IsCirculatioDrag = true;
    circulatioDraggedItemNode = event.target;
    
    setTimeout(() => {
        circulatioDraggedItemNode.style.display = "none";
    }, MINIMAL_WAIT_TIME);
});

document.addEventListener("drop", function (event) {
    if (!IsCirculatioDrag) {
        return;
    }

    var columnNode;
    var elem = event.target;

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

    var columnContentNode = columnNode.getElementsByClassName("circulatio-c-content")[0];

    if (!columnContentNode) {
        console.error("Column content div doesn't exist in this column");
        dropFinish();
        return;
    }

    if (circulatioAfterDropFunction) {
        var columnId = columnNode.dataset.columnId;
        var itemId = circulatioDraggedItemNode.dataset.itemId;

        if (!columnId) {
            console.warn("Circulation column doesn't have an Id, after drop function can't be executed");
            dropFinish();
        }

        if (!itemId) {
            console.warn("Circulation item doesn't have an Id, after drop function can't be executed");
            dropFinish();
        }

        circulatioAfterDropFunction(columnId, itemId);
    }

    // Move element to the placeholder position
    placeholderNode.parentNode.insertBefore(circulatioDraggedItemNode, placeholderNode);

    dropFinish();

    function dropFinish() {
        circulatioDraggedItemNode.style.display = null;
        placeholderNode.remove();
    }
});

// Maximum 30 frames per second
var avoidDragOverFunction = false;
document.addEventListener("dragover", function (event) {
    event.preventDefault();

    if(avoidDragOverFunction) {
        return;
    }

    if(IsCirculatioDrag) {
        avoidDragOverFunction = true;
        setTimeout(() => {
            avoidDragOverFunction = false;
        }, MINIMAL_WAIT_TIME);

        var targetElem = event.target;

        if(!targetElem || targetElem.nodeType != Node.ELEMENT_NODE) {
            placeholderNode.remove();
            return;
        }

        if(targetElem.matches(".circulatio-p")) {
            return;
        }

        targetElem = targetElem.closest(".circulatio-i");

        if(!targetElem) {
            var columnNode = event.target.closest(".circulatio-c");
            if(columnNode) {
                columnNode.getElementsByClassName("circulatio-c-content")[0].prepend(placeholderNode);
                return;
            }

            placeholderNode.remove();
            return;
        }

        var addPlaceholderAboveTargetElement = (targetElem.offsetHeight/2) - event.layerY > 0;

        var closestCirculatioItemNode = targetElem.closest(".circulatio-i");
        if(addPlaceholderAboveTargetElement) {
            // Insert on the top of the target
            targetElem.parentNode.insertBefore(placeholderNode, closestCirculatioItemNode);

        } else if(closestCirculatioItemNode.nextSibling) {
            // Insert on the bottom of the target
            targetElem.parentNode.insertBefore(placeholderNode, closestCirculatioItemNode.nextSibling);
            
        }
    }
});


