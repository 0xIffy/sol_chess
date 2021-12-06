// import logo from './logo.svg';
import './App.css';
import React, { Component } from 'react';
import BaseChess from './components/BaseChess';
import Navbar from './components/Navbar'
// import { createTheme, ThemeProvider } from '@mui/material/styles';

class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      walletAddress: null
    };
  }

  checkIfWalletConnected = async () => {
		try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');

          const response = await solana.connect({ onlyIfTrusted: true });
          console.log(
            'Connected with Public Key:',
            response.publicKey.toString()
          );

          this.setState({ walletAddress: response.publicKey.toString() });
        }
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
	};

  connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      this.setState({ walletAddress: response.publicKey.toString() });
    }
	};

  // componentDidMount(){
  //   // this.checkIfWalletConnected();
  // }


  render() { 
    return  (
      <div className="App bg-primary bg-opacity-100 min-w-full min-h-screen">
        <Navbar/>
        <BaseChess
          account={this.state.walletAddress}
          onConnect={this.connectWallet}
          boardWidth={450}
          checkWallet={this.checkIfWalletConnected}
        />
      </div>
    );
  }
}
 
export default App;
