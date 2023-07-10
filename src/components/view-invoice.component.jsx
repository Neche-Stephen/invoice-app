import React, { useEffect } from 'react';
import { Container, Row, Col, Table,Spinner } from 'react-bootstrap';
import './invoice.css'
import { v4 as uuid } from 'uuid';
import Image from 'react-bootstrap/Image'
import LOGO from '../images/logo.png';
import { collection, getDocs, query, where, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase.utils';
import { useNavigate } from 'react-router';
import { useState} from 'react';
import { HouseFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';

const defaultCustomerDetails = {
  cName : '',
  cAddress: '',
  cEmail: '',
  invoiceId: '',
};

const ViewInvoice = () => {
  const [loading, setLoading] = useState(true);
  const [customerDetails, setCustomerDetails] = useState(defaultCustomerDetails)
  const { cName, cEmail, cAddress,invoiceId, Amount_Paid, Payment_Status} = customerDetails;
  const [ items, setItems] = useState([]);
  const id = sessionStorage.getItem('invoiceId', invoiceId)
  const [date, setDate] = useState('')
  
  const fetchInvoice = async (invoiceId) =>{
    console.log(invoiceId)
    const invoiceCollectionRef = collection(db, 'invoice');
    const q = query(invoiceCollectionRef, where('invoiceId', '==', invoiceId ));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const customerInvoiceDocRef = querySnapshot.docs[0].ref;
      // console.log('Document reference:', customerInvoiceDocRef );
      const invoiceSnapshot = await getDoc(customerInvoiceDocRef);
      if (invoiceSnapshot.exists()) {
        const invoiceData = invoiceSnapshot.data();
        let myDate = invoiceData.createdAt;
        myDate = myDate.toDate()
        setDate(myDate)
        setCustomerDetails(invoiceData);
      }

        // Create a subcollection ref to access the documents in the items subcollection
        const ItemsSubCollectionRef = collection(customerInvoiceDocRef , 'items');
        // Retrieve the documents in the items subcollection and store in the items state
        const subCollectionSnapshot = await getDocs(ItemsSubCollectionRef);
        let theItems = [] //array to store items document
        subCollectionSnapshot.forEach((doc) => {
          // console.log(doc.id, ' => ', doc.data());
          theItems.push(doc.data())
        });
        setItems(theItems) //storing the items in the items state
        
        setLoading(false)

    } else {
      console.log('No documents found');
    }
  }

  const totalAmount = ()=>{
    let currency = items[0].currency;
    let amt =  items.reduce((accumulator, currentElement) =>{
      return (accumulator + currentElement.itemQuantity * currentElement.itemCost)
      }, 0)
    if (currency != ''){
      amt = amt.toLocaleString('en-US', {
        style: 'currency',
        currency: currency,
      });
    }
      return amt
  }

  const amountPaid = ()=>{
    let currency = items[0].currency;
    let amt = parseFloat(Amount_Paid);
    if (currency != ''){
    amt = amt.toLocaleString('en-US', {
        style: 'currency',
        currency: currency,
      });
    }
      return amt;
  }
  
  const balanceDue = ()=>{
    let currency = items[0].currency;
    let total = items.reduce((accumulator, currentElement) =>{
      return (accumulator + currentElement.itemQuantity * currentElement.itemCost)
      }, 0)
    let paid = parseFloat(Amount_Paid.replace(/[^\d.-]/g, ""));
    let balanceDue = parseFloat((total - paid));
    return balanceDue.toLocaleString('en-US', {
      style: 'currency',
      currency: currency,
    });
  }

  useEffect(()=>{
    fetchInvoice(id);
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
    <Container fluid className=''>
        <Row className='invoice-component-top-header'>
          <Col className='p-2' xs = ''>
              {Payment_Status === 'Paid' ? <div>RECEIPT</div> : <div>INVOICE</div>}
          </Col>
        </Row>
        <Row className='invoice-component-header'>
            <Col lg="9" xs='8'>
                <p>RAD5 Tech Hub Ltd.</p>
                <p>3rd Floor, 7 Factory Road by Eziukwu Road Aba</p>
                <p>Abia State, Nigeria.</p>
                <p>(+234) 81-881-55501 </p>
            </Col>
            <Col lg="3" xs='4' >  
              <Image src={LOGO}/>
            </Col>
        </Row>
      {/* Bill to */}
      <Row className='mt-4'>
        <Col className='bill-to' xs='6' sm='8'>
            <p>Bill To:</p>
            <h4 className=''><strong>{cName.replace(/\b(\w)/g, m => m.toUpperCase())}</strong></h4>
            <p>{cAddress}</p>
        </Col>
        <Col className='' sm='3' xs='4'>
          <Table striped bordered style={{ border: '1px solid #ccc' }}>
            <thead>
            <tr>
                <td style={{ padding: '10px', backgroundColor: '#e9e9e9' }}>Invoice #</td>
                <td style={{ padding: '10px' }}>{invoiceId}</td>
              </tr>
            </thead>
              <tbody>
              <tr>
                <td style={{ backgroundColor: '#e9e9e9', padding: '10px' }}>Date</td>
                <td style={{ padding: '10px' }}>{date instanceof Date ? date.toLocaleDateString() : ''}</td>
              </tr>
              <tr>
                <td style={{backgroundColor: '#e9e9e9', padding: '10px' }}>Amount Due</td>
                <td style={{ padding: '10px' }}>{balanceDue()}</td>
              </tr>
              </tbody>
          
          </Table>
        </Col>
      </Row>
      <Row>
        <Col xs = '11' sm = '12'>
          <Table striped bordered hover responsive>
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
                    const itemCost = parseFloat(item.itemCost);
                    const formattedItemCost = itemCost.toLocaleString('en-US', {
                      style: 'currency',
                      currency: item.currency,
                    });
                    const itemTotalAmount = item.itemQuantity * item.itemCost
                    const formattedItemTotalAmount = itemTotalAmount.toLocaleString('en-US', {
                      style: 'currency',
                      currency: item.currency,
                    });
                  return (
                    <tr key={uuid()}>
                    <td>{item.itemName}</td>
                    <td>{item.itemDescription}</td>
                    <td>{item.itemQuantity}</td>
                    <td>{formattedItemCost}</td>
                    <td>{formattedItemTotalAmount}</td>
                </tr>
                  )
                  })
                }
            
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}>Total Amount</td>
                <td>{totalAmount()}</td>
                </tr>
              <tr>
                  <td colSpan={4}>Amount Paid</td>
                  <td>{Amount_Paid}</td>
              </tr>
              <tr>
                <td colSpan={4}>Balance Due</td>
                <td>{
                  balanceDue()
                  }</td>
              </tr>
            </tfoot>
          </Table>
        </Col>
      </Row>
      <Row className='signature justify-content-center'>
          <Col xs = 'auto'> <h5 class="invoice-component-signature">Signature </h5></Col>
          <hr />
      </Row>
      <Row className='email justify-content-center'>
          <Col xs='auto'><p>http://rad5.com.ng,  info@rad5.com.ng</p></Col>
      </Row>
      <Row className='justify-content-center'>
          <Col xs='auto'><h5 class="invoice-component-signature">Payment </h5></Col><hr />
      </Row>
      <Row className='justify-content-center'>
          <Col xs ='auto'>
            {items[0].currency === "NGN" ?
            <p>This invoice is active for 2weeks. Payment should be made to RAD5 Tech Hub - 0251466366 - Guaranty Trust Bank Plc</p> 
            : items[0].currency === "EUR" ? <p>This invoice is active for 2weeks. Payment should be made to RAD5 Tech Hub -  0791713104 - Guaranty Trust Bank Plc, Swift Code: GTBINGLA,
            Branch Sort Code: 058235212</p> : <p>no account for this currency</p>  }
            </Col>
      </Row>
    </Container>
  </div>
};

export default ViewInvoice;
