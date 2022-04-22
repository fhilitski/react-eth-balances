import {Stack, Button, FloatingLabel, Form, Alert, Row, Col, Spinner, Tooltip, OverlayTrigger} from 'react-bootstrap'
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
    this.sendTx = this.sendTx.bind(this);
    this.signTx = this.signTx.bind(this);
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

  async validateTxInput(){
    /* Validates form inputs and returns {inputIsValid, transactionObject} */
    let transactionObject = undefined;
    let inputIsValid = false;
  
    /* these are form input field */
    let fromAddress = this.accountFrom.current.value;
    let toAddress = this.accountTo.current.value;
    let valueEth = this.valueEth.current.value;
    let valueGas = this.valueGas.current.value;
    let priceGasInWei = this.priceGas.current.value;
    let transactionData = this.transactionData.current.value;
    let nonce = this.nonce.current.value;;

    /* Check that the entered address is correct */
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
    /* And this is another wau to check address */
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

    if (inputIsValid) {
      try { 
        this.props.web3.utils.numberToHex(valueGas);
      }
      catch (problem) {
        inputIsValid = false; 
        this.setState({errorMsg : problem.toString()})
      }
      finally {
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
      transactionObject = {
        from:  fromAddress,
        to:    toAddress,
        value: valueEthInWei
      };
      console.log(transactionObject);
      if (valueGas !== "" ) transactionObject.gas = valueGas;
      if (priceGasInWei !== "" ) transactionObject.gasPrice = priceGasInWei;
      if (transactionData !== "") transactionObject.data = this.props.web3.utils.utf8ToHex(transactionData);
      if (nonce !== "") transactionObject.nonce = nonce;
      console.log(transactionObject);
    }

    return {inputIsValid, transactionObject}
  }

  signTx(){
    console.log('calling eth.signTransaction');
    let signedTranaction = undefined;
    let errorMsg = "";

    this.validateTxInput().then(response => {
      if (response.inputIsValid) {
        this.setState({isLoading : true, errorMsg : undefined});  
        this.props.web3.eth.signTransaction(response.transactionObject, response.transactionObject.from)
        .then( response => {console.log(signedTranaction);
          this.setState({isLoading : false, transactionReceipt : signedTranaction});})
          
        .catch((error) => {
          errorMsg = error.message;
          this.setState({isLoading : false, errorMsg: ((error.message === undefined) ? error.toString() : error.message)})
        }); 
      }
    });

  }

  sendTx() {
    this.validateTxInput().then(response => {
      if (response.inputIsValid) {
        this.setState({isLoading : true, errorMsg : undefined});  
        this.props.web3.eth.sendTransaction(response.transactionObject)
        //.once('sending', console.log)
        .on('recept', (receipt) => {
          console.log(receipt);
          this.setState({isLoading : false, transactionReceipt : receipt});
        })
        .on('confirmation', (confirmationNumber, receipt) => {
          console.log("Transaction confirmed, " + confirmationNumber + " confirmations.");
          receipt.confirmationNumber = confirmationNumber;
          this.setState({isLoading : false, transactionReceipt : receipt});
        })
        .on('error', (error) =>
           { this.setState({isLoading : false, errorMsg: ((error.message === undefined) ? error.toString() : error.message)})}
        );
      }
    });
  }
  
  render() {
    const  gasValueTooltip = (props) => (
      <Tooltip id="gasValue-tooltip" {...props}>
        Maximum # of gas units to consume during this transaction  
      </Tooltip>
    );

    let retElement =
      <div id="transactionConfiguration" className="top-margin min-width " >
      <Stack direction="horizontal" gap={3} className="align-items-start" > 
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
        <OverlayTrigger overlay={gasValueTooltip}>
        <FloatingLabel
          controlId="floatingInput"
          label="Gas limit (units)"
          className="mb-2 dark-text"
        >
        <Form.Control
          type="number"
          className="dark-text"
          ref={this.valueGas}
          defaultValue={undefined}
        />
        </FloatingLabel>
        </OverlayTrigger>
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
          onClick={!this.state.isLoading ? this.sendTx : null}
        >
          {this.state.isLoading ? "Sending…" : "Send transaction"}
        </Button>
      </Col>
      <Col> 
        <Button
          type="button"
          variant="primary"
          disabled={this.state.isLoading}
          onClick={!this.state.isLoading ? this.signTx : null}
        >
          {this.state.isLoading ? "Signing…" : "Sign transaction"}
        </Button>
      </Col>
      </Row>
      </Form>
      </div>

      <div className="min-width">
      <div id="transacionDetailsOutput">
        {(this.state.errorMsg === undefined || this.state.errorMsg === "") ? 
        (
          (this.state.transactionReceipt !== undefined) 
          ? (<TransactionInfo transactionObject={this.state.transactionReceipt}/>)
          : (
            (this.state.isLoading) ?  (<Spinner animation="border" variant="secondary" />)  : ("")
            )
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