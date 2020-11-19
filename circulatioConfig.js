circulatioAfterDropFunction = function (columnId, itemId, order) {
    console.log("User moved item(Id: " + itemId + ") to the column(Id:" + columnId + ") and it assumed the number " + order + " in the order");
}

// Example functions
loadFromJson();
function loadFromJson() {
    var json = {
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