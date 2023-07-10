import React from 'react';
import { Container, Row, Col, Table, Spinner } from 'react-bootstrap';
import './invoice.css'
import { v4 as uuid } from 'uuid';
import Image from 'react-bootstrap/Image'
import LOGO from '../images/logo.png';
import { HouseFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
// import 'bootstrap-icons/font/bootstrap-icons.css';

const defaultCustomerDetails = {
  cName : '',
  cAddress: '',
  cEmail: '',
};

const Invoice = () => {

  const uid = sessionStorage.getItem("uid");
  const [loading, setLoading] = useState(true);
  const [customerDetails, setCustomerDetails] = useState({})
  const { cName, cEmail, cAddress} = customerDetails;
  const [ items, setItems] = useState([]);
  const [invoiceId, setInvoiceId]  = useState('');
  const [ formattedDate, setFormattedDate] = useState('');

  const fetchInvoiceDetails = async () =>{
    //Get invoice customer data
  const invoiceDataString = sessionStorage.getItem('invoiceData');
  const invoiceData = JSON.parse(invoiceDataString);
  setCustomerDetails(invoiceData);

  //Get items
  const itemsString = sessionStorage.getItem('items');
  const items = JSON.parse(itemsString);
  setItems(items);

  //Get Invoice Id
  const invoiceId = sessionStorage.getItem('invoiceId');
  setInvoiceId(invoiceId);

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
  const day = ('0' + currentDate.getDate()).slice(-2);
  const formattedDate = `${year}-${month}-${day}`;
  setFormattedDate(formattedDate)

  }

  useEffect(()=>{
    fetchInvoiceDetails();
    setLoading(false)
  }, [])
 
  
  
  return loading 
  ?
  <Container>
  <Row className='justify-content-center mt-5'>
      <Col xs={1}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Col>
  </Row>
</Container>
  :
  <div className='invoice-component'>
        <div className='no-print'>
          <p><Link to = '/dash'><HouseFill size={24} className='invoice-housefill'/></Link></p>
        </div>
        <Container className='mt-3 '>
          <Row className='header p-2 align-items-center'>
            <Col xs="6" >  
              <Image src={LOGO}/>
            </Col>
            <Col xs="6">
                <h4 className='mb-4'>Invoice</h4>   
                <h6><strong>Invoice Id</strong></h6>
                <p>{invoiceId}</p>
                <h6><strong>Date</strong></h6>
                <p>{formattedDate}</p>
            </Col>
          </Row>
          <Row className='mt-4'>
            <Col sm = '6'>
                <p><strong>Bill To:</strong></p>
                <p>{cName}</p>
                <p>{cAddress}</p>
                <p>{cEmail}</p>
            </Col>
            <Col sm = '6'>
                <p><strong>Bill From:</strong></p>
                <p>RAD5 Tech Hub Ltd.</p>
                <p>3rd Floor, 7 Factory Road by Eziukwu Road Aba</p>
                <p>Abia State, Nigeria.</p>
                <p>(+234) 81-881-55501 </p>
            </Col>
          </Row>
          <Row>
            <Col>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                {
                      items.map(item => {
                      return (
                        <tr key={uuid()}>
                        <td>{item.itemName}</td>
                        <td>{item.itemDescription}</td>
                        <td>{item.itemQuantity}</td>
                        <td>{item.itemCost}</td>
                        <td>{item.itemQuantity * item.itemCost}</td>
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
                  <td>Total Amount</td>
                      <td>{items.reduce((accumulator, currentElement) =>{
                            return accumulator + currentElement.itemQuantity * currentElement.itemCost;
                      }, 0)}</td>
                  </tr>
                </tfoot>
              </Table>
            </Col>
          </Row>
          <Row className='mt-3'>
              <Col>
              <h6><strong>Payment Details</strong></h6>
              <p><strong>Account Name:</strong> RAD5 Tech Hub</p>
              <p><strong>Account Number:</strong> 0251466366</p>
              <p><strong>Bank Name:</strong> Guaranty Trust Bank Plc</p>
              </Col>
          </Row>
          <Row>
            <p>Thanks for you patronage</p>
          </Row>
        </Container>
    </div>
};

export default Invoice;
