import {Stack, Button, FloatingLabel, Form, Alert, Row, Col} from 'react-bootstrap'
import React from 'react';
import { TransactionInfo } from './TransactionInfo';

class SendEthTransaction extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      transactionReceipt : undefined,
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

    //this.getBalance = this.getBalance.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }
  
  /*
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
  */

  handleClick() {
    let inputIsValid = false;

    let fromAddress = this.accountFrom.current.value;
    let toAddress = this.accountTo.current.value;
    let valueEth = this.valueEth.current.value;
    let valueGasInWei = this.valueGas.current.value;
    let priceGasInWei = this.priceGas.current.value;
    let transactionData = this.transactionData.current.value;
    let nonce = this.nonce.current.value;;

    console.log(fromAddress);
    console.log(toAddress);
    console.log(valueEth);
    console.log("valueGas: " + valueGasInWei);
    console.log("priceGas: " + priceGasInWei);
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
    if (inputIsValid) {
      try { 
        valueEthInWei = this.props.web3.utils.toWei(valueEth);
      }
      catch (problem) {
        inputIsValid = false; 
        this.setState({errorMsg : problem.toString()})
      };
    };

    let valueGas = undefined;
    if (inputIsValid) {
      try { 
        valueGas = this.props.web3.utils.fromWei(valueGasInWei);
      }
      catch (problem) {
        inputIsValid = false; 
        this.setState({errorMsg : problem.toString()})
      }
      finally {
        console.log('value Gas in ETH: ' + valueGas);
        if (valueGas < 0) {
          this.setState({errorMsg : "Gas should be non-negative!"});
          inputIsValid = false; 
        }
      }
    };

    let priceGas = undefined;
    if (inputIsValid) {
      try { 
        priceGas = this.props.web3.utils.fromWei(priceGasInWei);
      }
      catch (problem) {
        inputIsValid = false; 
        this.setState({errorMsg : problem.toString()})
      }
      finally {
        if (priceGasInWei < 0)
        this.setState({errorMsg : "Gas price should be non-negative!"})
      }
    };

    if (nonce !== "") {
      try {this.props.web3.utils.numberToHex(nonce)}
      catch (problem) {
        inputIsValid = false; 
        this.setState({errorMsg : problem.toString()})
      }
    };
    
    if (inputIsValid) {
      this.setState({isLoading : true, errorMsg : undefined});  
      let transactionObject = {
        from:  fromAddress,
        to:    toAddress,
        value: valueEthInWei
      };
      console.log(transactionObject);
      
      if (valueGasInWei !== "" ) transactionObject.gas = valueGasInWei;
      if (priceGasInWei !== "" ) transactionObject.gasPrice = priceGasInWei;
      if (transactionData !== "") transactionObject.data = this.props.web3.utils.utf8ToHex(transactionData);
      if (nonce !== "") transactionObject.nonce = nonce;

      console.log(transactionObject);

      this.props.web3.eth.sendTransaction(transactionObject)
      //.once('sending', console.log)
      .on('recept', (receipt) => {
        console.log(receipt);
        this.setState({isLoading : false, transactionReceipt : receipt});
      })
      .on('confirmation', (confirmationNumber, receipt) => {
        this.setState({isLoading : false, transactionReceipt : receipt});
        console.log('Transaction confirmed!');
      })
      .on('error', (error) => { this.setState({isLoading : false, errorMsg: ((error.message === undefined) ? error.toString() : error.message)})}
      );
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
    <div id="transactionConfiguration" className="top-margin min-width " >
     <Stack direction="horizontal" gap={3}> 
      <div className="min-width">
      <Form noValidate validated={false}>
      <Row>
      <Col>
        <FloatingLabel
          controlId="floatingInput"
          label="From address"
          className="mb-2 dark-text"
        >
        <Form.Control
          //readOnly
          //disabled
          type="text"
          name="fromAddress"
          className="dark-text"
          placeholder={this.props.account}
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
          defaultValue="0x0000000000000000000000000000000000000000"
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
          type="number"
          className="dark-text"
          ref={this.valueEth}
        />
        <Form.Control.Feedback type="invalid">
            Please provide a valid amount
        </Form.Control.Feedback>
        </FloatingLabel>
      </Col>
      </Row>

      <Row>
      <Col>
        <FloatingLabel
          controlId="floatingInput"
          label="Gas limit (Wei)"
          className="mb-2 dark-text"
        >
        <Form.Control
          type="number"
          className="dark-text"
          ref={this.valueGas}
          defaultValue={undefined}
        />
        </FloatingLabel>
      </Col>
      </Row>
      
      <Row>
      <Col>
        <FloatingLabel
          controlId="floatingInput"
          label="Gas price (Wei)"
          className="mb-2 dark-text"
        >
        <Form.Control
          type="text"
          className="dark-text"
          defaultValue={undefined}
          ref={this.priceGas}
        />
        </FloatingLabel>
      </Col>
      </Row>

      <Row>
      <Col>
        <FloatingLabel
          controlId="floatingInput"
          label="Data (optional, plaintext)"
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
          label="Nonce (optional)"
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
          {this.state.isLoading ? "Sending…" : "Send transaction"}
        </Button>
      </Col>
      </Row>
      </Form>
      </div>

      <div className="min-width">
      <br/>
      <div id="transacionDetailsOutput">
        {(this.state.errorMsg === undefined || this.state.errorMsg === "") ? 
        ((this.state.transactionReceipt !== undefined) 
          ? (<TransactionInfo transactionObject={this.state.transactionReceipt}/>)
          : ""
        ) 
        :
        (<Alert variant="danger"> {this.state.errorMsg} </Alert>)
        }
      </div>
      </div>
     </Stack> 
    </div>
    return (retElement)
  }
}

export {SendEthTransaction}