import { Lucid, generateSeedPhrase, Assets, LucidEvolution, Emulator, EmulatorAccount, generatePrivateKey, Required, Address, MintingPolicy, generateEmulatorAccount, validatorToAddress, PolicyId, mintingPolicyToId, applyDoubleCborEncoding, Unit, fromText, getAddressDetails, UTxO, TxOutput, OutRef } from "@lucid-evolution/lucid";
import * as admin from "./createadmin"
import * as burn from "./burnallocation"
import * as mint from "./mintallocation"
import * as env from "./env/laceTreasury"
import * as u from "./utils"
let treasuryAccount = generateEmulatorAccount({ lovelace: 1_200_000_00n });
let accountA = generateEmulatorAccount({ ["lovelace"]: 254_5441_528n, [u.unitAllocano]: 1n });
let accountB = generateEmulatorAccount({ lovelace: 12_002_000_000n });
// export const accountC = generateEmulatorAccount({ lovelace: 12_003_000_000n });
// export const accountD = generateEmulatorAccount({ lovelace: 12_004_000_000n });
// export const accountE = generateEmulatorAccount({ lovelace: 12_005_000_000n });
// export const accountF = generateEmulatorAccount({ lovelace: 12_006_000_000n });
// export const accountG = generateEmulatorAccount({ lovelace: 12_007_000_000n });



const AccountsList: EmulatorAccount[] = [
    treasuryAccount, accountA, accountB
    // , accountC, accountD, accountE, accountF, accountG
]

const emulator = new Emulator(AccountsList);

export async function mainStart() {
    //treasuryAccount.address = env.laceTreasuryAddress;
    // treasuryAccount.seedPhrase = env.laceTreasurySeed,



    console.clear();
    console.log("---------------------------clea------------------------------------------------");
    console.log("treasury", treasuryAccount.address);
    console.log("treasury", treasuryAccount.seedPhrase);
    let lucid = await Lucid(emulator, "Custom");
    emulator.awaitBlock(1);


    lucid.selectWallet.fromSeed(treasuryAccount.seedPhrase);
    const va: UTxO[] = await lucid.utxosAt(treasuryAccount.address)//, u.unitAllocano)
    console.log("va", va);
    // await admin.createAdmin(accountA.address, lucid);
    emulator.awaitBlock(1);
    lucid.selectWallet.fromSeed(accountA.seedPhrase);
    emulator.awaitBlock(1);
     await mint.mintAllocation(accountA.address, "Allocano 0", lucid);
    emulator.awaitBlock(1);
    await mint.mintAllocation(accountA.address, "Allocano 1", lucid);
    emulator.awaitBlock(1);
    await mint.mintAllocation(accountA.address, "Allocano 2", lucid);
    emulator.awaitBlock(1);
    emulator.log();
    await burn.allocation (accountA.address, "Allocano 2", lucid);
     emulator.awaitBlock(1);
    emulator.log();
}

// deno run -A --unstable-sloppy-imports  index.ts
// @ts-ignore: Deno import.meta.main is not in TypeScript types
if ((import.meta as any).main) {
    await mainStart();
}