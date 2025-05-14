use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Credential, PaymentCredential, from_verification_key}
use cardano/assets.{PolicyId, Value, from_asset}
use cardano/transaction.{Input, NoDatum, Output, OutputReference, Transaction}
use cocktail/vodka_extra_signatories.{key_signed}
use cocktail/vodka_mints.{only_minted_token}
use env
use mocktail.{
  add_output, add_reference_input, complete, mint, mock_pub_key_hash,
  mock_pub_key_output, mock_utxo_ref, mocktail_tx, ref_tx_in_inline_datum,
  required_signer_hash, tx_in_inline_datum,
}
use mocktail/virgin_key_hash.{mock_policy_id}

pub type AllocanoMintRedeemer {
  action: Int,
  allocation_hash: ByteArray,
}

pub type AllocanoSpendRedeemer {
  action: Int,
}

pub type AllocanoDatum {
  customerAllocanoPhk: ByteArray,
  allocation_hash: ByteArray,
}

validator allocano {
  mint(redeemer: AllocanoMintRedeemer, policy_id: PolicyId, self: Transaction) {
    when redeemer.action is {
      1 -> {
        // this is the project owner distributing the admin tokens to customers admin wallet
        let this_is_true = key_signed(self.extra_signatories, env.treasury)
        let is_only_minted_token =
          only_minted_token(self.mint, policy_id, env.adminTokenName, 1)
        and {
          this_is_true,
          is_only_minted_token,
        }
      }
      2 ->
        // mint token for customer allocation with the hash of the allocation
        // for the time being ONLY ONE token is minted 

        fail @"handle action 2"
      _ -> fail @"Invalid Action"
    }
  }

  spend(
    _datum: Option<AllocanoDatum>,
    _redeemer: AllocanoSpendRedeemer,
    _utxo: OutputReference,
    _self: Transaction,
  ) {
    todo @"spend logic goes here"
  }

  else(_) {
    fail
  }
}

fn testDistributeAdminToken(
  policyId: PolicyId,
  treasury: VerificationKeyHash,
) -> Transaction {
  mocktail_tx()
    |> required_signer_hash(True, treasury)
    |> mint(True, 1, mock_policy_id(0), env.adminTokenName)
    |> complete()
}

test successFullAdminMint_by_treasury() {
  allocano.mint(
    AllocanoMintRedeemer { action: 1, allocation_hash: env.adminTokenName },
    mock_policy_id(0),
    testDistributeAdminToken(mock_policy_id(0), env.treasury),
  )
}

test failAdminMint_not_treasury() {
  !allocano.mint(
    AllocanoMintRedeemer { action: 1, allocation_hash: env.adminTokenName },
    mock_policy_id(0),
    testDistributeAdminToken(mock_policy_id(0), mock_pub_key_hash(0)),
  )
}

test failAdminMint_correct_token_name() {
  !allocano.mint(
    AllocanoMintRedeemer { action: 1, allocation_hash: env.adminTokenName },
    mock_policy_id(0),
    testDistributeAdminToken(mock_policy_id(0), mock_pub_key_hash(0)),
  )
}

fn allocation_registration(
  policyId: PolicyId,
  allocation_hash: ByteArray,
  customerPhk: VerificationKeyHash,
  allocation: AllocanoDatum,
  referenceToken: Value,
  referenceInput: Input,
) -> Transaction {
  mocktail_tx()
    //|> add_reference_input(True, referenceInput)
    |> mint(True, 1, policyId, allocation_hash)
    |> tx_in_inline_datum(True, allocation)
    |> required_signer_hash(True, customerPhk)
    // |> add_output(
    //     True,
    //     mock_pub_key_output(mock_fee_collection_address, mock_fee),
    //   )
    // |> add_output(
    //     True,
    //     mock_pub_key_output(mock_fee_collection_address, mock_fee),
    //   )
    |> complete()
}

test successFullAllocationRegistration() {
  let allocation_hash = env.adminTokenName
  let customerPhk = mock_pub_key_hash(0)
  let allocation =
    AllocanoDatum { customerAllocanoPhk: customerPhk, allocation_hash }
  let referenceToken: Value =
    from_asset(mock_policy_id(0), env.adminTokenName, 1)
  let reference_input =
    Input {
      output_reference: mock_utxo_ref(0, 0),
      output: Output {
        address: from_verification_key(customerPhk),
        value: referenceToken,
        datum: NoDatum,
        reference_script: None,
      },
    }

  allocano.mint(
    AllocanoMintRedeemer { action: 2, allocation_hash },
    mock_policy_id(0),
    allocation_registration(
      mock_policy_id(0),
      allocation_hash,
      customerPhk,
      allocation,
      referenceToken,
      reference_input,
    ),
  )
}
