import mongoose from "mongoose";

export const LimitOrder = mongoose.model("LimitOrder", { feeID : String,
    addrName: String,
    sndAddrName: String,
    amt: String,
    sndAmt: String,
    trdAmt: String,
    signatue: String,
    nodeId : mongoose.ObjectId
} );
