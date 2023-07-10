<Container className='mt-3'>
<Row className='justify-content-between'>
  <Col  xs = '2' sm = '2' md ='3'>
      <Link onClick={handleRetrieveInvoice} style={{textDecoration : 'none'}} className='dashboard-home'>Retrive All Invoices</Link>
  </Col>
  <Col xs = '2' md = '2'>
    <p className='dashboard-signout' onClick={handleSignOut}  >Sign Out</p>
  </Col>
  <Modal show={showSignout} onHide={handleClose}>
  <Modal.Header closeButton>
        You are now signed out
    </Modal.Header>
      {/* <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleClose}>
          Save Changes
        </Button>
      </Modal.Footer> */}
  </Modal>
</Row>
<Row className='justify-content-center mt-5'>
  <Col xs ='auto'><p>Welcome, {userEmail}</p></Col>
</Row>
<Row className='justify-content-center'>
  <Col xs ='auto'><h5><Badge bg="primary">{numberInvoices} Invoice(s) created</Badge></h5></Col>
</Row>
{/* Create a new invoice */}
<Row className='justify-content-center mt-5'>
  <Col xs ='auto'><Button type='button' variant="light" onClick={handleCreateInvoice}>Create a New Invoice</Button></Col>
  <Col xs ='auto'>
    <Form.Group className="mb-3" controlId="formBasicEmail">
      <Form.Control type="text"value={searchInvoiceId}
      onChange={(e) => setSearchInvoiceId(e.target.value)}
      placeholder="Enter Invoice ID" />
      <Form.Text className="text-muted" ref = {searchText}>
      </Form.Text>
    </Form.Group>
  </Col>
  <Col xs ='auto'>
 <Button variant='light' onClick={()=>{handleSearch(searchInvoiceId)}}>Search</Button>
  </Col>
  <Col xs = 'auto'>
     { searching ? <Spinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>: <div></div>}
  </Col>

</Row>
{ loggingOut ? <Row className='justify-content-center mt-5'>
  <Col xs={1}>
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  </Col>
</Row>:
<div></div>}
<Row className='justify-content-center mt-5'>
  <Col>
      <h4>Recent Invoices</h4>
  </Col>
</Row>
<Row>
    <Col>
    <Table striped bordered hover>
        <thead>
          <tr>
            <th>Date Created</th>
            <th>Invoice ID</th>
            <th>Customer</th>
            <th>View Invoice</th>
          </tr>
        </thead>
        <tbody>
        {
          myInvoices.filter((invoice, index) => index < 4 )
              .map(invoice => {
                // console.log(invoice.createdAt)
                let aDate =  invoice.createdAt
                aDate = aDate.toDate();
                aDate = aDate.toLocaleDateString();
                const dateString =  aDate;
                // Split the date string into day, month, and year
                const [month, day, year] = dateString.split('/');

                // Create a new Date object using the extracted values
                const date = new Date(`${month}/${day}/${year}`);

                // Format the date as "day monthName year" (e.g., "9th May 2023")
                const options = { day: 'numeric', month: 'long', year: 'numeric' };
                const formattedDate = date.toLocaleDateString('en-US', options);
                // console.log(formattedDate);
              return (
                <tr key={uuid()}>
                {/* <td>{aDate instanceof Date ? aDate.toLocaleDateString() : ''}</td> */}
                <td>{formattedDate}</td>
                <td>{invoice.invoiceId}</td>
                <td>{invoice.cName}</td>
                <td>
                    <Eye onClick={() => {viewInvoice(invoice.invoiceId)}} style={{cursor:'pointer'}} />
                  {/* </Button> */}
                  </td>
            </tr>
              )
              })
            }
        
        </tbody>
  <tfoot>
  <tr>
    <td></td>
    <td></td>
    <td></td>
    </tr>
  </tfoot>
  </Table>
    </Col>

</Row>
</Container>