// agent
require('dotenv').config();
import { ApolloServer } from "apollo-server-express";
import express from "express";
import mongoose from "mongoose";
import { resolvers } from "./resolvers";
import { typeDefs } from "./typeDefs";
import { Agent } from "./components/Agent";

var bodyParser = require('body-parser')
// create application/json parser
var jsonParser = bodyParser.json()

const startAgent = async () => {

  const AgentX = new Agent();

  /*
  AgentX.register(process.env.PUBLIC_IP, process.env.PUBLIC_PORT, process.env.POOL_LOCATION, process.env.POOL_API_KEY).catch((error) => {
    console.error(error,'Promise error register blank');
  });
  */

  const server = new ApolloServer({
    typeDefs,
    resolvers
  });
    
  await server.start();

  const app = express();

  // Additional middleware can be mounted at this point to run before Apollo.
  //app.use('*', jwtCheck, requireAuth, checkScope);
  
  server.applyMiddleware({ app });

  await mongoose.connect(AgentX.DB_URI, {
    "auth": { "authSource": "admin" },
    "user": AgentX.DB_USER,
    "pass": AgentX.DB_PASS,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false 
  }).catch(error => console.log(error));

  app.get('/getmaster', async (req, res) => {
    res.send(await AgentX.getMaster());
  })

  app.post('/register', jsonParser ,async (req, res) => {
    /*
    if(AgentX.nodeType!=="master"){
      res.send({msg : 'go ask pool'});
    }
    */
    let data = req.body;
    res.send(await AgentX.handleRegister(data));
  })

  app.post('/type', jsonParser , async (req, res) => {
    await AgentX.setNodeType();
    res.send({msg : "type is "+ AgentX.nodeType })
  })

  app.get('/type', jsonParser , async (req, res) => {
    await AgentX.setNodeType();
    res.send({msg : "type is "+ AgentX.nodeType })
  })

  await new Promise(resolve => app.listen({ port: process.env.PUBLIC_PORT }, resolve));
  console.log(`🚀 Agent Server ready at http://`+process.env.PUBLIC_IP+`:`+process.env.PUBLIC_PORT+`${server.graphqlPath}`);

  AgentX.start();

  AgentX.register(process.env.PUBLIC_IP, process.env.PUBLIC_PORT, process.env.POOL_LOCATION, process.env.POOL_API_KEY).catch((error) => {
    console.error(error,'Promise error register blank');
  });

  return { server, app };
};

startAgent();


require("./cron");
