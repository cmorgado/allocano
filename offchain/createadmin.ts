import { Address, applyDoubleCborEncoding, applyParamsToScript, Assets, Data, Emulator, fromText, LucidEvolution, MintingPolicy, mintingPolicyToId, PolicyId, Redeemer, SpendingValidator, Unit, validatorToAddress, Lucid, fromUnit, toText, UTxO, getAddressDetails } from '@lucid-evolution/lucid';
import * as u from "./utils";



export async function createAdmin(treasuryAddress: Address,
    buyerAddress: Address, lucid: LucidEvolution) {

    console.log("start create admin");
    console.log("allocanoPolicyId", u.allocanoPolicyId);
    const unitAllocano: Unit = u.allocanoPolicyId + fromText("Allocarno AdminToken_PREV");

    const createAdminRedeemer:u.AllocanoRedeemer = {
        action: 1n,
        allocation_hash: fromText("Allocano AdminToken_PREV")
    };
    const adminAsset: Assets = {

        [unitAllocano]: 1n,

    }
    console.log("adminAsset", adminAsset);
    const txRedeemer: Redeemer = Data.to<u.AllocanoRedeemer>(createAdminRedeemer, u.AllocanoRedeemer);

    const tx = await lucid
        .newTx()
        .mintAssets(adminAsset, txRedeemer)
        .attach.MintingPolicy(u.allocanoMintingScript)
        .pay.ToAddress(buyerAddress, { ...adminAsset, lovelace: 2_000_000n })
        .addSigner(treasuryAddress)
        .complete();

    const signedTx = await tx.sign.withWallet().complete();
    console.log("signed");
    const txHash = await signedTx.submit();
    console.log("admin token created referral tid: " + txHash);
}

function fromAddress(treasuryAddress: string): any {
    throw new Error('Function not implemented.');
}
