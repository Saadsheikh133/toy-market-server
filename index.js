const express = require('express');
const cors = require('cors');
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vuuhbip.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
       client.connect();
      
    const toyCollection = client.db('toyDB').collection('toys');

    const indexKeys = { toyName: 1 };
    const indexOptions = { name: 'toyName' };
    const result = await toyCollection.createIndex(indexKeys, indexOptions);

    app.get('/searchByToyName/:text', async(req, res) => {
      try {
        const searchText = req.params.text;
        const result = await toyCollection
          .find({ toyName: { $regex: searchText, $options: "i" } })
          .toArray();
        res.send(result);
      } catch (error) {
        res.send(error)
      }
    })

    app.get('/toys', async (req, res) => {
      try {
        let query = {};
        if (req.query?.sub_category) {
          query = { sub_category: req.query.sub_category };
        }
        const result = await toyCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        res.send(error)
      }
    })
    
    app.get('/toys/:id', async(req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await toyCollection.findOne(filter);
        res.send(result);
      } catch (error) {
        res.send(error)
      }
    })

    app.post('/createToys', async(req, res) => {
      try {
        const body = req.body;
        const result = await toyCollection.insertOne(body);
        res.send(result);
      } catch (error) {
        res.send(error)
      }
    })

    app.get("/allToys", async (req, res) => {
     try {
       let query = {};
       if (req.query?.email) {
         query = { sellerEmail: req.query.email };
       }
       const result = await toyCollection.find(query).limit(20).toArray();
       res.send(result);
     } catch (error) {
      res.send(error)
     }
    });

    app.get('/allToys/:id', async(req, res) => {
     try {
       const id = req.params.id;
       const filter = { _id: new ObjectId(id) };
       const result = await toyCollection.findOne(filter);
       res.send(result);
     } catch (error) {
      res.send(error)
     }
    })

    app.get('/allToys/:text', async (req, res) => {
      if (req.params.text == "ascending" || req.params.text == "descending") {
        const result = await toyCollection.find({ price: req.params.text }).sort({ createAt: 1 }).toArray();
        return res.send(result);
      }

      const result = await toyCollection.find({}).sort({ createAt: -1 }).toArray();
      res.send(result)
    })

    app.put("/addToys/:id", async (req, res) => {
     try {
       const id = req.params.id;
       const body = req.body;
       const filter = { _id: new ObjectId(id) };
       const options = { upsert: true };
       const updateToy = {
         $set: {
           price: body.price,
           quantity: body.quantity,
           details: body.details,
         },
       };
       const result = await toyCollection.updateOne(filter, updateToy, options);
       res.send(result);
     } catch (error) {
      res.send(error)
     }
    });

    app.delete('/addToys/:id', async(req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await toyCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        res.send(error)
      }
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Toy collections is running!!')
})

app.listen(port, (req, res) => {
    console.log(`Toy is running on port: ${port}`)
})