import {ListGroup, Badge, Alert} from 'react-bootstrap'

function TransactionInfo (props) {
    let transactionObject = props.transactionObject;

    let listItems = Object.entries(transactionObject).map((key, value) => {
        return(
        <ListGroup.Item
          className="d-flex justify-content-right align-items-start App-content min-width" 
          key={key}
        >
        <div className="ms-2 me-auto ">
        <p className="fw-bold">{key[0]}</p>
        <p>{key[1]}</p>
        </div> 
        </ListGroup.Item>)
      }); 
    
    let accountList = <ListGroup variant="flush"> {listItems} </ListGroup>;

    let retElement =
      <div id = "accountList" className = "top-margin">
          {accountList}
      </div>
    return (retElement)
}

export {TransactionInfo}