import { Address, Assets, Data, LucidEvolution, Redeemer } from '@lucid-evolution/lucid';
import * as u from "./utils";
import * as env from "./env/laceTreasury"


export async function createAdmin(
    buyerAddress: Address, lucid: LucidEvolution) {

    console.log("start create admin");

    const createAdminRedeemer: u.AllocanoRedeemer = {
        action: 1n,
        allocation_hash: "Allocano AdminToken_PREV"
    };
    const adminAsset: Assets = {

        [u.unitAllocano]: 1n,

    }

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


