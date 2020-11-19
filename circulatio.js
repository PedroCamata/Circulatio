'use strict'

// Config variables
var circulatioAfterDropFunction;

const circulatioElements = {
    createPlaceholder: function() {
        var elem = document.createElement("div")
        elem.innerHTML = "Temporary Placeholder";
        elem.classList.add("circulatio-p");
        return elem;
    },
}

// Circulatio variables
var circulatioDraggedItemNode = null;
var IsCirculatioDrag = false;
var placeholderNode = circulatioElements.createPlaceholder();

document.addEventListener("dragstart", function (event) {
    var elem = event.target.closest(".circulatio-i");
    if (!elem.matches(".circulatio-i")) {
        // User isn't dragging a circulation item
        IsCirculatioDrag = false;
        return;
    }

    IsCirculatioDrag = true;
    circulatioDraggedItemNode = event.target;
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
        placeholderNode.remove();
        return;
    }

    var columnContentNode = columnNode.getElementsByClassName("circulatio-c-content")[0];

    if (!columnContentNode) {
        console.error("Column content div doesn't exist in this column");
        placeholderNode.remove();
        return;
    }

    if (circulatioAfterDropFunction) {
        var columnId = columnNode.dataset.columnId;
        var itemId = circulatioDraggedItemNode.dataset.itemId;

        if (!columnId) {
            console.warn("Circulation column doesn't have an Id, after drop function can't be executed");
            placeholderNode.remove();
            return;
        }

        if (!itemId) {
            console.warn("Circulation item doesn't have an Id, after drop function can't be executed");
            placeholderNode.remove();
            return;
        }

        circulatioAfterDropFunction(columnId, itemId);
    }

    // Delete placeholder
    placeholderNode.parentNode.insertBefore(circulatioDraggedItemNode, placeholderNode);

    placeholderNode.remove();
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
        }, 33);

        var targetElem = event.target;

        if(targetElem.matches(".circulatio-p")) {
            return;
        }

        targetElem = targetElem.closest(".circulatio-i");

        if(!targetElem) {
            var columnNode = event.target.closest(".circulatio-c");
            if(columnNode) {
                columnNode.getElementsByClassName("circulatio-c-content")[0].prepend(placeholderNode);
            }

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
        //  else {
        //     // In case user mouse is over collumn name or other collumn 
        //     targetElem.parentNode.appendChild(placeholderNode);
        // }
    }
});

function circulatioBoardToJSON($circulatioId) {
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
