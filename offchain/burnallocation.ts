import { Address, Assets, Data, fromText, LucidEvolution, Redeemer, Unit, UTxO } from '@lucid-evolution/lucid';
import * as u from "./utils";
import * as env from "./env/laceTreasury"
export async function allocation(adminAddress: Address, allocationHash: string,
    lucid: LucidEvolution) {

    console.log("------------------------ start create admin ------------------------");
    
    const unitAllocano: Unit = u.allocanoPolicyId + fromText(allocationHash);

    const adminAsset: Assets = {

        [unitAllocano]: -1n,

    }
    const mintRedeemer: u.AllocanoRedeemer = {
        action: 3n,
        allocation_hash: fromText(allocationHash)
    };
    const txRedeemer: Redeemer = Data.to<u.AllocanoRedeemer>(mintRedeemer, u.AllocanoRedeemer);
 

    const va: UTxO[] = await lucid.utxosAtWithUnit(adminAddress, u.unitAllocano)
    const remove: UTxO[] = await lucid.utxosAtWithUnit(u.allocanoAddress, unitAllocano)    
    const tx = await lucid
        .newTx()
        .readFrom(va)
        .collectFrom(remove, txRedeemer)
        .mintAssets(adminAsset, txRedeemer)
        .attach.MintingPolicy(u.allocanoMintingScript)
        .pay.ToAddress(env.laceTreasuryAddress, { lovelace: 2_000_000n })
        .addSigner(adminAddress)
        .complete();

    const signedTx = await tx.sign.withWallet().complete();

    const txHash = await signedTx.submit();
    console.log("burn tid: " + txHash);

}