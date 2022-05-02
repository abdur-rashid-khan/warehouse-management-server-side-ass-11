const express = require("express");
require('dotenv').config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());


// auth
// function verifyJWT(req , res , next){
//   const authHeader = req.headers.authorization;
//   if(!authHeader){
//     return res.status(401).send({message:'unauthorized'});
//   }
//   const token = authHeader.split(' ')[1];
//   jwt.verify(token,process.env.ACCESS_TOKEN,(error , decode)=>{
//     if(error){
//       return res.status(403).send({message:'Forbidden access'})
//     }
//     req.decode = decode;
//     next();
//   })
  
// }

app.get('/', (req, res) => {
  res.send('DB connected')
})
// Replace the uri string with your MongoDB deployment's connection string.
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lqf9l.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const productsCollection = client.db('shopin').collection('products');
    const deliveryCollection = client.db('shopin').collection('delivery');
    app.get('/products', async(req , res) => {
      const query = {};
      const cursor =  productsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    });
    // get single products 
    app.get('/products/:id',async(req , res )=>{
      const id = req.params.id;
      const query = {_id:ObjectId(id)}
      const result = await productsCollection.findOne(query);
      res.send(result)
    })
    // added new post
    app.post('/products',async(req , res) => {
      const data = req.body;
      const result = await productsCollection.insertOne(data);
      res.send(result);
    })
    // delete items 
    app.delete('/products/:id',async(req , res) => {
      const id = req.params.id;
      const query = {_id:ObjectId(id)};
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });
    // for update 
    app.put('/products/:id',async(req,res )=>{
      const id =req.params.id;
      const user = req.body;
      const query = {_id:ObjectId(id)};
      const options = { upsert: true };
      const update = {
        $set:user
      }
      const result = await productsCollection.updateOne(query,update,options);
      res.send(result);
    });
    // for order
    app.post('/delivery', async(req,res)=>{
      const delivery = req.body;
      const cursor = await deliveryCollection.insertOne(delivery);
      res.send(cursor);
    });
    app.get('/delivery', async(req , res)=>{
      const email = req.query.email;
      // const authHeader = req.headers.authorization;
      const query = {email};
      console.log(query);
      const cursor = deliveryCollection.find(query);
      const delivery = await cursor.toArray();
      res.send(delivery)
    })
    app.post('/login',(req , res) =>{
      const user = req.body;
      const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN,{
        expiresIn:'1d'
      });
      res.send(accessToken);
    });
    // 
    
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`localhost ${port}`) 
})

