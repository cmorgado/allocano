use aiken/collection/list.{at, length}
use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address, from_verification_key}
use cardano/assets.{PolicyId, Value, from_asset, lovelace_of}
use cardano/transaction.{
  InlineDatum, Input, NoDatum, Output, OutputReference, Transaction,
}
use cocktail/vodka_extra_signatories.{key_signed}
use cocktail/vodka_mints.{
  check_policy_only_burn, only_minted_token, token_minted,
}
use cocktail/vodka_outputs.{output_inline_datum, outputs_with}
use cocktail/vodka_value.{value_tokens}
use env
use mocktail.{
  add_reference_input, complete, mint, mock_pub_key_hash, mock_script_address,
  mock_tx_hash, mock_utxo_ref, mocktail_tx, required_signer_hash, tx_in,
  tx_in_inline_datum, tx_out, tx_out_inline_datum,
}
use mocktail/virgin_key_hash.{mock_policy_id}
use utils.{value_sent_to_pubkeyhash}

pub type AllocanoMintRedeemer {
  action: Int,
  allocation_hash: Option<ByteArray>,
}

//old_allocation_hash: ByteArray,

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
          if this_is_true {
            True
          } else {
            trace @"Not the treasury"
            False
          },
          if is_only_minted_token {
            True
          } else {
            trace @"Not the only minted token"
            False
          },
        }
      }
      2 -> {
        // mint token for customer allocation with the hash of the allocation
        // for the time being ONLY ONE token is minted 
        let maybe_first_reference_input = self.reference_inputs |> at(0)

        let first_reference_output =
          when maybe_first_reference_input is {
            Some(input) -> input.output
            None -> {
              trace @"No reference inputs found"
              fail @"No reference inputs found"
            }
          }
        let findTokenInRefs =
          outputs_with([first_reference_output], policy_id, env.adminTokenName)

        let allocation_hash =
          when redeemer.allocation_hash is {
            Some(hash) -> hash
            None -> fail @"Missing allocation_hash"
          }
        let findTokenInOutputs =
          outputs_with(self.outputs, policy_id, allocation_hash)
        let is_only_minted_token =
          only_minted_token(self.mint, policy_id, allocation_hash, 1)
        let payedTotreasury =
          lovelace_of(value_sent_to_pubkeyhash(self, env.treasury))
        let maybe_output = findTokenInOutputs |> at(0)

        let output =
          when maybe_output is {
            Some(value) -> value
            None -> {
              trace @"Token not found in outputs"
              fail @"Token not found in outputs"
            }
          }

        expect output_datum: AllocanoDatum = output_inline_datum(output)
        let maybe_first_signatory = self.extra_signatories |> at(0)

        let first_signatory =
          when maybe_first_signatory is {
            Some(value) -> value
            None -> {
              trace @"No signatories found"
              fail @"No signatories found"
            }
          }

        and {
          if is_only_minted_token {
            True
          } else {
            trace @"Not the only minted token"
            False
          },
          if length(findTokenInOutputs) == 1 {
            True
          } else {
            trace @"Token not found in outputs"
            False
          },
          if output_datum.customerAllocanoPhk == first_signatory {
            True
          } else {
            trace @"Not the signer"
            False
          },
          if length(findTokenInRefs) == 1 {
            True
          } else {
            trace @"Token not found in reference inputs"
            False
          },
          if payedTotreasury == 2_000_000 {
            True
          } else {
            trace @"Missing payment to treasury"
            False
          },
        }
      }
      3 -> {
        // this is the project owner distributing the admin tokens to customers admin wallet
        let maybe_first_reference_input = self.reference_inputs |> at(0)

        let first_reference_output =
          when maybe_first_reference_input is {
            Some(input) -> input.output
            None -> {
              trace @"No reference inputs found"
              fail @"No reference inputs found"
            }
          }
        let findTokenInRefs =
          outputs_with([first_reference_output], policy_id, env.adminTokenName)

        let is_only_burned_token = check_policy_only_burn(self.mint, policy_id)
        let maybe_first_signatory = self.extra_signatories |> at(0)

        let first_signatory =
          when maybe_first_signatory is {
            Some(value) -> value
            None -> {
              trace @"No signatories found"
              fail @"No signatories found"
            }
          }
        and {
          if length(findTokenInRefs) == 1 {
            True
          } else {
            trace @"Token not found in reference inputs"
            False
          },
          if is_only_burned_token {
            True
          } else {
            trace @"Not the only burned token"
            False
          },
        }
      }

      _ -> fail @"Invalid Action"
    }
  }

  spend(
    _datum: Option<AllocanoDatum>,
    redeemer: AllocanoMintRedeemer,
    utxo: OutputReference,
    self: Transaction,
  ) {
    when redeemer.action is {
      3 -> {
        expect Some(ownInput) =
          self.inputs
            |> transaction.find_input(utxo)
        let ownHash = ownInput.output.address.payment_credential
        let tokens = value_tokens(ownInput.output.value)
        expect datum: AllocanoDatum = output_inline_datum(ownInput.output)
        expect Some(first_token) = tokens |> at(0)
        let (policy_id, asset_name, amount) = first_token
        let is_only_burned_token = check_policy_only_burn(self.mint, policy_id)
        let maybe_first_signatory = self.extra_signatories |> at(0)

        let first_signatory =
          when maybe_first_signatory is {
            Some(value) -> value
            None -> {
              trace @"No signatories found"
              fail @"No signatories found"
            }
          }
        and {
          if is_only_burned_token {
            True
          } else {
            trace @"Not burned token"
            False
          },
          if first_signatory == datum.customerAllocanoPhk {
            True
          } else {
            trace @"Not the signer"
            False
          },
        }
      }
      _ -> {
        trace @"Invalid Action"
        fail @"Invalid Action"
      }
    }
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
    |> mint(True, 1, policyId, env.adminTokenName)
    |> complete()
}

