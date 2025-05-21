import { Lucid, generateSeedPhrase, Assets, LucidEvolution, Emulator, EmulatorAccount, generatePrivateKey, Required, Address, MintingPolicy, generateEmulatorAccount, validatorToAddress, PolicyId, mintingPolicyToId, applyDoubleCborEncoding, Unit, fromText, getAddressDetails, UTxO, TxOutput, OutRef } from "@lucid-evolution/lucid";
import * as admin from "./createadmin"
import * as burn from "./burnallocation"
import * as mint from "./mintallocation"
import * as env from "./env/laceTreasury"
import * as u from "./utils"
let treasuryAccount = generateEmulatorAccount({ lovelace: 1_200_000_00n });
let accountA = generateEmulatorAccount({ ["lovelace"]: 111_111_111n, [u.unitAllocano]: 1n });
let accountB = generateEmulatorAccount({ ["lovelace"]: 222_222_222n, [u.unitAllocano]: 1n });
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

    console.clear();
    console.log("---------------------------------------------------------------------------");
    let lucid = await Lucid(emulator, "Custom");
    emulator.awaitBlock(1);


    lucid.selectWallet.fromSeed(treasuryAccount.seedPhrase);

    // await admin.createAdmin(accountA.address, lucid);
    emulator.awaitBlock(1);

    lucid.selectWallet.fromSeed(accountA.seedPhrase);

    await mint.mintAllocation(accountA.address, "Allocano 0", lucid);
    emulator.awaitBlock(10);
    await mint.mintAllocation(accountA.address, "Allocano 1", lucid);
    emulator.awaitBlock(10);
    lucid.selectWallet.fromSeed(accountB.seedPhrase);
    await mint.mintAllocation(accountB.address, "Allocano 2", lucid);
    emulator.awaitBlock(10);
    emulator.log();
    lucid.selectWallet.fromSeed(accountA.seedPhrase);
    await burn.allocation(accountA.address, "Allocano 1", lucid);
    emulator.awaitBlock(10);
    lucid.selectWallet.fromSeed(accountB.seedPhrase);
    await burn.allocation(accountB.address, "Allocano 2", lucid);
    emulator.awaitBlock(10);
    emulator.log()
}

// deno run -A --unstable-sloppy-imports  index.ts
// @ts-ignore: Deno import.meta.main is not in TypeScript types
if ((import.meta as any).main) {
    await mainStart();
}