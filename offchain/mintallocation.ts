import { Address, Assets, Data, fromText, LucidEvolution, Redeemer, Unit, UTxO, getAddressDetails } from '@lucid-evolution/lucid';
import * as u from "./utils";
import * as env from "./env/laceTreasury"
export async function mintAllocation(adminAddress: Address, allocationHash: string,
    lucid: LucidEvolution) {

    console.log("start mint allocation "+adminAddress+" -----------------");
 
    const unitAllocano: Unit = u.allocanoPolicyId + fromText(allocationHash);

    const adminAsset: Assets = {

        [unitAllocano]: 1n,

    }
    const mintRedeemer: u.AllocanoRedeemer = {
        action: 2n,
        allocation_hash: fromText(allocationHash)
    };
    const txRedeemer: Redeemer = Data.to<u.AllocanoRedeemer>(mintRedeemer, u.AllocanoRedeemer);
    let phk: string = getAddressDetails(adminAddress)?.paymentCredential?.hash || "";

    const mintDatum: u.AllocanoDatum = {
        customerAllocanoPhk: phk,
        allocation_hash: fromText(allocationHash)
    };
    const txDatum: Redeemer = Data.to<u.AllocanoDatum>(mintDatum, u.AllocanoDatum);

    const va: UTxO[] = await lucid.utxosAt(adminAddress)//, u.unitAllocano)
 
    const tx = await lucid
        .newTx()
        .readFrom(va)
        .mintAssets(adminAsset, txRedeemer)
        .attach.MintingPolicy(u.allocanoMintingScript)
        .pay.ToAddress(env.laceTreasuryAddress, { lovelace: 2_000_000n })
        .pay.ToAddressWithData(u.allocanoAddress, { kind: "inline", value: txDatum }, adminAsset)
        .addSigner(adminAddress)
        .complete();

    const signedTx = await tx.sign.withWallet().complete();
  
    const txHash = await signedTx.submit();
    console.log("mint tid: " + txHash);

}