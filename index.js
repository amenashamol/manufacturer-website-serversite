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

 function verifyJWT(req, res, next) {
  
    const authHeader = req.headers['authorization'];
    const token =  authHeader && authHeader.split(' ')[1];
   
    if (!token) {
      return res.status(401).json({ message: 'UnAuthorized access' });
   }
   
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodeduser)=> {
      if (err) {
        return res.status(403).send({ message: 'Forbidden access' })
      }
      
      req.decodeduser = decodeduser;
      
      
      next()
     })
   
   
}

async function run(){
  try{
     
      await client.connect()
          
          const loginCollection = client.db("manufacturer-company").collection("loginusers");
          const partsCollection = client.db("manufacturer-company").collection("parts");
          const ordersCollection = client.db("manufacturer-company").collection("orders");
          
      

         
      //loginuser

      app.get('/loginuser',   async(req,res)=>{
          const email=req.query.email
          const query={email:email}
          const  cursor= loginCollection.find(query)
          const users= await cursor.toArray()
         res.send(users) 
      }) 

      app.put('/loginuser/:email',async(req,res)=>{
        const email=req.params.email
        const user=req.body
        const filter ={email:email}
        
        const options={upsert:true}
        const updateDoc={
            $set: user,
        }
        const result = await loginCollection.updateOne(filter,updateDoc,options)
        const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' })
       res.send({result,token}) 
    })

       
    //udate user

    app.get('/updateuser/:id',async(req,res)=>{
      const id=req.params.id 
      const query={_id:ObjectId(id)}
      const result=await loginCollection.findOne(query)
     res.send(result) 
  })
  
    app.put('/updateuser/:id',async(req,res)=>{
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

      
      
      

      //  admin role

      app.get('/adminuser', verifyJWT, async(req,res)=>{
        const  cursor= loginCollection.find()
        const users= await cursor.toArray()
       res.send(users) 
    })
      
       app.put('/adminuser/admin/:email', verifyJWT, async(req,res)=>{
        const email=req.params.email
        const  requester =req.decodeduser.email 
        const requesterAcount = await loginCollection.findOne({email:requester})
        if(requesterAcount.role==='admin'){
          const filter ={email:email}
          const updateDoc={
              $set:{role:'admin'}

          }
          const result = await loginCollection.updateOne(filter,updateDoc)
       res.send(result)
        }
        else{
          res.status(403).send({message:'forbidden'})
        }
         
    })

    app.get('/admin/:email', verifyJWT, async(req, res) =>{
          const email = req.params.email;
          const user = await loginCollection.findOne({email: email});
           const isAdmin = user.role === 'admin';
          
           res.send({admin: isAdmin})
        })

       //parts
      
    app.get('/parts', async(req,res)=>{
        const  cursor= partsCollection.find()
        const parts= await cursor.toArray()
        res.send(parts)
          })
 
    app.get('/part',async(req,res)=>{
        const id=req.query.id 
        const query={_id:ObjectId(id)}
        const result= await partsCollection.findOne(query)
        res.send(result) 
        })
       
        //ordersss
    app.post('/orders',async(req,res)=>{
        const data =req.body
        const result=await ordersCollection.insertOne(data)
        res.send(result)
        })

    app.get('/allorders',async(req,res)=>{
        const result=await ordersCollection.find().toArray()
        res.send(result)
      })
     
      app.get('/order',  verifyJWT, async(req,res)=>{
        const email=req.query.email
        const query={email:email}
        const  cursor= ordersCollection.find(query)
        const users= await cursor.toArray()
       res.send(users) 
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