const anchor = require('@project-serum/anchor');
const { SystemProgram } = anchor.web3;

const main = async() => {
  console.log("\n\nStarting test...");

  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Chaoss;

  const baseAccount = anchor.web3.Keypair.generate();

  const tx = await program.rpc.initialize({
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId
    },
    signers: [baseAccount]
  });

  console.log("Tx sig: ", tx);

  let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log(account.games);

  await program.rpc.makeMove("e4", "fen", "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", false, {
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey
    }
  });

  account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log(account.games[0].moves);
  // console.log("List:", account.gifList);
}

const runMain = async () => {
  try {
    await main();
    process.exit(0)
  } catch (e){
    console.log(e);
    process.exit(1);
  }
}

runMain();