//import logo from './logo.svg';
import './App.css';
import { Container, Row, Spinner, Alert, Col, Stack, Tabs, Tab} from 'react-bootstrap';
import Web3 from 'web3';
import React from 'react';

import { ProviderInfo } from './components/ProviderInfo'
import { AccountsList } from './components/AccountList';
import { ProviderSelector } from './components/ProviderSelector';
import { TokenBalance } from './components/TokenBalance'
import { SendEthTransaction } from './components/SendEthTransaction';
import { tab } from '@testing-library/user-event/dist/tab';

//import { ThemeConsumer } from 'react-bootstrap/esm/ThemeProvider';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
      providers : [],
      providerURl: "",
      currentProvider : 0, //index of the current provider in the providers[] array
      web3Client: undefined,
      clientConnected: false,
      clientError: "",
      accounts : [],
      balances : [],
      activeAccount : 0,
      chainID : undefined
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
    this.connectWeb3ClientAndGetBalances = this.connectWeb3ClientAndGetBalances.bind(this);
    this.providerChange = this.providerChange.bind(this);
    this.setActiveAccount = this.setActiveAccount.bind(this);
    this.getChainID = this.getChainID.bind(this);
  }
  
  async connectWeb3Client(providers, providerOptions, providerIndex) {
    //let web3Provider = new Web3.providers.HttpProvider(this.state.providerURl, providerOptions);
    let selectedProvider = providers[providerIndex];
    let currentProvider = undefined;
    let web3 = undefined;

    if (typeof(selectedProvider) == "string") {
      //the selectedProvider is a string, for example http://localhost:12345
      currentProvider = new Web3.providers.HttpProvider(selectedProvider, providerOptions);   
    }
    else {
      //the selectedProvider is an object, for example window.ethereum
      currentProvider = selectedProvider; 
    }

    web3 = new Web3(currentProvider);
    let errorMsg = "";
    let connected = false;
    try { 
      const res = await web3.eth.net.isListening();
      connected = res;
      console.log("Web3 client is listening: " + connected);
    }  
    catch (e) {
      errorMsg = "Error conecting to the Eth client or wallet: " + e;
      console.log(errorMsg); 
    };
    //do not set state in this function, use returned values to set state as:
    //this.setState({web3Client : web3, clientConnected : connected, clientError : errorMsg});
    return {web3, connected, errorMsg}
  }

  async getAccounts(web3_in) { 
    let errorMsg = ""; 
    let accounts = []; 
  
    try {
      //accounts = await web3_in.eth.getAccounts();
      if (web3_in.isMetaMask) accounts = await web3_in.request({method: "eth_requestAccounts"})
      else accounts = await web3_in.eth.getAccounts();
      //accounts   = await web3_in.eth.requestAccounts();
    }
    catch (e)
    {
      errorMsg = "Error getting accounts from the wallet: " + e;
      console.log(errorMsg); 
    }
    //do not set state in this function, use returned values to set state as:
    //this.setState({accounts : accounts, clientError : errorMsg});
    return {accounts, errorMsg}
  }  

  async getBalance(web3, accountNumber) {
    //get eth balance for the accountNumber
    console.log("DEBUG: getting balance...");
    let errorMsg = "";
    let balanceEth = 0;
    try {
      const balance = await web3.eth.getBalance(accountNumber);
      balanceEth = web3.utils.fromWei(balance).substring(0,6);
    }
    catch (e) {
      errorMsg = "Error getting balance for " + accountNumber + " from the wallet. " + e;
      console.log(errorMsg);
      balanceEth = "Error getting balance."
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

  async getChainID(web3){
    //get chain ID
    let chainID = undefined;
    let errorMsg = "";
    try {
      chainID = await web3.eth.getChainId()
    }
    catch (e) {
      errorMsg = "Error getting chain ID " + e;
      console.log(errorMsg);
    }
    return {chainID, errorMsg}
  }
  
  connectWeb3ClientAndGetBalances(providers, providerOptions, providerIndex){
    this.setState({
      clientConnected : false,
      activeAccount : 0,
      accounts : [],
      balances : [] 
    });  //assume we are disconnected (even if were connected previously)

    this.connectWeb3Client(providers, providerOptions, providerIndex)
    .then((res) => {
      let web3 = res.web3;
      let connected = res.connected;
      let errorMsg = res.errorMsg;
      let chainID = undefined;
      let web3ForAccounts = undefined;

      if (connected) this.getChainID(web3)
      .then((res) => {
        chainID = res.chainID;
        errorMsg = res.errorMsg;
        this.setState({
          providers: providers, 
          web3Client : web3, 
          clientConnected : connected,
          chainID : chainID, 
          clientError : errorMsg
        });
        console.log('getting accounts...');
        if (providers[providerIndex].isMetaMask) {
          console.log('this is Metamask...');
          web3ForAccounts = providers[providerIndex];
        } 
        else {
          console.log('this is not meta mask');
          web3ForAccounts = web3;
        }

        this.getAccounts(web3ForAccounts)
        .then((res) => {
          let accounts = res.accounts;
          let errorMsg = res.errorMsg;
          this.getBalances(web3, accounts)
          .then (resp => this.setState({accounts : accounts, clientError : errorMsg, balances : resp}));
        });
      })
      else this.setState({
        providers: providers, 
        web3Client : web3, 
        clientConnected : connected,
        chainID : chainID, 
        clientError : errorMsg
      }); 
    });
  }

  providerChange(msg){
    this.connectWeb3ClientAndGetBalances(this.state.providers, this.props.providerOptions, msg.target.value);
  }

  setActiveAccount(index){
    this.setState({activeAccount : index})
  }

  componentDidMount(){  
    let providers = [];
    //add browser wallet if present
    //let browserProvider = Web3.givenProvider;
    let browserProvider = window.ethereum;
    if (browserProvider !== null) providers.push(browserProvider); 
    
    //hard-code a couple of options for now
    providers.push("http://192.168.1.182:8545");
    providers.push("http://127.0.0.1:7545");

    this.connectWeb3ClientAndGetBalances(providers, this.props.providerOptions, 0);

    window.ethereum.on('accountsChanged', (accounts) => {
      // Handle the new accounts, or lack thereof.
      // "accounts" will always be an array, but it can be empty.
      this.connectWeb3ClientAndGetBalances(providers, this.props.providerOptions, 0);
    });
  }

  render() {
  return (
    <Container fluid className="App">
    <Row className="justify-content-md-center App-header">
      <h1> Ethereum app </h1>
    </Row>
    <Row id="providerSelectorAndInfo" className="App-content top-margin">
      <Stack direction="horizontal" gap={3}>
      <div>Web3 provider</div>
      <div><ProviderSelector providers={this.state.providers} onChange={this.providerChange} /></div>
      <div><ProviderInfo 
        provider={this.state.web3Client} 
        connected={this.state.clientConnected} 
        chainID = {this.state.chainID}/>
      </div>
      </Stack>
    </Row>
    <br/>
    {
      (this.state.clientConnected) ? ("") :
      (this.state.clientError === "") ?
      (<Spinner animation="border" variant="secondary" />) :
      (<Alert variant="danger">{this.state.clientError}</Alert>)
    }
    {
      (this.state.clientConnected) ?   
      (<AccountsList accounts={this.state.accounts}
                    balances={this.state.balances} 
                    activeAccount={this.state.activeAccount}
                    onClick={this.setActiveAccount}/>)
      : ("")
    }
  <br/>
  <Tabs defaultActiveKey="profile" id="actions" className="mb-3 App-content">
    <Tab eventKey="home" title="Token balance " className="App-content">
      {(this.state.clientConnected) ? 
      (<TokenBalance account={this.state.accounts[this.state.activeAccount]}
                     web3={this.state.web3Client}/>)
      : ("")
      }
    </Tab>
    <Tab eventKey="profile" title="Send transaction" className="App-content">
      {(this.state.clientConnected) ? 
      (<SendEthTransaction account={this.state.accounts[this.state.activeAccount]}
                     web3={this.state.web3Client}/>)
      : ("")
      }

    </Tab>
    <Tab eventKey="contact" title="Contact">
     <a href = "mailto:ethinteract@gmail.com" target="_blank">Contact us</a>

    </Tab>
  </Tabs>
  </Container>
  );}
}
export default App;