const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World sakib!')
})
// b9a11
// NCDMbx3pyBJHtE4z
 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rriax4f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
  const wishCollection = client.db("b9a11").collection("wish");
  const commentCollection = client.db("b9a11").collection("comment");
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // added 
    app.post('/blogs',async(req,res)=> {
      const blogs = req.body;
      const result = await blogsCollection.insertOne(blogs)
      res.send(result)
      console.log(blogs,'jajaj');
    })
    app.get('/blogs', async(req,res)=>{
      const filter = req.query.filter;
      const search = req.query.search;
      // console.log( search);

      let query= {
        title:{$regex : search, $options: 'i'}
      }
      if(filter) query = {category : filter}
      // console.log(filter,'haha');
      const blogs = blogsCollection.find(query);
      const result = await blogs.toArray()
      res.send(result)
     })
    //  details
     app.get('/blogs/:id',async(req,res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await blogsCollection.findOne(query)
      res.send(result)
      console.log(result);
      console.log(id);
    })
    // inside the update page data by default show 
     app.get('/update/:id',async(req,res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await blogsCollection.findOne(query)
      res.send(result)
      console.log(result);
      console.log(id);
    })
    // update a blogs
     app.put('/realUpdate/:id',async(req,res)=> {
       const update = req.body;
       const id = req.params.id;
       const query = {_id : new ObjectId(id)}
       const options = {upsert: true}
       const newUp = {
        $set:{
          ...update,
        }
       }
       const result = await blogsCollection.updateOne(query, newUp, options)
       res.send(result)

       console.log('id',id);
       console.log('update',update);
    })
    // post wish
    app.post('/wish',async(req,res)=> {
      const wish = req.body;
      const result = await wishCollection.insertOne(wish)
      res.send(result)
      console.log(wish,'jajaj');
    })
  //  get wish
  app.get('/wish/:email', async(req,res)=>{
    const email = req.params.email;
    const query = {userEmail : email}
   const wish =  wishCollection.find(query)
   const result = await wish.toArray()
   console.log(result);
   res.send(result)
  })
// delete from wishlist
  app.delete('/delete/:id',async(req,res)=>{
    const id = req.params.id;
    const query = {_id : new ObjectId(id)}
    const result = await wishCollection.deleteOne(query)
    res.send(result)
    console.log(id);
    console.log(result);
  })
// comment in the details page 
app.post('/comment',async(req,res)=> {
  const comment = req.body;
  const result = await commentCollection.insertOne(comment)
  res.send(result)
  console.log(comment);
})
// get comment 
app.get('/comment/:id', async(req,res)=>{
   const id = req.params.id;
   const query = {blogid:id}
   const comment =  commentCollection.find(query)
   const result = await comment.toArray();
   res.send(result)
   console.log(result);
   console.log(result);
   console.log(id,'client');
})
app.get('/featured',async(req,res)=>{
  try {
    const aggregationPipeline = [
      {
        $addFields: {
          longDescriptionLength: { $strLenCP: "$longDescription" } 
        }
      },
      {
        $sort: { longDescriptionLength: -1 }  
      },
      {
        $limit: 10  
      }
    ];
    // Execute the aggregation pipeline
    const featuredBlogs = await blogsCollection.aggregate(aggregationPipeline).toArray();

    res.send(featuredBlogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
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