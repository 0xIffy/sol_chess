import React from 'react';
import { Chessboard } from 'react-chessboard';
// import Chess from 'chess.js';
import { abi } from '../utils/ChaosPortal.json';
// import { ethers } from 'ethers';
import Moves from './Moves';
import Games from './Games'


import kp from '../keypair.json';
import idl from '../idl.json';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram } = web3;

// Create a keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);
// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed"
}

class ChaosChess extends React.Component {
  constructor(props) {
    super(props);

    this.contractAddress = '0x9Ef541D6B5acFe891f7aa3CcF13A7c2595B5c256';
    this.contractABI = abi;
    this.startPos = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    this.peicePath = 'https://images.chesscomfiles.com/chess-themes/pieces/glass/150/';

    this.state = { 
      allGames: [],
      prevFen: this.startPos,
      displayedGame: null
    }

    this.ref = React.createRef();
  }

  createSiteAccount = async () => {
    try{
      const provider = this.getProvider();
      const program = new Program(idl, programID, provider);
      console.log("Pinging");
      await program.rpc.initialize({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId
        },
        signers: [baseAccount]
      });

      console.log("Create BaseAccount:", baseAccount.publicKey.toString());
      await this.getAllGames();
    } catch (e){
      console.log(e);
    }
  } 

  getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment
    );

    return provider;
  }


  getAllGames = async () => {
    try{
      // console.log(baseAccount)
      const provider = this.getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

      // console.log("Gottem:", account.games);
      let g = account.games[account.games.length - 1];

      this.props.onBoardUpdate(g.currBoard);
      this.setState({ allGames: account.games });
      this.setState({ prevFen: g.currBoard });
      this.setState({ displayedGame: g });
    } catch (e) {
      console.log(e);
      this.setState({ allGames: [] });
    }
  }

  sendGame = async (currMove) => {
		// let mvPGN = formatPGN();

		try{
      const provider = this.getProvider();
      const program = new Program(idl, programID, provider);
      
      await program.rpc.makeMove(currMove, this.props.game.fen(), this.state.prevFen, this.props.game.game_over(), {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey
        }
      });

      await this.getAllGames();
    } catch (e) {
      console.log("sending move, got", e);
    }
	}

  handleNewGame = () => {
    alert("new game");
  }

  switchBoard = (game) => {
    this.setState({ displayedGame: game });
    this.props.onBoardUpdate(game.currBoard);
  }

  pieces = ['wp', 'wn', 'wb', 'wr', 'wq', 'wk', 'bp', 'bn', 'bb', 'br', 'bq', 'bk'];
  customPieces = () => {
    const returnPieces = {};
    this.pieces.map((p) => {
      let path = this.peicePath.concat(p,'.png');
      // console.log(path)
      returnPieces[p] = ({ squareWidth }) => (
        <img style={{ width: squareWidth, height: squareWidth }} src={path} alt={p} />
      );
      return null;
    });
    return returnPieces;
  };

  componentDidMount(){
    // console.log("h")

    const onLoad = async () => {
      // await checkIfWalletIsConnected();
      this.props.checkWallet()
      .then(() => { this.getAllGames(); })
        // .catch(e => console.log(e))
      .catch(e => console.log(e) )
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }

  // componentWillUnmount(){
  //   this.props.clearOptions();
  // }

  render() { 
    const { boardWidth, 
            game, 
            onConnect, 
            onSquareRightClick,
            onSquareClick,
            onBoardUpdate, 
            moveSquares, 
            optionSquares, 
            rightClickedSquares,
            clearOptions,
            account 
          } = this.props;

    const { displayedGame, allGames } = this.state;

    return (
      <React.Fragment>
        <div className="">
          <button onClick={this.createSiteAccount}> Init </button>
          <div className="flex justify-center">
            <div className="mr-4">
              <Chessboard
                id="ClickToMove"
                animationDuration={100}
                arePiecesDraggable={false}	
                boardWidth={boardWidth}
                position={game.fen()}
                onSquareClick={
                  account ? (square) => {
                    if(displayedGame && game.fen() === displayedGame.currBoard){
                      let move = onSquareClick(square);
                      if(move){
                        this.sendGame(move);
                      }
                    }
                  }
                  : () => {
                    onConnect()
                      .then( () => { this.getAllGames() });
                  }
                }
                onSquareRightClick={onSquareRightClick}
                customBoardStyle={{
                  borderRadius: '4px',
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
                }}
                customSquareStyles={{
                  ...moveSquares,
                  ...optionSquares,
                  ...rightClickedSquares
                }}
                ref={this.ref}

                customDarkSquareStyle={{ backgroundColor: '#0e4081' }}
                customLightSquareStyle={{ backgroundColor: '#ffc099' }}
                customPieces={this.customPieces()}
              />
            </div>
            <Moves
              onClick={clearOptions}
              moves={displayedGame ? displayedGame.moves : []}
              gamePos={game.fen()}
              onBoardUpdate={onBoardUpdate}
            />
          </div>
          <div className="flex justify-center mt-12">
            <Games
              onClick={this.switchBoard}
              onMouseEnter={(g) => { onBoardUpdate(g.currBoard); clearOptions();  }}
              onMouseLeave={() => { onBoardUpdate(displayedGame.currBoard) }}
              games={allGames}
              currGame={displayedGame}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}
 
export default ChaosChess;