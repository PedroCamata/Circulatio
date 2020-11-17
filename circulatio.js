'use strict'

var circulatioDraggedItemNode = null;
var IsCirculatioDrag = false;

// Config variables
var circulatioAfterDropFunction;

document.addEventListener("dragstart", function (event) {
    var elem = event.target;
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
    var elem = event.target

    if (elem.matches(".circulation-c")) {
        columnNode = elem;
    } else {
        columnNode = elem.closest(".circulatio-c");
    }

    if (!columnNode) {
        // User didn't drop it to a circulatio column
        return;
    }

    var columnContentNode = columnNode.getElementsByClassName("circulation-c-content")[0];

    if (!columnContentNode) {
        console.error("Column content div doesn't exist in this column");
        return;
    }

    if (circulatioAfterDropFunction) {
        var columnId = columnNode.dataset.columnId;
        var itemId = circulatioDraggedItemNode.dataset.itemId;

        if (!columnId) {
            console.warn("Circulation column doesn't have an Id, after drop function can't be executed");
            return;
        }

        if (!itemId) {
            console.warn("Circulation item doesn't have an Id, after drop function can't be executed");
            return;
        }

        circulatioAfterDropFunction(columnId, itemId);
    }

    columnContentNode.appendChild(circulatioDraggedItemNode)
});

document.addEventListener("dragover", function (event) {
    event.preventDefault();
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

