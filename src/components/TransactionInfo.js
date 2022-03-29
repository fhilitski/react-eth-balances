import {ListGroup, Badge, Alert, NavItem} from 'react-bootstrap'

function TransactionInfo (props) {
    let transactionObject = props.transactionObject;
    console.log(transactionObject);
    let transactionConfirmed = false;

    //check for confirmation
    if (transactionObject.confirmationNumber !== undefined) transactionConfirmed = transactionObject.confirmationNumber;

    let listItems = Object.entries(transactionObject).map((key, value) => {
        let returnListItem = "";


        let excludeFieldArray = new Array("logs", "logsBloom","from","to","status");
        if (key[1] !== null && !excludeFieldArray.includes(key[0])) {
          //construct output row
          returnListItem =
            <ListGroup.Item
              key={key[0]}
              className="App-content"
            >
            
            <div className="transaction-details">
              {(transactionConfirmed && key[0] == "transactionHash") ? (<Badge  bg="success"> Confirmed {transactionConfirmed} blocks! </Badge>) : "" }
              <span
                className="transaction-details-label"
                id="transactionDetailFieldName"
              >
                {key[0]}
              </span> 
              <br/>
              <span id="transactionDetailFieldValue">
                {key[1]}
              </span>
            </div>
            
            </ListGroup.Item>;
         
        }
        return returnListItem;  
    }); 
    
    let transactionDetails = <ListGroup variant="flush"> {listItems} </ListGroup>;

    let retElement =
      <div id = "transactionDetailsFields">
          {transactionDetails}
      </div>
    return (retElement)
}

export {TransactionInfo}