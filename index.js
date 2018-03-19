const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// Connect to MongoDB
const uri = 'mongodb://localhost:27017/test';
const mongoDB = mongoose.connect(uri);

// Create a schema
const Schema = mongoose.Schema;
const BalanceSchema = Schema({
    name: {
        type: String,
        required: true
    },
    money: {
        type: Number,
        required: true
    }
});
const TABLE = 'balances';

// Init Fawn
const Fawn = require('fawn');
Fawn.init(mongoose);

// Roll during server setup
const Roller = Fawn.Roller();
Roller.roll()
    .then(createModel)
    .then(insertDocuments)
    .then(testTransactions);

function createModel() {
    return mongoose.model(TABLE, BalanceSchema);
}

function insertDocuments(model) {
    model.create({ name: 'Vince1', money: 42 });
    model.create({ name: 'Target1', money: 10 });
}

function testTransactions() {
    let task = Fawn.Task();

    task
        .update(TABLE, { name: 'Vince1' }, { $inc: { money: -10 } })
        .update(TABLE, { name: 'Target1' }, { $inc: { money: 10 } })
        .run()
        .then(results => {
            console.log('Fawn task is complete');

            const firstUpdate = results[0];
            const secondUpdate = results[1];

            console.log(firstUpdate.result);
            console.log(secondUpdate.result);
        })
        .catch(console.error);
}
