import { CustomSigningStargateClient } from "./stargate_sequence";
import { Secp256k1HdWallet } from "@cosmjs/amino";
import "dotenv/config";

const rpc_endpoints = ["http://3.134.196.244:26657/"];

let mnmonics = process.env.cosmos_key!;
const pre_fix_name = "axelar";
const token_name = "axl";
const fee = {
  amount: [{ denom: "u" + token_name, amount: "595" }],
  gas: "85000",
};
//
const value_amount_denom = "1";
const transfer_out_address = "";

send_out_tx();
async function send_out_tx() {
  let wallet = await Secp256k1HdWallet.fromMnemonic(mnmonics, {
    prefix: pre_fix_name,
  });
  let address = (await wallet.getAccounts())[0].address;
  let clients_array: CustomSigningStargateClient[] = [];
  for (let rpc_endpoint of rpc_endpoints) {
    let client = await CustomSigningStargateClient.alter_createWithSigner(
      rpc_endpoint,
      wallet
    );
    clients_array.push(client);
  }
  let sequence = (await clients_array[0].getSequence(address)).sequence;
  let transfer_msg = {
    typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: {
      fromAddress: address,
      toAddress: transfer_out_address,
      amount: [{ denom: token_name, amount: value_amount_denom }],
    },
  };
  while (true) {
    for (let client of clients_array) {
      try {
        let tx = await client.signAndBroadcastSyncWithSequence(
          address,
          [transfer_msg],
          fee,
          sequence,
          "test"
        );
        console.log(tx);
        break;
      } catch (e) {
        console.log(e);
      }
    }
  }
}
