const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World sakib!')
})
// b9a11
// NCDMbx3pyBJHtE4z

const uri = "mongodb+srv://b9a11:NCDMbx3pyBJHtE4z@cluster0.rriax4f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  const blogsCollection = client.db("b9a11").collection("allBlogs");
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    app.get('/blogs', async(req,res)=>{
      const blogs = blogsCollection.find();
      const result = await blogs.toArray()
      res.send(result)
     })
  


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);







app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})