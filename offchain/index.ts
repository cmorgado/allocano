import { Lucid, generateSeedPhrase, Assets, LucidEvolution, Emulator, EmulatorAccount, generatePrivateKey, Required, Address, MintingPolicy, generateEmulatorAccount, validatorToAddress, PolicyId, mintingPolicyToId, applyDoubleCborEncoding, Unit, fromText, getAddressDetails, UTxO, TxOutput, OutRef } from "@lucid-evolution/lucid";
import * as admin from "./createadmin"
import * as burn from "./burnallocation"
import * as mint from "./mintallocation"
import * as env from "./env/laceTreasury"
import * as u from "./utils"
const treasuryAccount = generateEmulatorAccount({ lovelace: 1_200_000_00n });
const accountA = generateEmulatorAccount({ lovelace: 1_200_000_000n });
const accountB = generateEmulatorAccount({ lovelace: 12_002_000_000n });
// export const accountC = generateEmulatorAccount({ lovelace: 12_003_000_000n });
// export const accountD = generateEmulatorAccount({ lovelace: 12_004_000_000n });
// export const accountE = generateEmulatorAccount({ lovelace: 12_005_000_000n });
// export const accountF = generateEmulatorAccount({ lovelace: 12_006_000_000n });
// export const accountG = generateEmulatorAccount({ lovelace: 12_007_000_000n });



export const AccountsList: EmulatorAccount[] = [
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

    console.log("---------------------------transfer 1------------------------------------------------");
    lucid.selectWallet.fromAddress(treasuryAccount.address,

        [
            {
                address:
                    "addr_test1qr25xnnj0c44wc0xr69wunaal63ahx6kqz5anz0t0dl6xa7k0s7kanz0a9wey098yds788qs7uhxgcqtc96h9x2vchcqaf7r46",
                assets: { ["lovelace"]: 254_5441_528n },
                txHash:
                    "ba4b9fb110ef328f84f080f277af89e3c40a8bc3aa64eb1605e445f3b7f293b7",
                outputIndex: 1,
            },
        ],
    );
    const va: UTxO[] = await lucid.utxosAt(treasuryAccount.address)//, u.unitAllocano)
    console.log("va", va);
    await admin.createAdmin(accountA.address, lucid);
    emulator.awaitBlock(10);
    lucid.selectWallet.fromAddress(accountA.address,

        [
            {
                address:
                    accountA.address,
                assets: { ["lovelace"]: 254_5441_528n, [u.unitAllocano]: 1n },
                txHash:
                    "ba4b9fb110ef328f84f080f277af89e3c40a8bc3aa64eb1605e445f3b7f293b7",
                outputIndex: 1,
            },
        ],
    );
    emulator.awaitBlock(10);
    await mint.mintAllocation(accountA.address, "Allocano", lucid);

    // emulator.log();
}

// deno run -A --unstable-sloppy-imports  index.ts
// @ts-ignore: Deno import.meta.main is not in TypeScript types
if ((import.meta as any).main) {
    await mainStart();
}