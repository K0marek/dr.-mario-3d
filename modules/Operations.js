module.exports = {

    //WSTAWIANIE DO KOLEKCJI
    Insert: function(collection, data, callback) {
        collection.insert(data, function(err, result) {
            if(err)
                callback("NOT_CREATED")
            else
                callback("CREATED")
        })
    },

    //ZWRÓCENIE WSZYSTKICH DOKUMENTÓW DANEJ KOLEKCJI
    SelectAll: function(collection, callback) {
        collection.find({}).toArray(function(err, items) {
            let obj
            if(err)
                obj = {action: "NOT_SELECTED"}
            else {
                obj = {
                    items: items,
                    action: "SELECTED"
                }
            }
            callback(obj)
        })
    },

    //AKTUALIZACJA WYBRANEGO DOKUMENTU
    UpdateById: function(ObjectID, collection, data, callback) {
        let id = data._id
        delete data._id
        collection.updateOne(
            {_id: ObjectID(id)},
            data,
            function(err, data) {
                if(err)
                    callback("NOT_UPDATED")
                else
                    callback("UPDATED")
            })
    },

    //USUNIĘCIE POPRZEZ ID
    DeleteById: function(collection, callback) {
        collection.remove({}, function(err, data) {
            if(err)
                callback("NOT_DELETED")
            else
                callback("DELETED")
        })
    },

    AddColl: function (db, coll, callback) {
        db.createCollection(coll, function (err, res) {
            if (err) console.log(err)
            else callback({ connected: true })
        })
    },

}