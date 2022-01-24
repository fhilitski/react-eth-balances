import {ListGroup, Badge, Alert} from 'react-bootstrap'

function AccountsList (props) {
    let accounts = props.accounts;
    let balances = props.balances;
    let accountList;

    if ( accounts.length === 0 ) {
      //connected, no accounts available
      accountList = 
        <div className="top-margin"> 
          <Alert variant='warning'>
            Provider has no accounts configured for this site. 
          </Alert>
        </div>;
    }
    else {
      accountList = accounts.map((element, index) => {
        let balance =  (isNaN(Number(balances[index]))) ? balances[index] : ("Balance: " + Number(balances[index]) + ' Eth') ;
        console.log(balance);
        return(
        <ListGroup.Item
          as="li"
          className="d-flex justify-content-between align-items-start App-content" 
          key = {index}
        >
        <div className="ms-2 me-auto">
          <div className="fw-bold"> {element} </div>
          {balance}
        </div>
        <Badge variant="primary" pill>
          { index + 1}
        </Badge>
        </ListGroup.Item>)
      }); 
    }   
        //console.log('Balances now: ' + balances);
      accountList = <ListGroup as="ol" numbered> {accountList} </ListGroup>;

    let retElement =
      <div id = "accountList" className = "top-margin" >
          {accountList}
      </div>

    return (retElement)
  }

export {AccountsList}