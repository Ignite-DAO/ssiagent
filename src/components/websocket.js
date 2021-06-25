import express from "express";
import {Zilswap} from "zilswap-sdk";
import {Network, ZIL_HASH} from "zilswap-sdk/lib/constants";
  
const {Zilliqa} = require("@zilliqa-js/zilliqa");
const {
  StatusType,
  MessageType,
} = require("@zilliqa-js/subscriptions");

let lastBlock = {}; 
  export class Websocket{
  
    zilswap;
  
    async getWebsocket() { 
      const zilliqa = new Zilliqa("https://sn.zillacracy.com/api");

      const subscriber = zilliqa.subscriptionBuilder.buildEventLogSubscriptions(
          "wss://sn.zillacracy.com/ws",
          {
          // smart contract address you want to listen on
            addresses: [
              "0xBa11eB7bCc0a02e947ACF03Cc651Bfaf19C9EC00",
            ],
          },
      );

      this.zilswap = new Zilswap(Network.MainNet);
      await this.zilswap.initialize();
      
      subscriber.emitter.on(StatusType.SUBSCRIBE_EVENT_LOG, (event, any) => {
        // if subscribe success, it will echo the subscription info
        // console.log("get SubscribeEventLog echo: ", event);
      });
    
      subscriber.emitter.on(MessageType.EVENT_LOG, async (event, any) =>{
        // do what you want with new event log
        console.log("get new event log: ", JSON.stringify(event));
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
    
             lastBlock = JSON.stringify(event);
            
    
            (async () => {
              const rates = await this.zilswap.getRatesForInput("0x0D21C1901A06aBEE40d8177F95171c8c63AbdC31", ZIL_HASH, "100000");
              console.log("rates: ", rates);
              // await zilswap.teardown();
            })();
          }
        } else {
          console.log("else: ", JSON.stringify(event));
        }
      });
    
      subscriber.emitter.on(MessageType.UNSUBSCRIBE, (event, any) => {
        // if unsubscribe success, it will echo the unsubscription info
        console.log("get unsubscribe event: ", event);
      });
    
      await subscriber.start();
    }
  

  }