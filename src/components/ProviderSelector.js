import {ListGroup, Badge, Alert} from 'react-bootstrap'
import Form from 'react-bootstrap/Form'

import Web3 from 'web3';


function ProviderSelector(props) {
    //
    let providers = props.providers;
    let selectOptions = undefined;
    
    /*
    for (let opt of providers) {
      console.log(opt);
      selectOptions = selectOptions +  <option value={opt}> +  {opt} + </option>;
    }
    */

    selectOptions = providers.map((value,index) => {
      let optionString = (value.isMetaMask) ? "MetaMask" : value;
      return(
        <option value={index} key={index}>{optionString}</option>
      )
    });

    //console.log(selectOptions);

    let retElement =
      <div id="providerSelector" className="top-margin">
        Web3 provider 
        <Form.Select aria-label="Select Web3 provider">  
          {selectOptions}
        </Form.Select>
      </div>

    return (retElement)
  }

export {ProviderSelector}