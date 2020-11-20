circulatioBeforeDropFunction = function (columnId, itemId, order) {
    console.log("User moved item(Id: " + itemId + ") to the column(Id:" + columnId + ") and it assumed the number " + order + " in the order");
    return true;
}

circulatioBeforeRemoveItem = function (itemId) {
    console.log("User has order to remove item(id: " + itemId + ")");
    return true;
}

circulatioBeforeRemoveColumn = function (columnId) {
    console.log("User has order to remove column(id: " + columnId + ") and items on it");
    return true;
}

circulatioNewColumnBtnClick = function () {
    console.log("User clicked in the new column button");
}

circulatioNewItemBtnClick = function (columnId) {
    console.log("User clicked in the new item button at the column(id: " + columnId + ")");
}

circulatioColumnAction = function (action, columnId) {
    console.log("User clicked in a column action(action: '" + action + "', columnId: " + columnId + ")");
}

circulatioItemClick = function (itemId, columnId) {
    console.log("User clicked in item(id: " + itemId + ") that is in column(id: " + columnId + ")");
}

// Example functions
loadFromJson();
function loadFromJson() {
    var json = {
        "includeNewColumnBtn": true,
        "includeNewItemBtn": true,
        "includeColumnActionDropdown": [
            { "label": "Rename", "action": "rename" },
            { "label": "Delete", "action": "delete" }
        ],
        "columns": [
            {
                "id": 1,
                "name": "To do",
                "items": [
                    {
                        "id": 1,
                        "name": "First ticket"
                    }
                ]
            },
            {
                "id": 2,
                "name": "Doing",
                "items": [
                    {
                        "id": 2,
                        "name": "Second ticket"
                    }
                ]
            },
            {
                "id": 3,
                "name": "Done",
                "items": [
                    {
                        "id": 3,
                        "name": "Third ticket"
                    }
                ]
            }
        ]
    };

    circulatio.removeAllCirculatioElements();
    circulatio.jsonToCirculatio(json)
}

var lastCirculatioItemId = 2;
function addRandomNewItem() {
    var newItemName = "Item " + Math.random().toString().substr(2);

    var newItem = circulatio.createItem(lastCirculatioItemId++, newItemName);

    // Get a random columnId, in this example we just have 3 column ids(1, 2 and 3)
    var columnId = getRandomInt(1, 3);
    circulatio.moveItem(newItem, columnId, 0);
}

// Helpers
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}