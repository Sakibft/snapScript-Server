const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors({
  origin:[
    'http://localhost:5173', // Replace this with your frontend origin
  ], 
  credentials: true // Enable credentials
}));
app.use(express.json())
app.use(cookieParser())
// create middleware
const verifyToken = (req,res,next) => {
  const token = req?.cookies?.token;
  if(!token){
    return res.status(401).send({message: 'unauthorized access'})
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(error,decoded) =>{
    if(error){
      return res.status(401).send({message: 'unauthorized access'})
    }
    req.user = decoded;
    next()
  })
// console.log(token, 'inside the verifytoken');
}

app.get('/', (req, res) => {
  res.send('Hello World sakib!')
})
 
 

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
    // auth related apo
    app.post('/jwt', async(req,res)=> {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn:'1h'})
      res
      .cookie('token', token , {
        httpOnly:true,
        secure:true,
        sameSite:'none'
      })
      .send({success:true});
    })

    app.post('/logout',async(req,res)=>{
      const user = req.body;
      console.log('logging out', user);
      res.clearCookie('token', {maxAge:0}).send({success:true})
    })
 

//  all blogs 
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
  app.get('/wish/:email', verifyToken, async(req,res)=>{
    const email = req.params.email;
    if(req.user.email !== email){
      return res.status(403).send({message: 'forbidden access'})
    }
    //  console.log(req.user,'it is veryFied');
    const query = {userEmail : email}
   const wish =  wishCollection.find(query)
   const result = await wish.toArray()
   console.log(result);
  //  console.log(req.cookies, "from wishlist");
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