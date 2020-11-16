'use strict'

var fieldBeingEditted = null;
var draggedItemId = null
var draggedItemNode = null;

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    draggedItemNode = ev.target;
    draggedItemId = draggedItemNode.dataset.itemId;
    console.log("drag: " + draggedItemId);
}

function drop(ev) {
    var columnNode;

    var elem = ev.target

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

    columnContentNode.appendChild(draggedItemNode)
    ev.preventDefault();
}

document.addEventListener('click', function (event) {
    if (event.target.matches('.circulatio-i')) {
        console.log("you clicked in a item");
    }
});