import { Lucid, generateSeedPhrase, Assets, LucidEvolution, Emulator, EmulatorAccount, generatePrivateKey, Required, Address, MintingPolicy, generateEmulatorAccount, validatorToAddress, PolicyId, mintingPolicyToId, applyDoubleCborEncoding, Unit, fromText, getAddressDetails, UTxO, TxOutput, OutRef } from "@lucid-evolution/lucid";
import * as admin from "./createadmin"
import * as env from "./env/laceTreasury"
export const treasuryAccount = generateEmulatorAccount({ lovelace: 1_200_000_00n });
export const accountA = generateEmulatorAccount({ lovelace: 1_200_000_000n });
export const accountB = generateEmulatorAccount({ lovelace: 12_002_000_000n });
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
    lucid.selectWallet.fromSeed(treasuryAccount.seedPhrase);
    console.log("treasury", treasuryAccount.address);
    console.log("treasury", treasuryAccount.seedPhrase);
    const pk = getAddressDetails(treasuryAccount.address).paymentCredential
    console.log("pk", pk);

    const tx = await lucid
        .newTx()
        .pay.ToAddress(accountB.address, { lovelace: 50_000_000n })
        .addSigner(treasuryAccount.address)
        .complete();

    const signedTx = await tx.sign.withWallet().complete();
    console.log("signed");
    const txHash = await signedTx.submit();
    console.log("id: " + txHash);

    emulator.awaitBlock(10);


    console.log("---------------------------transfer 2------------------------------------------------");
    lucid.selectWallet.fromSeed(accountB.seedPhrase);
    const tx3 = await lucid
        .newTx()
        .pay.ToAddress(accountA.address, { lovelace: 50_000_000n })
        .addSigner(accountB.address)
        .complete();

    const signedTx3 = await tx3.sign.withWallet().complete();
    console.log("signed");
    const txHash3 = await signedTx3.submit();
    console.log("id: " + txHash3);
    emulator.awaitBlock(10);



    lucid = await Lucid(emulator, "Custom");
    lucid.selectWallet.fromSeed(accountB.seedPhrase);
    await admin.createAdmin(accountB.address, accountA.address, lucid);
    emulator.awaitBlock(10);
    // emulator.log();
}

// deno run -A --unstable-sloppy-imports  index.ts
// @ts-ignore: Deno import.meta.main is not in TypeScript types
if ((import.meta as any).main) {
    await mainStart();
}