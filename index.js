const express = require('express');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://testdb1:Sm05e8nYrGmWrzMe@cluster0.e97ot.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    const database = client.db("testSite");
    const usersCollection = database.collection("users");
  
  //Get from Mongodb
  app.get('/users', async (req, res) =>{
    console.log('/users hitting from Browser');
    const cursor = usersCollection.find({});
    const users = await cursor.toArray();
    res.send(users);
  })

  //Post in Mongodb
  app.post('/users', async (req, res) =>{
    const newUser = req.body;
    const result = await usersCollection.insertOne(newUser);
    res.send(result);
  })

  //Delete from Mongodb
  app.delete('/users/:id', async(req, res) => {
    const id = req.params.id;
    const query = {_id: ObjectId(id)};
    const result = await usersCollection.deleteOne(query);
    console.log('Deleting user with id', result);
    res.json(result);
  })

  app.get('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const user = await usersCollection.findOne(query);
      console.log('/users/:id ', id);
      res.send(user);
  });

  //Update Api
  app.put('/users/:id', async (req, res) =>{
    const id = req.params.id;
    const updatedUser = req.body;
    const filter = {_id: ObjectId(id)};
    const options = {upsert : true};
    const updateDoc = { $set: { name: updatedUser.name, email: updatedUser.email }};
    const result = await usersCollection.updateOne(filter, updateDoc, options);
    console.log('Updating user', req.body);
    res.json(result);
  })

  

  


  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running my card server')
    console.log('Running my card server');
})

app.listen(port, () => {
    console.log('Running server on port', port);
});