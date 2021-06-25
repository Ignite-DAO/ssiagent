import {
  ApolloClient,
  InMemoryCache,
  gql,
  HttpLink
} from "@apollo/client";

import { Node } from "../models/Node";
import fetch from 'cross-fetch';

import {Zilswap} from "zilswap-sdk";
import {Network, ZIL_HASH} from "zilswap-sdk/lib/constants";

const {Zilliqa, NewEventSubscription} = require("@zilliqa-js/zilliqa");
const {
  StatusType,
  MessageType,
} = require("@zilliqa-js/subscriptions");

export class Agent{

  client;

  nodeType = "node";
  DB_PASS;
  DB_URI;
  DB_USER;
  api_key

  websocket;
  zilliqa;
  subscriber = undefined;
  // development only
  zilswap;

  constructor() {
    this.zilliqa = new Zilliqa("https://sn.zillacracy.com/api");

    this.DB_PASS = process.env.DB_PASS;
    this.DB_URI = process.env.DB_URI;
    this.DB_USER = process.env.DB_USER;
    this.api_key = process.env.POOL_API_KEY;
  }

  async start(){
    this.client = new ApolloClient({
        link: new HttpLink({ uri: 'http://localhost:4000/graphql', fetch }),
        cache: new InMemoryCache()
    });

    await this.getWebsocket();

    //this.subscriber.options.addresses.push("0xBa11eB7bCc0a02e947ACF03Cc651Bfaf19C9EC01");
  }

  async getWebsocket() {

    try {
      this.subscriber = await this.zilliqa.subscriptionBuilder.buildEventLogSubscriptions(
          "wss://sn.zillacracy.com/ws",
          {
          // smart contract address you want to listen on
            addresses: [
              "0xBa11eB7bCc0a02e947ACF03Cc651Bfaf19C9EC00",
            ],
          },
      );
    } catch (error) {
      console.error(error);
    }

    this.zilswap = new Zilswap(Network.MainNet);
    await this.zilswap.initialize();
    
    this.subscriber.emitter.on(StatusType.SUBSCRIBE_EVENT_LOG, (event, any) => {
      // if subscribe success, it will echo the subscription info
      // console.log("get SubscribeEventLog echo: ", event);
    });
  
    this.subscriber.emitter.on(MessageType.EVENT_LOG, async (event, any) =>{
      try {
        // do what you want with new event log
        //console.log("get new event log: ", JSON.stringify(event));
        if (typeof event.value !== "undefined" && event.value.length > 0) {
          const value = event.value[0];
          if (typeof value["event_logs"] !== "undefined" &&
            value["event_logs"].length > 0 &&
            typeof value["event_logs"][0]["_eventname"] !== "undefined" &&
            value["event_logs"][0]["_eventname"] == "Swapped") {
            const eventLogs = value["event_logs"][0];
            console.log("get swapped: ", eventLogs["_eventname"]);
            console.log("input: ", eventLogs["params"][2]["value"]["arguments"][1]);
            console.log("inputType: ", eventLogs["params"][2]["value"]["arguments"][0]["constructor"]);
            // let tokenInID = value["event_logs"][0]["params"][1]["value"];
    
            console.log("output: ", eventLogs["params"][3]["value"]["arguments"][1]);
            console.log("outputType: ", eventLogs["params"][3]["value"]["arguments"][0]["constructor"]);
            // let tokenOutID = value["event_logs"][0]["params"][0]["value"];
    
            console.log("pool: ", value["event_logs"][0]["params"][0]["value"]);
    
            // const smartContractInit = await zilliqa.blockchain.getSmartContractInit(eventLogs["params"][0]["value"]);
            // console.log(smartContractInit.result);
    
            (async () => {
              const rates = await this.zilswap.getRatesForInput("0x0D21C1901A06aBEE40d8177F95171c8c63AbdC31", ZIL_HASH, "100000");
              console.log("rates: ", rates);
              // await zilswap.teardown();
            })();
          }
        } else {
          console.log("else: ", JSON.stringify(event));
        }
          
      } catch (error){
        console.error(error,'Promise error EVENT_LOG');
      };
    });
  
    try {
      this.subscriber.emitter.on(MessageType.UNSUBSCRIBE, (event, any) => {
        // if unsubscribe success, it will echo the unsubscription info
        console.log("get unsubscribe event: ", event);
      })
    } catch (error) {
      console.error(error,'Promise error UNSUBSCRIBE');
    };
  
    await this.subscriber.start();
  }

  async getMaster() {
    console.log("getMaster");
    return await this.client.query({
        query: gql`
        query{
          getMaster {
            address
            }
          }
        `,
        fetchPolicy: "no-cache"
      }).then(result => {
        if(result.data && result.data.getMaster && result.data.getMaster.length>0 ){
          // yes : return master
          if(result.data,result.data.getMaster.length == 1)
          {
            return "{ master : '" + result.data.getMaster[0].address+"' }"
          }else{
            //return "{ msg : 'to many masters in this pool'}";
            return this.fixMasters();
          }
        }else{
          //return "{ msg : 'no master in this pool'}";
          return this.choiceMaster();
        }
      })
  }

  async fixMasters(){
    console.log("fixMasters");
    // remove master 1 master that is to many
    let node = await Node.findOneAndUpdate( {master : true, status : true}, {master:false}, {new : true , sort: { _id: -1 } });
    console.log("Master status removed from "+node.address);

    // signal removed master that he is a node now
    const response = await fetch("http://"+node.address+"/type", {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ type : 'node' })
    });
    // todo : what if old extra master doesn't respond?
    //return "{msg : 'Master status removed from "+node.address+"' }";
   
    return await this.getMaster();
  }

  async choiceMaster(){
    console.log("choiceMaster");
    // choice a master from the list of active nodes.
    let node = await Node.findOneAndUpdate( {master : false, status : true}, {master:true}, {new : true , sort: { _id: 1 } });

    // signal node that he is now master
    const response = await fetch("http://"+node.address+"/type", {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ type : 'master' })
    });
    // todo : what if node doesn't react or doesn't want to be master?

    return await this.getMaster();
  }

  async register(PUBLIC_IP, PUBLIC_PORT, Pool = '', api_key = ''){
    if(Pool !== '' && api_key !== '')
    {
      const response = await fetch(Pool+"/register", {
      //  const response = await fetch("http://localhost:4000/register", {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ api_key : api_key, ip : PUBLIC_IP, port : PUBLIC_PORT })
      }).then(res => res.text())
      .then(data => {
        this.DB_PASS = data.db;
        this.DB_URI = data.uri;
        this.DB_USER = data.user;
      }).catch(
        error => console.error("Cannot register at the pool!",error)
      );
      return;
    }
  }

  // master function for register node
  async handleRegister(data){
    // query db for api_key check
    let node = await Node.findOneAndUpdate({api_key:data.api_key},{$set:{address:data.ip+":"+data.port,status:true}},{new : true});

    if(node !== null){
      return { db : this.DB_PASS, uri: this.DB_URI, user : this.DB_USER};
    }else{
      return { msg : "Unauthorized"};
    }
  }

  async setNodeType(){
    let node = await Node.findOne({api_key:this.api_key});
    this.nodeType = node.master?"master":"node";
    return this.nodeType;
  }
}