import {Button, FloatingLabel, Form, Alert} from 'react-bootstrap'
import React from 'react';

class TokenBalance extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      isLoading : false,
      contractAddress : "0x0d8775f648430679a709e98d2b0cb6250d2887ef", //undefined,
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
    
    this.getBalance = this.getBalance.bind(this);
    this.handleClick = this.handleClick.bind(this);
  
    const BATtokenAddress = "0x0d8775f648430679a709e98d2b0cb6250d2887ef"; 
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
      console.log(errorMsg);
    }
    let formatedBalance = (result !== undefined) ? web3.utils.fromWei(result) : 0 ;
    return {formatedBalance, errorMsg};
  }
  
  handleClick() {
    console.log('click!');
    console.log(this.props.web3);
    this.setState({isLoading : true});  
    this.getBalance(this.props.web3, this.props.account, this.minABI, this.state.contractAddress).then((res) => {
      console.log(res.formatedBalance);
      console.log(res.errorMsg);
      this.setState({isLoading : false, tokenBalance : res.formatedBalance, errorMsg : res.errorMsg});
    })
    ;
  }
  
  render() {
  let retElement =
    <div id = "tokenBalanceChecker" className = "top-margin">
      <Form
        // onSubmit={this.handleClick}
      >
      <FloatingLabel
          controlId="floatingInput"
          label="Contract address"
          className="mb-2 dark-text"
      >
      <Form.Control type="text" placeholder="0x0000000000000000000000000000000000000000" />
      </FloatingLabel>
      <Button
        type="submit"
        variant="primary"
        disabled={this.state.isLoading}
        onClick={!this.state.isLoading ? this.handleClick : null}
      >
        {this.state.isLoading ? "Loading…" : "Get token balance"}
      </Button>
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