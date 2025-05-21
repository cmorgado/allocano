import { applyDoubleCborEncoding, Data, fromText, MintingPolicy, mintingPolicyToId, networkToId, PolicyId, SpendingValidator, Unit, validatorToAddress } from "@lucid-evolution/lucid";
import allocanoContract from "./compiled/allocano.signed.plutus.json" with { type: "json" };


export const allocanoMintingScript: MintingPolicy = {
    script: applyDoubleCborEncoding(allocanoContract.cborHex),
    type: "PlutusV3"
}

export const allocanoSpendingScript: SpendingValidator = {
    script: applyDoubleCborEncoding(allocanoContract.cborHex),
    type: "PlutusV3"
}
export const allocanoPolicyId: PolicyId = mintingPolicyToId(allocanoMintingScript);
export const unitAllocano: Unit = allocanoPolicyId + fromText("Allocano AdminToken_PREV");
export const allocanoAddress = validatorToAddress("Preview", allocanoSpendingScript);

const AllocanoRedeemerShape = Data.Object({
    action: Data.Integer({ minimum: 0, maximum: 3 }),
    allocation_hash: Data.Nullable(Data.Bytes()),
});
export type AllocanoRedeemer = Data.Static<typeof AllocanoRedeemerShape>;
export const AllocanoRedeemer = AllocanoRedeemerShape as unknown as AllocanoRedeemer;


const AllocanoDatumShape = Data.Object({
    customerAllocanoPhk: Data.Bytes(),
    allocation_hash: Data.Bytes(),
});
export type AllocanoDatum = Data.Static<typeof AllocanoDatumShape>;
export const AllocanoDatum = AllocanoDatumShape as unknown as AllocanoDatum;