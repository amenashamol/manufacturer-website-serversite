const express = require('express')
const cors=require('cors')
const jwt=require('jsonwebtoken')
const { MongoClient, ServerApiVersion,  ObjectId } = require('mongodb');

require('dotenv').config()
const app = express()
const port= process.env.PORT || 4000



//middlewire
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xlf3n.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
  try{
     
      await client.connect()
          const userCollection = client.db("manufacturer-company").collection("users");
          const loginCollection = client.db("manufacturer-company").collection("loginusers");
          
      // get api to read all inventory
    //   app.get('/alluser',async(req,res)=>{
    //     const query={}
    //     const  cursor= userCollection.find(query)
    //     const users= await cursor.toArray()
    //    res.send(users) 
    // })

    

//   app.get('/loginuser/:email',async(req,res)=>{
//     const email=req.query.email
//     const query={email:email}
//     const  cursor= loginCollection.find(query)
//     const users= await cursor.toArray()
//    res.send(users) 
// })
      
      app.get('/loginuser',async(req,res)=>{
          const email=req.query.email
          const query={email:email}
          const  cursor= loginCollection.find(query)
          const users= await cursor.toArray()
         res.send(users) 
      }) 

      app.put('/logeduser/:email',async(req,res)=>{
        const email=req.params.email
        const user=req.body
        const filter ={email:email}
        
        const options={upsert:true}
        const updateDoc={
            $set: user,
        }
        const result = await loginCollection.updateOne(filter,updateDoc,options)
        const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
       res.send({result,token}) 
    })

      
      
      //create inventory item

      // app.post('/user',async(req,res)=>{
      //     const data =req.body
      //     const result=await userCollection.insertOne(data)
      //     res.send(result)

      // })

       //admin role
    //    app.put('/loginuser/admin/:email',async(req,res)=>{
    //     const email=req.params.email
    //     const data=req.body
    //     const filter ={email:email}
    //     const updateDoc={
    //         $set:{role:'admin'}
    //     }
    //     const result = await loginCollection.updateOne(filter,updateDoc)
    //    res.send(result) 
    // })

    // app.get('/admin/:email', async(req, res) =>{
    //       const email = req.params.email;
    //       const user = await userCollection.findOne({email: email});
    //       const isAdmin = user.role === 'admin';
    //       res.send({admin: isAdmin})
    //     })
        
      //udate user

      app.get('/loginuser/:id',async(req,res)=>{
        const id=req.params.id 
        const query={_id:ObjectId(id)}
        const result=await loginCollection.findOne(query)
       res.send(result) 
    })
    
      app.put('/loginuser/:id',async(req,res)=>{
        const id=req.params.id 
        const data=req.body
        const filter ={_id:ObjectId(id)}
        
        const options={upsert:true}
        const updateDoc={
            $set: {
              ...data
            }
            
        }
        const result = await loginCollection.updateOne(filter,updateDoc,options)
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