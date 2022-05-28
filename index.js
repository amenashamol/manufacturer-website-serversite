const express = require('express')
const cors=require('cors')
const { MongoClient, ServerApiVersion,  ObjectId } = require('mongodb');

require('dotenv').config()
const app = express()
const port=4000



//middlewire
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xlf3n.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
  try{
     
      await client.connect()
          const userCollection = client.db("manufacturer-company").collection("users");
          
      // get api to read all inventory 
      app.get('/user',async(req,res)=>{
          const query={}
          const  cursor= userCollection.find(query)
          const users= await cursor.toArray()
         res.send(users) 
      }) 

       app.get('/user/:id',async(req,res)=>{
          const id=req.params.id 
          const query={_id:ObjectId(id)}
          const result=await userCollection.findOne(query)
         res.send(result) 
      })
      
      //create inventory item

      app.post('/user',async(req,res)=>{
          const data =req.body
          const result=await userCollection.insertOne(data)
          res.send(result)

      })


      //udate user
      app.put('/user/:id',async(req,res)=>{
        const id=req.params.id 
        const data=req.body
        const filter ={_id:ObjectId(id)}
        
        const options={upsert:true}
        const updateDoc={
            $set:data
        }
        const result = await userCollection.updateOne(filter,updateDoc,options)
       res.send(result) 
    })
      
      
   }

   finally{

   }

}

run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})