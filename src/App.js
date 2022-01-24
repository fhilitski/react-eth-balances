//import logo from './logo.svg';
import './App.css';
import { Container, Row, Spinner, Alert } from 'react-bootstrap';
import Web3 from 'web3';
import React from 'react';

import { ProviderInfo } from './components/ProviderInfo'
import { AccountsList } from './components/AccountList';
import { ProviderSelector } from './components/ProviderSelector';
//import { ThemeConsumer } from 'react-bootstrap/esm/ThemeProvider';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
      //providerURl: "HTTP://127.0.0.1:7545",
      providers : [],
      providerURl: "http://192.168.1.182:8545",
      currentProvider : 0, //index of the current provider in the providers[] array
      web3Client: undefined,
      clientConnected: false,
      clientError: "",
      accounts : [],
      balances : [],
      activeAccount : 0
    };
    
    this.providerOptions = {
      keepAlive: true,
      withCredentials: false,
      timeout: 20000, // ms
      headers: [
          {
            name: 'Access-Control-Allow-Origin',
            value: '*'
          }
      ]
    };

    this.connectWeb3Client = this.connectWeb3Client.bind(this);
    this.getAccounts = this.getAccounts.bind(this);
    this.getBalance = this.getBalance.bind(this);
    this.getBalances = this.getBalances.bind(this);
  }
  
  async connectWeb3Client(providers, providerOptions, providerIndex) {
    //let web3Provider = new Web3.providers.HttpProvider(this.state.providerURl, providerOptions);

    let currentProvider = providers[providerIndex];
    console.log(providers);
    console.log('Current provider: ' + currentProvider);
    let web3 = new Web3(currentProvider);  
    let errorMsg = "";
    let connected = false;
    try { 
      const res = await web3.eth.net.isListening();
      connected = res;
      console.log('Web3 client is listening: ' + connected);
    }  
    catch (e) {
      errorMsg = "Error conecting to the Eth client or wallet. " + e;
      console.log(errorMsg); 
    };

    //do not set state in this function, use returned values to set state as:
    //this.setState({web3Client : web3, clientConnected : connected, clientError : errorMsg});
    return {web3, connected, errorMsg}
  }

  async getAccounts(web3) { 
    let errorMsg = ""; 
    let accounts = []; 
    try {
      accounts = await web3.eth.getAccounts();
    }
    catch (e)
    {
      errorMsg = "Error getting accounts from the wallet. " + e;
      console.log(errorMsg); 
    }

    //do not set state in this function, use returned values to set state as:
    //this.setState({accounts : accounts, clientError : errorMsg});
    return {accounts, errorMsg}
  }  

  async getBalance(web3, accountNumber) {
    //get eth balance for the accountNumber

    let errorMsg = "";
    let balanceEth = 0;
    try {
      const balance = await web3.eth.getBalance(accountNumber);
      balanceEth = web3.utils.fromWei(balance).substring(0,6);
    }
    catch (e) {
      errorMsg = "Error getting balance for " + accountNumber + " from the wallet. " + e;
      console.log(errorMsg);
      balanceEth = "Error getting balance"
    }
    return {balanceEth, errorMsg}
  }

  async getBalances(web3, accounts){
    //get all balances for the array of accounts[]
    
    let balances = [];
    for (let account of accounts) {
      const {balanceEth} = await this.getBalance(web3, account);
      balances.push(balanceEth);
    }
    return balances
  }

  componentDidMount(){  
    
    let providers = [];
    //add browser wallet if present
    let browserProvider = Web3.givenProvider;
    if (browserProvider !== null) providers.push(browserProvider); 
    
    //hard-code a couple of options for now
    providers.push("http://192.168.1.182:8545");
    providers.push("http://127.0.0.1:7545");

    this.connectWeb3Client(providers, this.props.providerOptions, 0).
    then((res) => {
      let web3 = res.web3;
      let connected = res.connected;
      let errorMsg = res.errorMsg;
      this.setState({providers: providers, web3Client : web3, clientConnected : connected, clientError : errorMsg});
      
      if (connected) this.getAccounts(web3).
      then((res) => {
        let accounts = res.accounts;
        let errorMsg = res.errorMsg;
        this.getBalances(web3,accounts).
        then (resp => this.setState({accounts : accounts, clientError : errorMsg, balances : resp}));
      }); 
    });
  }

  render() {

  // The minimum ABI required to get the ERC20 Token balance
  const minABI = [
  // balanceOf
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function"
  }
  ];

  const BATtokenAddress = "0x0d8775f648430679a709e98d2b0cb6250d2887ef"; //BAT contract is 0x0d8775f648430679a709e98d2b0cb6250d2887ef 
  var tokenAddress = BATtokenAddress;
 

  //let walletAddress = "0x1cf56Fd8e1567f8d663e54050d7e44643aF970Ce";
  //walletAddress = "0x4f08633eaf6f89a630dd22c212ee277fb81878d5";
  var walletAddress = "0x93c7845e6430bd9ea1e12de8d225db3d5fc969de";
  //let walletAddress = tokenAddress;

  /* var contract = new this.state.web3Client.eth.Contract(minABI, tokenAddress);
  async function getBalance(walletAddr) {
    let result = await contract.methods.balanceOf(walletAddr).call();
    let format = this.state.web3Client.utils.fromWei(result);
    return format;
  }

  this.state.web3Client.eth.net.isListening()
  .then(() => { 
      console.log('Client is connected!');
      getBalance(walletAddress)
      .then( resp => console.log("Token balance: " + resp))
      .catch(e => console.log('Something went wrong: '+ e));
  })
  .catch(e => console.log('Wow. Something went wrong: '+ e));
 */

  return (
    <Container fluid className='App App-header'>
    <Row className="justify-content-md-center">
      <h1> Ethereum app </h1>
    </Row>
    <Row className="App-content top-margin">
      <ProviderSelector providers={this.state.providers}/>
    </Row>
    <Row className="App-content top-margin">
      {(this.state.clientConnected) ? 
      (<ProviderInfo provider={this.state.web3Client} connected={this.state.clientConnected}/>)
      :
      (this.state.clientError === "") ?
      (<Spinner animation="border" variant="secondary" />)
      :
      (<Alert variant="danger">{this.state.clientError}</Alert>)
      }
    </Row>
    
    {(this.state.clientConnected) ?   
    (<Row className='App-content'>
      <AccountsList accounts={this.state.accounts} balances={this.state.balances}/>
    </Row>)
    :
    ("")
     }
    </Container>
  );
  }
}
export default App;