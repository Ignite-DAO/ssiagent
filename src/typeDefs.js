import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Query {
    hello: String!
    limitOrder: [LimitOrder!]!
    nodes: [Node!]
    nodeActive: [Node!]
    getMaster: [Node!]
    getlimitorder(nodeId:String!): [LimitOrder!]!
  }

  type LimitOrder {
    id: ID!
    feeID : String
    addrName: String!
    sndAddrName: String!
    amt: String!
    sndAmt: String!
    trdAmt: String!
    signatue: String!
  }

  type Node {
    id:ID!
    address: String
    status: Boolean
    master: Boolean
  }

  type Mutation {
    createLimitOrder(feeID : String!
      addrName: String!
      sndAddrName: String!
      amt: String!
      sndAmt: String!
      trdAmt: String!
      signatue: String!): LimitOrder!
      createNode(address: String!, status: Boolean, master: Boolean): Node!
  }
`;
