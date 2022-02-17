"use strict";

circulatioBeforeDropItem = (columnId, itemId, order) => {
    // Return a promise here
    console.log("User moved item(Id: " + itemId + ") to the column(Id:" + columnId + ") and it assumed the number " + order + " in the order");
    return new Promise((resolve, reject) => resolve(true));
};

circulatioBeforeRemoveItem = (itemId) => {
    console.log("User has order to remove item(id: " + itemId + ")");
    return new Promise((resolve, reject) => resolve(true));
};

circulatioBeforeRemoveColumn = (columnId) => {
    console.log("User has order to remove column(id: " + columnId + ") and items on it");
    return new Promise((resolve, reject) => resolve(true));
};

circulatioNewColumnBtnClick = () => {
    console.log("User clicked in the new column button");

    let newColumn = circulatio.createColumn(Math.random().toString(), "New Column", true);
    circulatio.moveColumn(newColumn, Number.MAX_SAFE_INTEGER);
};

circulatioNewItemBtnClick = (columnId) => {
    console.log("User clicked in the new item button at the column(id: " + columnId + ")");

    // Add new item
    let newItem = circulatio.createItem(Math.random().toString().substr(2), "New ticket")
    circulatio.moveItem(newItem, columnId, -1);
};

circulatioRenameColumn = (newName, columnId) => {
    console.log("User rename in a column(columnId: " + columnId + ") to '" + newName + "'");

    return new Promise((resolve, reject) => resolve(true));
};

circulatioColumnAction = (action, columnId) => {
    console.log("User clicked in a column action(action: '" + action + "', columnId: " + columnId + ")");
};

circulatioItemClick = (itemId, columnId) => {
    console.log("User clicked in item(id: " + itemId + ") that is in column(id: " + columnId + ")");
};

// Example functions
loadFromJson();
function loadFromJson() {
    var json = {
        "includeNewColumnBtn": true,
        "includeNewItemBtn": true,
        "allowRenameColumn": true,
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