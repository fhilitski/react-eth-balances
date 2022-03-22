import {Button, FloatingLabel, Form, Alert, Row, Col} from 'react-bootstrap'
import React from 'react';

class SendEthTransaction extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      isLoading : false,
      errorMsg : undefined
    }

    this.account = props.account;
    this.web3 = props.web3; 
    
    this.accountFrom = React.createRef();
    this.accountTo = React.createRef();
    this.valueEth = React.createRef();
    this.valueGas = React.createRef();
    this.priceGas = React.createRef();
    this.transactionData = React.createRef();
    this.nonce = React.createRef();


    this.getBalance = this.getBalance.bind(this);
    this.getName = this.getName.bind(this);
    this.getSymbol = this.getSymbol.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }
  
  async getBalance(web3, ethAccount, abi, tokenAddress) {
    let contract = new web3.eth.Contract(abi, tokenAddress);
    let result = undefined;
    let errorMsg = "";
    try {
      result = await contract.methods.balanceOf(ethAccount).call();
    }
    catch (e) {
      errorMsg = e.toString();
    }
    let formatedBalance = (result !== undefined) ? web3.utils.fromWei(result) : 0 ;
    return {formatedBalance, errorMsg};
  }

  async getName(web3, abi, tokenAddress) {
    let contract = new web3.eth.Contract(abi, tokenAddress);
    let result = undefined;
    let errorMsg = "";
    let contractName = "";
    try {
      result = await contract.methods.name().call();
    }
    catch (e) {
      errorMsg = e.toString();
    }
    contractName = (errorMsg === "") ? (result) : ("Token: ");
    return {contractName, errorMsg};
  }

  async getSymbol(web3, abi, tokenAddress) {
    let contract = new web3.eth.Contract(abi, tokenAddress);
    let result = undefined;
    let errorMsg = "";
    let contractSymbol = "";
    try {
      result = await contract.methods.symbol().call();
    }
    catch (e) {
      errorMsg = e.toString();
    }
    contractSymbol = result;
    return {contractSymbol, errorMsg};
  }
  
  handleClick() {

    let fromAddress = this.accountFrom.current.value;
    let toAddress = this.accountTo.current.value;
    let valueEth = this.valueEth.current.value;
    let valueGasInWei = this.valueGas.current.value;
    let priceGas = this.priceGas.current.value;
    let transactionData = this.transactionData.current.value;
    let nonce = this.nonce.current.value;;

    console.log(fromAddress);
    console.log(toAddress);
    console.log(valueEth);
    console.log(valueGasInWei);
    console.log("priceGas: " + priceGas);
    console.log(transactionData);
    console.log(nonce);
    
    //check that the entered address is correct
    /* This is one way to check, using web3.utils.toChecksumAddress
    let contractChecksumAddress = undefined;
    try {
      contractChecksumAddress = this.props.web3.utils.toChecksumAddress(contractAddress);
    }
    catch (e) {
      let errorMsg = e.toString();
      console.log(errorMsg);
    }
    */
    let inputIsValid = false;
    if (this.props.web3.utils.isAddress(fromAddress)) {
      inputIsValid = true;
    }
    else {
      this.setState({errorMsg : "Error: Invalid from address!"})
    }

    if (this.props.web3.utils.isAddress(toAddress)) {
      inputIsValid = inputIsValid && true;
    }
    else {
      inputIsValid = false;
      this.setState({errorMsg : "Error: Invalid to address!"})
    }
    
    let valueEthInWei = undefined;
    let valueGas = undefined;
    let priceGasInWei = undefined;

    if (inputIsValid) {
      try { 
        valueEthInWei = this.props.web3.utils.toWei(valueEth);
      }
      catch (problem) {
        inputIsValid = false; 
        this.setState({errorMsg : problem.toString()})
      };
    };

    if (inputIsValid) {
      try { 
        valueGas = this.props.web3.utils.fromWei(valueGasInWei);
      }
      catch (problem) {
        inputIsValid = false; 
        this.setState({errorMsg : problem.toString()})
      };
    };

    if (inputIsValid) {
      try { 
        priceGasInWei = this.props.web3.utils.fromWei(priceGas);
      }
      catch (problem) {
        inputIsValid = false; 
        this.setState({errorMsg : problem.toString()})
      };
    };
    
    if (inputIsValid) {
      this.setState({isLoading : true, errorMsg : undefined});  
      let transactionObject = {
        from:  fromAddress,
        to:    toAddress,
        value: valueEthInWei,
        data : transactionData,
        nonce: nonce
      };
      console.log(transactionObject);
      if (valueGasInWei >= 0) transactionObject.gas = valueGasInWei;
      if (priceGasInWei >= 0) transactionObject.gasPrice = priceGasInWei;
      if (transactionData !== "") transactionObject.data = transactionData;
      if (nonce !== "") transactionObject.nonce = nonce;
      
      console.log(transactionObject);
      this.props.web3.eth.sendTransaction(transactionObject)
      .then((receipt) => {
        console.log(receipt);
        this.setState({isLoading : false});
      }).catch((err) => { 
        this.setState({isLoading : false, errorMsg: (( err.message === undefined) ? err.toString() : err.message)  });
      });
      /*
      this.getBalance(this.props.web3, this.props.account, this.minABI, contractAddress).then((res) => {
        console.log("Formatted balance: " + res.formatedBalance);
        console.log("Error message: " + res.errorMsg);
        tokenBalance = res.formatedBalance;
        this.getName(this.props.web3, this.minABI, contractAddress).then((respGetName) =>
        {
          contractName = respGetName.contractName;
          let errors = (res.errorMsg !== "") ? res.errorMsg : respGetName.errorMsg;
          this.getSymbol(this.props.web3, this.minABI, contractAddress).then((respGetSymbol) =>
          {
            contractSymbol = respGetSymbol.
            errors = ( errors !== "") ? errors : respGetSymbol.errorMsg;
            this.setState({isLoading : false,
                           tokenBalance : tokenBalance, 
                           contractName : contractName, 
                           contractSymbol : respGetSymbol.contractSymbol,
                           errorMsg : errors

            });
          });
        });       
      });
      */
    }

  }
  
  render() {
  let retElement =
    <div id="transactionConfiguration" className="top-margin min-width" >
      <Form>
      <Row>
      <Col>
        <FloatingLabel
          controlId="floatingInput"
          label="From address"
          className="mb-2 dark-text"
        >
        <Form.Control
          type="text"
          className="dark-text"
          placeholder={this.account}
          ref={this.accountFrom}
          defaultValue={this.props.account} 
        />
        </FloatingLabel>
      </Col>
      </Row>

      <Row>
      <Col>
        <FloatingLabel
          controlId="floatingInput"
          label="To address"
          className="mb-2 dark-text"
        >
        <Form.Control
          type="text"
          className="dark-text"
          placeholder="0x000"
          ref={this.accountTo}
        />
        </FloatingLabel>
      </Col>
      </Row>

      <Row>
      <Col>
        <FloatingLabel
          controlId="floatingInput"
          label="Value in ETH"
          className="mb-2 dark-text"
        >
        <Form.Control
          type="text"
          className="dark-text"
          placeholder="0"
          ref={this.valueEth}
        />
        </FloatingLabel>
      </Col>
      </Row>

      <Row>
      <Col>
        <FloatingLabel
          controlId="floatingInput"
          label="Gas (in Wei)"
          className="mb-2 dark-text"
        >
        <Form.Control
          type="text"
          className="dark-text"
          placeholder="0"
          ref={this.valueGas}
        />
        </FloatingLabel>
      </Col>
      </Row>
      
      <Row>
      <Col>
        <FloatingLabel
          controlId="floatingInput"
          label="Gas price"
          className="mb-2 dark-text"
        >
        <Form.Control
          type="text"
          className="dark-text"
          placeholder="0"
          ref={this.priceGas}
        />
        </FloatingLabel>
      </Col>
      </Row>

      <Row>
      <Col>
        <FloatingLabel
          controlId="floatingInput"
          label="Data"
          className="mb-2 dark-text"
        >
        <Form.Control
          type="text"
          className="dark-text"
          placeholder="0"
          ref={this.transactionData}
        />
        </FloatingLabel>
      </Col>
      </Row>

      <Row>
      <Col>
        <FloatingLabel
          controlId="floatingInput"
          label="Nonce"
          className="mb-2 dark-text"
        >
        <Form.Control
          type="text"
          className="dark-text"
          placeholder="0"
          ref={this.nonce}
        />
        </FloatingLabel>
      </Col>
      </Row>

      <Row>
      <Col> 
        <Button
          type="button"
          variant="primary"
          disabled={this.state.isLoading}
          onClick={!this.state.isLoading ? this.handleClick : null}
        >
          {this.state.isLoading ? "Loading…" : "Send transaction"}
        </Button>
      </Col>
      </Row>
      </Form>

      <br/>
      <div id="transacionDetailsOutput">
        {(this.state.errorMsg === undefined || this.state.errorMsg === "") ? 
        ((this.state.tokenBalance !== undefined) 
          ? this.state.contractName + ": " + this.state.tokenBalance + " " + this.state.contractSymbol
          : ""
        ) 
        :
        (<Alert variant="danger"> {this.state.errorMsg} </Alert>)
        }
      </div>
    </div>
    return (retElement)
  }
}

export {SendEthTransaction}