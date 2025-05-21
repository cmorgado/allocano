# allocano
A scheduling verifiable in Cardano Blockchain

___
onchain 
___
aiken check
modify ./preview_build.zsh to you own shell

create on env a file preview.ak with:

---
pub const treasury: ByteArray =
  #"pubkey hash of treasury"

pub const adminTokenName: ByteArray =
  string.to_bytearray(@"Allocano AdminToken_PREV")
---

modify ./preview_build.zsh to you own shell
run to create compiled contracts


--- off chain --
import the mintallocation.ts , burnallocation.ts,  