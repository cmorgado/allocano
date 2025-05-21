import { Address, applyDoubleCborEncoding, applyParamsToScript, Assets, Data, Emulator, fromText, LucidEvolution, MintingPolicy, mintingPolicyToId, PolicyId, Redeemer, SpendingValidator, Unit, validatorToAddress, Lucid, fromUnit, toText, UTxO, getAddressDetails } from '@lucid-evolution/lucid';
import * as u from "./utils";
import * as env from "./env/laceTreasury"
export async function mintAllocation(adminAddress: Address, allocationHash: string,
    lucid: LucidEvolution) {

    console.log("start create admin");
    console.log("allocanoPolicyId", u.allocanoPolicyId);
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
        customerAllocanoPhk: fromText(phk),
        allocation_hash: fromText(allocationHash)
    };
    const txDatum: Redeemer = Data.to<u.AllocanoDatum>(mintDatum, u.AllocanoDatum);

    const va: UTxO[] = await lucid.utxosAtWithUnit(adminAddress, u.unitAllocano)

    const tx = await lucid
        .newTx()
        .readFrom(va)
        .mintAssets(adminAsset, txRedeemer)
        .attach.MintingPolicy(u.allocanoMintingScript)
        .pay.ToAddress(env.laceTreasuryAddress, { lovelace: 2_000_000n })
        .pay.ToAddressWithData(u.allocanoAddress, { kind: "inline", value: txDatum })
        .addSigner(adminAddress)
        .complete();

    const signedTx = await tx.sign.withWallet().complete();
    console.log("signed");
    const txHash = await signedTx.submit();
    console.log("buy with referral tid: " + txHash);

}