import { Address, applyDoubleCborEncoding, applyParamsToScript, Assets, Data, Emulator, fromText, LucidEvolution, MintingPolicy, mintingPolicyToId, PolicyId, Redeemer, SpendingValidator, Unit, validatorToAddress, Lucid, fromUnit, toText, UTxO, getAddressDetails, Constr } from '@lucid-evolution/lucid';
import * as u from "./utils";
import * as env from "./env/laceTreasury"


export async function createAdmin(
    buyerAddress: Address, lucid: LucidEvolution) {

    console.log("start create admin");
    console.log("allocanoPolicyId", u.allocanoPolicyId);
 

    const createAdminRedeemer: u.AllocanoRedeemer = {
        action: 1n,
        allocation_hash: fromText("Allocano")
    };
    const adminAsset: Assets = {

        [u.unitAllocano]: 1n,

    }
    console.log("adminAsset", adminAsset);
    const txRedeemer: Redeemer = Data.to<u.AllocanoRedeemer>(createAdminRedeemer, u.AllocanoRedeemer);

    const tx = await lucid
        .newTx()
        .mintAssets(adminAsset, txRedeemer)
        .pay.ToAddress(buyerAddress, { ...adminAsset, lovelace: 20_000_000n })
        .attach.MintingPolicy(u.allocanoMintingScript)
        .addSigner(env.laceTreasuryAddress)
        .complete();

    const signedTx = await tx.sign.withWallet().complete();
    console.log("signed");
    const txHash = await signedTx.submit();
    console.log("admin token created referral tid: " + txHash);
}


