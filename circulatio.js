'use strict'

var fieldBeingEditted = null;
var draggedItemId = null
var draggedItemNode = null;

document.addEventListener("dragstart", function (event) {
    draggedItemNode = event.target;
    draggedItemId = draggedItemNode.dataset.itemId;
    console.log("drag: " + draggedItemId);
});

document.addEventListener("drop", function (event) {
    var columnNode;
    var elem = event.target

    if (elem.matches('.circulation-c')) {
        columnNode = elem;
    } else {
        columnNode = elem.closest('.circulatio-c');
    }

    if (!columnNode) {
        // User didn't dragged to a column
        return;
    }

    var columnId = columnNode.dataset.columnId;
    console.log("drop: " + columnId);

    var columnContentNode = columnNode.getElementsByClassName('circulation-c-content')[0];

    if (!columnContentNode) {
        console.error("Column content div doesn't exist in this column");
        return;
    }

    columnContentNode.appendChild(draggedItemNode)
});

document.addEventListener("dragover", function (event) {
    event.preventDefault();
});

document.addEventListener('click', function (event) {
    if (event.target.matches('.circulatio-i')) {
        console.log("you clicked in a item");
    }
});