import {ListGroup, Badge} from 'react-bootstrap'
import ClipboardJS from 'clipboard'

function TransactionInfo (props) {
    let transactionObject = props.transactionObject;
    console.log(transactionObject);
    let transactionConfirmed = false;

    let clipboard = new ClipboardJS(".eth-copy-tx-info");

    //check for confirmation
    if (transactionObject.confirmationNumber !== undefined) transactionConfirmed = transactionObject.confirmationNumber;

    let listItems = Object.entries(transactionObject).map((key, value) => {
        let returnListItem = "";


        let excludeFieldArray = ["logs", "logsBloom","from","to","status"];
        if (key[1] !== null && !excludeFieldArray.includes(key[0])) {
          //construct output row
          returnListItem =
            <ListGroup.Item key={key[0]} className="App-content">
            <div className="transaction-details">
              <p>
                {(transactionConfirmed && (key[0] === "transactionHash")) ? 
                (<Badge  bg="success"> Confirmed {transactionConfirmed} blocks! </Badge>) :
                "" }
              </p>
              <span className="transaction-details-label">
                {key[0]}
                <a className="eth-copy-tx-info" data-clipboard-text={key[1]}> 
                &#128203;
                </a>
              </span> 
              <br/>
              <span className="transaction-details-data">
                {key[1]}
              </span>
            </div>
            </ListGroup.Item>;
        }
        return returnListItem;  
    }); 

    return(
      <div id = "transactionDetailsFields">
        <ListGroup variant="flush"> {listItems} </ListGroup>
      </div>)
}

export {TransactionInfo}