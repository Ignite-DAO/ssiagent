import mongoose from "mongoose";

export const nodeSchema = mongoose.Schema({ address: String, status: Boolean, master : Boolean, api_key : String });
export const Node = mongoose.model("Node", nodeSchema );
