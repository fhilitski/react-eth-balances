import {Badge} from 'react-bootstrap'

function ProviderInfo (props) {
    let connected = props.connected;
    let providerString = "";
    let chainID = props.chainID;
    let description = "";
    
    const chains = new Map();
    
    chains.set(1, {network: "Mainnet"});
    chains.set(3, {network: "Ropsten"});
    chains.set(4, {network: "Rinkeby"});
    chains.set(5, {network: "Goerli"});
    chains.set(42,{network: "Kovan"});
    description = (chains.has(chainID)) ? chains.get(chainID).network : "ChainID: " + chainID;

    if ( typeof(props.provider) !== "undefined" )  {
        if ( props.provider.currentProvider.isMetaMask ) {
            providerString = "MetaMask";
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
        { ( description !== "") ? <Badge bg="">{description}</Badge> : ""}
        </div>
    )
  }

export {ProviderInfo}