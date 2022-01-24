import {Badge} from 'react-bootstrap'

function ProviderInfo (props) {
    let connected = props.connected;
    let metaMask = false;
    let providerString = "";
    
    if ( typeof(props.provider) !== "undefined" )  {
        if ( props.provider.currentProvider.isMetaMask ) {
            providerString = "MetaMask";
            metaMask = true;
        }
        else if (props.provider.currentProvider.host)  {
            providerString = props.provider.currentProvider.host;
        }
        else {  
            providerString = 'other/unknown';
        }
    }
    
    /*
    return (
        <div id="ProviderInfo" className="top-margin">
        { (true) ? ('Web3 provider: ' + providerString + ' ') : ' ' }
        <Badge bg = { connected ? 'success' : 'warning' }> { connected ? 'Connected!' : 'Not connected' } </Badge>
        </div>
    )
    */
    return (
        <div id="ProviderInfo" className="top-margin">
        <Badge bg = { connected ? 'success' : 'warning' }> { connected ? 'Connected!' : 'Not connected' } </Badge>
        </div>
    )
  }

export {ProviderInfo}