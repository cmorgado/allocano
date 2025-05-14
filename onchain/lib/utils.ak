use aiken/collection/list.{filter, foldl}
use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address, PaymentCredential, from_verification_key}
use cardano/assets.{Value, merge, zero}
use cardano/transaction.{Output, Transaction}

pub fn value_sent_to_pubkeyhash(
  tx: Transaction,
  pubkeyhash: VerificationKeyHash,
) -> Value {
  let outputs =
    list.filter(
      tx.outputs,
      fn(output) {
        let cred: PaymentCredential = output.address.payment_credential
        let pay_addr: Address =
          Address { payment_credential: cred, stake_credential: None }
        let pubkey_addr = from_verification_key(pubkeyhash)
        pay_addr == pubkey_addr
      },
    )
  let val =
    list.foldl(
      outputs,
      zero,
      fn(output: Output, final_val: Value) -> Value {
        merge(final_val, output.value)
      },
    )
  val
}
