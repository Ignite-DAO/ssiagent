require('dotenv').config();
import {
    ApolloClient,
    InMemoryCache,
    gql,
    HttpLink
  } from "@apollo/client";
  
  //console.log(process.env.PUBLIC_IP);
  //console.log(process.env.PUBLIC_PORT);
  //global.NodeIp = process.env.PUBLIC_IP;
  //global.NodePort = process.env.PUBLIC_PORT;
  
  export class RegisterNode{
    async register() { 
      // create check if node excist on DB  
      console.log(process.env.PUBLIC_IP);
        
      return("register node on DB");
    }
  
  }