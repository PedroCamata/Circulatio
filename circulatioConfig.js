circulatioAfterDropFunction = function (columnId, itemId) {
    console.log("User moved item(Id: " + itemId + ") to the column(Id:" + columnId + ")");
}

// Example function
var lastCirculatioItemId = 2;

function addRandomNewItem() {
    var newItemName = "Item " + Math.random().toString().substr(2);

    var newItem = circulatio.createItem(lastCirculatioItemId++, newItemName);

    // Get a random columnId, in this example we just have 3 column ids(1, 2 and 3)
    var columnId = getRandomInt(1, 3);
    circulatio.moveItemToColumn(newItem, columnId, 0);
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}