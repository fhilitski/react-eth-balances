import Form from 'react-bootstrap/Form'

function ProviderSelector(props) {
    //
    let providers = props.providers;
    let selectOptions = undefined;
    
    selectOptions = providers.map((value,index) => {
      let optionString = (value.isMetaMask) ? "MetaMask" : value;
      return(
        <option value={index} key={index}>{optionString}</option>
      )
    });

    let retElement =
      <div id="providerSelector" className="top-margin">
        <Form.Select aria-label="Select Web3 provider" onChange={props.onChange}>  
          {selectOptions}
        </Form.Select>
      </div>

    return (retElement)
  }

export {ProviderSelector}