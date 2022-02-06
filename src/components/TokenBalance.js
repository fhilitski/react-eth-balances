import {Button, FloatingLabel, Form, Alert, Row, Col} from 'react-bootstrap'
import React from 'react';

class TokenBalance extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      isLoading : false,
      contractAddress : undefined,
      tokenBalance : undefined,
      errorMsg : undefined
    }

    this.account = props.account;
    this.web3 = props.web3; 
    this.minABI = [{
      // The minimum ABI required to get the ERC20 Token balance
      // balanceOf ERC-20 function
        constant: true,
        inputs: [{ name: "_owner", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "balance", type: "uint256" }],
        type: "function"
    }];
    
    this.accountInput = React.createRef();

    this.getBalance = this.getBalance.bind(this);
    this.handleClick = this.handleClick.bind(this);
  
    //const BATtokenAddress = "0x0d8775f648430679a709e98d2b0cb6250d2887ef"; 
    //BAT contract is 0x0d8775f648430679a709e98d2b0cb6250d2887ef 
  }

  //const [isLoading, setLoading] = useState(false);
  //const handleClick = () => setLoading(true);

  //let account = props.account;
  //let web3 = props.web3;
  /*const minABI = [
    // The minimum ABI required to get the ERC20 Token balance
    // balanceOf ERC-20 function
    {
      constant: true,
      inputs: [{ name: "_owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "balance", type: "uint256" }],
      type: "function"
    }];
  */
  
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
  
  handleClick(event) {
    let contractAddress = this.accountInput.current.value;
    //check that the entered address is correct
    let contractChecksumAddress = undefined;
    /* try {
      contractChecksumAddress = this.props.web3.utils.toChecksumAddress(contractAddress);
    }
    catch (e) {
      let errorMsg = e.toString();
      console.log(errorMsg);
    }
    */
    if (this.props.web3.utils.isAddress(contractAddress)) {
      this.setState({isLoading : true, contractAddress : contractAddress});  
      this.getBalance(this.props.web3, this.props.account, this.minABI, contractAddress).then((res) => {
        console.log("Formatted balance: " + res.formatedBalance);
        console.log("Error message: " + res.errorMsg);
        this.setState({isLoading : false, tokenBalance : res.formatedBalance, errorMsg : res.errorMsg});
      });
    }
    else {
      this.setState({errorMsg : "Error: Invalid contract address!"})
    }
  }
  
  render() {
  let retElement =
    <div id="tokenBalanceChecker" className="top-margin" >
      <Form>
      <Row>
      <Col xs={12} md={8}>
        <FloatingLabel
        controlId="floatingInput"
        label="Contract address"
        className="mb-2 dark-text"
        >
        <Form.Control
          type="text"
          className="dark-text"
          placeholder="0x0000000000000000000000000000000000000000"
          ref={this.accountInput}
        />
        </FloatingLabel>
      </Col>
      <Col xs={6} md={4}> 
        <Button
          type="button"
          variant="primary"
          disabled={this.state.isLoading}
          onClick={!this.state.isLoading ? this.handleClick : null}
        >
          {this.state.isLoading ? "Loading…" : "Get token balance"}
        </Button>
      </Col>
      </Row>
      </Form>
      <br/>
      <div id="tokenBalanceOutput">
        {(this.state.errorMsg === undefined || this.state.errorMsg === "") ? 
        ((this.state.tokenBalance !== undefined) ? "Token balance: " + this.state.tokenBalance : "") 
        : 
        (<Alert variant="danger"> {this.state.errorMsg} </Alert>)
        }
      </div>
    </div>
    return (retElement)
  }
}

export {TokenBalance}