test successFullAdminMint_by_treasury() {
  allocano.mint(
    AllocanoMintRedeemer {
      action: 1,
      allocation_hash: Some(env.adminTokenName),
    },
    mock_policy_id(0),
    testDistributeAdminToken(mock_policy_id(0), env.treasury),
  )
}

test failAdminMint_not_treasury() {
  !allocano.mint(
    AllocanoMintRedeemer {
      action: 1,
      allocation_hash: Some(env.adminTokenName),
    },
    mock_policy_id(0),
    testDistributeAdminToken(mock_policy_id(0), mock_pub_key_hash(0)),
  )
}

test failAdminMint_correct_token_name() {
  !allocano.mint(
    AllocanoMintRedeemer {
      action: 1,
      allocation_hash: Some(env.adminTokenName),
    },
    mock_policy_id(0),
    testDistributeAdminToken(mock_policy_id(0), mock_pub_key_hash(0)),
  )
}

fn allocation_registration(
  policyId: PolicyId,
  allocation_hash: ByteArray,
  customerPhk: VerificationKeyHash,
  allocation: AllocanoDatum,
  referenceInput: Input,
) -> Transaction {
  mocktail_tx()
    |> tx_in(
        True,
        mock_tx_hash(0),
        0,
        from_asset(#"", #"", 2_000_000),
        from_verification_key(customerPhk),
      )
    |> tx_out(
        True,
        address: from_verification_key(env.treasury),
        amount: from_asset(#"", #"", 2_000_000),
      )
    |> tx_out(
        True,
        address: mock_script_address(0, None),
        amount: from_asset(policyId, allocation.allocation_hash, 1),
      )
    |> tx_out_inline_datum(True, allocation)
    |> mint(True, 1, policyId, allocation_hash)
    |> required_signer_hash(True, customerPhk)
    |> complete()
    |> add_reference_input(True, referenceInput)
}

test successFullAllocationRegistration() {
  let allocation_hash = env.adminTokenName
  let customerPhk = mock_pub_key_hash(0)
  let tokenPolicyId = mock_policy_id(0)
  let allocation =
    AllocanoDatum { customerAllocanoPhk: customerPhk, allocation_hash }
  let referenceToken: Value = from_asset(tokenPolicyId, env.adminTokenName, 1)
  let referenceOutput =
    Output {
      address: from_verification_key(customerPhk),
      value: referenceToken,
      datum: NoDatum,
      reference_script: None,
    }
  let referenceInput =
    Input { output_reference: mock_utxo_ref(0, 0), output: referenceOutput }
  allocano.mint(
    AllocanoMintRedeemer { action: 2, allocation_hash: Some(allocation_hash) },
    tokenPolicyId,
    allocation_registration(
      tokenPolicyId,
      allocation_hash,
      customerPhk,
      allocation,
      referenceInput,
    ),
  )
}

test unsuccessFullAllocationRegistration_noadmin_tocken() {
  let allocation_hash = env.adminTokenName
  let customerPhk = mock_pub_key_hash(0)
  let fakeCustomerPhk = mock_pub_key_hash(1)
  let tokenPolicyId = mock_policy_id(0)
  let allocation =
    AllocanoDatum { customerAllocanoPhk: customerPhk, allocation_hash }
  let referenceToken: Value =
    from_asset(mock_policy_id(1), env.adminTokenName, 1)
  let referenceOutput =
    Output {
      address: from_verification_key(customerPhk),
      value: referenceToken,
      datum: NoDatum,
      reference_script: None,
    }
  let referenceInput =
    Input { output_reference: mock_utxo_ref(0, 0), output: referenceOutput }
  !allocano.mint(
    AllocanoMintRedeemer { action: 2, allocation_hash: Some(allocation_hash) },
    tokenPolicyId,
    allocation_registration(
      tokenPolicyId,
      allocation_hash,
      customerPhk,
      allocation,
      referenceInput,
    ),
  )
}

fn allocation_modification(
  policyId: PolicyId,
  customerPhk: VerificationKeyHash,
  scriptAddress: Address,
  allocationDatum: AllocanoDatum,
  referenceInput: Input,
  outputReference: OutputReference,
) -> Transaction {
  mocktail_tx()
    |> tx_in(
        True,
        mock_tx_hash(0),
        0,
        from_asset(policyId, allocationDatum.allocation_hash, 1),
        scriptAddress,
      )
    |> tx_in_inline_datum(True, allocationDatum)
    |> tx_in(
        True,
        mock_tx_hash(0),
        0,
        from_asset(#"", #"", 2_000_000),
        from_verification_key(customerPhk),
      )
    |> tx_out(
        True,
        address: from_verification_key(env.treasury),
        amount: from_asset(#"", #"", 2_000_000),
      )
    |> mint(True, -1, policyId, allocationDatum.allocation_hash)
    |> required_signer_hash(True, customerPhk)
    |> complete()
    |> add_reference_input(True, referenceInput)
}

test successFullAllocationReplacement() {
  let old_allocation_hash =
    #"0000e5bd0791d38438b891514d6158b5306884e9b7f4ef4b6433c6943285776c"
  let customerPhk = mock_pub_key_hash(0)
  let tokenPolicyId = mock_policy_id(0)
  let allocationDatum =
    AllocanoDatum {
      customerAllocanoPhk: customerPhk,
      allocation_hash: old_allocation_hash,
    }
  let referenceToken: Value = from_asset(tokenPolicyId, env.adminTokenName, 1)
  let referenceOutput =
    Output {
      address: from_verification_key(customerPhk),
      value: referenceToken,
      datum: NoDatum,
      reference_script: None,
    }
  let output_reference =
    OutputReference { transaction_id: mock_tx_hash(0), output_index: 0 }
  let referenceInput =
    Input { output_reference: mock_utxo_ref(0, 0), output: referenceOutput }
  allocano.spend(
    None,
    AllocanoMintRedeemer { action: 3, allocation_hash: None },
    output_reference,
    allocation_modification(
      tokenPolicyId,
      customerPhk,
      mock_script_address(0, None),
      allocationDatum,
      referenceInput,
      output_reference,
    ),
  )
}
