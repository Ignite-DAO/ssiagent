
import {
  ApolloClient,
  InMemoryCache,
  gql,
  HttpLink
} from "@apollo/client";

import fetch from 'cross-fetch';

var cron = require('node-cron');

var fs = require('file-system');


const client = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:4000/graphql', fetch }),
  cache: new InMemoryCache(),
});
console.log('cron jobs started');
  cron.schedule('* * * * *', () => {
    // console.log('Get Node status');
        client
          .query({
            query: gql`
            query{
              nodes {
               master
               }
             }
            `
          })
          .then(result => {
            fs.writeFile('nodeList.json', JSON.stringify(result.data) , err => {
              if (err) {
                console.error(err)
                return
              }
            })
        });

  });