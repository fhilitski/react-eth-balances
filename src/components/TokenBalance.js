import {Button, FloatingLabel, Form, Row, Col} from 'react-bootstrap'
import {useEffect, useState} from 'react';

function TokenBalance (props) {

  const [isLoading, setLoading] = useState(false);
  const handleClick = () => setLoading(true);

  let account = props.account;
  let web3 = props.web3;
  const minABI = [
    // The minimum ABI required to get the ERC20 Token balance
    // balanceOf ERC-20 function
    {
      constant: true,
      inputs: [{ name: "_owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "balance", type: "uint256" }],
      type: "function"
    }];

  const BATtokenAddress = "0x0d8775f648430679a709e98d2b0cb6250d2887ef"; //BAT contract is 0x0d8775f648430679a709e98d2b0cb6250d2887ef 
  let tokenAddress = BATtokenAddress;

  async function getBalance(ethAccount, abi, tokenAddress) {
    let contract = new web3.eth.Contract(abi, tokenAddress);
    let result = undefined;
    let errorMsg = "";
    try {
      result = await contract.methods.balanceOf(ethAccount).call();
    }
    catch (e) {
      errorMsg = "Error getting token balance: " + e;
      console.log(errorMsg);
    }
    let formatedBalance = (result !== undefined) ? web3.utils.fromWei(result) : 0 ;
    return {formatedBalance,errorMsg};
  }

  useEffect(() => {
    if (isLoading) {  
     
        getBalance(account,minABI, BATtokenAddress ).then((res) => {
        setLoading(false);
        console.log(res.formatedBalance);
        console.log(res.errorMsg);
      });
    }
  }, [isLoading]);
    
  let retElement =
    <div id = "tokenBalanceChecker" className = "top-margin">

      <Form onSubmit={handleClick}>
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
        disabled={isLoading}
        onClick={!isLoading ? handleClick : null}
      >
        {isLoading ? 'Loading…' : 'Get token balance'}
      </Button>
      </Form>
    </div>
  return (retElement)
}
export {TokenBalance}