import { LimitOrder } from "./models/LimitOrder";
import { Node } from "./models/Node";

export const resolvers = {
  Query: {
    hello: () => "hi",
    limitOrder: () => LimitOrder.find(),
    nodes: () => Node.find(),
    nodeActive: () => Node.aggregate([
      { $match: {status: true}},
      {$sample: { size: 1 }}
    ]),
    getMaster: () => Node.aggregate([
      { $match: {master: true}}
    ]),
    getlimitorder: (_, {nodeId}) => LimitOrder.where({ nodeId: nodeId })
  },
  Mutation: {
    createLimitOrder: async (_, { feeID ,
      addrName,
      sndAddrName,
      amt,
      sndAmt,
      trdAmt,
      signatue}) => {
      const nodeA = await resolvers.Query.nodeActive();
      const nodeId = nodeA[0]._id;
      console.log(nodeA,nodeId,nodeA[0]._id);
      const order = new LimitOrder({ feeID ,
        addrName,
        sndAddrName,
        amt,
        sndAmt,
        trdAmt,
        signatue, nodeId });
      await order.save();
      return order;
    },
    createNode: async (_, { address, status, master = false }) => {
      const node = new Node({ address, status, master });
      await node.save();
      return node;
    }
  }
};
