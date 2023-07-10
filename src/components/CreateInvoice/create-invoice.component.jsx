import React from 'react';
import { useState, useRef, useEffect} from 'react';
import { useNavigate, Link } from "react-router-dom";
import { createInvoiceDocumentFromAuth, db } from '../../utils/firebase.utils';
import {
  getDocs,
  getDoc,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc, orderBy, query, where, limit, getCountFromServer
} from "firebase/firestore";
import { Form, Container, Row, Col, Button, Spinner, Modal, Offcanvas} from 'react-bootstrap';
import { Table } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';
import { getAuth, signOut } from "firebase/auth";
import './create-invoice.css';
import { HouseFill, Trash, Eye, PlusCircleFill, BoxArrowDownRight, ChevronRight, ChevronLeft } from 'react-bootstrap-icons';


const defaultCustomerDetails = {
    cName : '',
    cAddress: '',
    cEmail: '',
  };
const defaultItemDetails = {
    itemName : '',
    itemCost: '',
    currency : '',
    itemQuantity: '',
    itemDescription : '',
    itemId : uuid()
  };
const defaultItems = [];
export default function CreateInvoice() {
  const [internet, setInternet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const handleShowSignoutModal = () => setShowSignOutModal(true);
  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);
  const [showCanvas, setShowCanvas] = useState(false);
  const handleCloseCanvas = () => setShowCanvas(false);
  const handleShowCanvas = () => setShowCanvas(true);
  const [showItemDiv, setShowItemDiv] = useState(false);
  const [showCustomerDiv, setShowCustomerDiv] = useState(true);
  const customerBtnRef = useRef();
  const itemBtnRef = useRef();
  const [isDisabled, setIsDisabled] = useState(false);
  const myRef = useRef();
  const actionRef = useRef();
  const [customerFields, setCustomerFields] = useState(defaultCustomerDetails);
  const { cName, cAddress, cEmail} = customerFields;
  const [itemFields, setItemFields] = useState(defaultItemDetails);
  const { itemName, itemCost, itemQuantity, itemDescription, currency} = itemFields;
  const uid = sessionStorage.getItem("uid");
  const [items, setItems] = useState(defaultItems);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  // const [selectedCurrency, setSelectedCurrency] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [showSignout, setShowSignOut] = useState(false);
  const handleCloseSignOutModal = () => {
    setShowSignOut(false)
    navigate('/')
  };
  const handleClose = () => {
      setShowSignOut(false)
      navigate('/')
    };
  const handleShow = () => setShowSignOut(true);
  const  handleKeyDown = (event) => {
      // Get the key code of the pressed key
      const keyCode = event.keyCode || event.which;
      
      // Convert the key code to the corresponding character
      const char = String.fromCharCode(keyCode);
      
      // Check if the character is 'e' or 'E'
      // if (char === 'e' || char === 'E') {
      //   // Prevent the default action of the event
      //   event.preventDefault();
      // }
    
      if ( (isNaN(char) === 'true' && typeof char === 'string') || char === 'e' || char === 'E') {
        // Prevent the default action of the event
        event.preventDefault();
      }
    }


  const navigate = useNavigate();
  const resetItemDetailsFields = () => {
      setItemFields({...defaultItemDetails, itemId:uuid(), currency});
    };
  const resetAll = () =>{
    setItems(defaultItems);
    setItemFields(defaultItemDetails);
    setCustomerFields({...defaultCustomerDetails});
    setPaymentStatus('');
    setAmountPaid('');
  }
  const handleChangeCustomers = (event) => {
      const { name, value } = event.target;
      setCustomerFields({ ...customerFields, [name]: value });
    };
  const handleChangeItem = (event) => {
    const { name, value } = event.target;
    setItemFields({ ...itemFields, [name]: value });
  };

  function handleSelectPayment(event) {
      setPaymentStatus(event.target.value);
      // if(event.target.value === 'Partly_Paid')
      // myRef.current.style.display = 'block'
  }

  const handlePartPayment = (event)=>{
    setAmountPaid(event.target.value)
  }

  const createInvoiceId = () => {
    // Generate a random number between 0 and 99999
    const randomNumber = Math.floor(Math.random() * 100000);
  // Convert the random number to a string and pad it with leading zeros
    const paddedNumber = randomNumber.toString().padStart(5, '0');
  // Combine the "RAD5" string with the padded random number to create the invoice ID
    const invoiceId = `RAD5-${paddedNumber}`;
  return invoiceId;
  }

  const handleInvoiceClick = async (event) => {
    event.preventDefault();
    if (items.length === 0){
      alert('You have not added an Item! \nClick on "Add Item" button to add an item')
      return;
    }
    setGeneratingInvoice(true)
    setIsDisabled(true);
    event.preventDefault();
    //Get invoice id and add to sessionStorage
    const invoiceId = createInvoiceId();
    sessionStorage.setItem("invoiceId", invoiceId);
    let amtPaid;
    let payStatus;
    if (paymentStatus === 'Paid'){
      amtPaid = totalAmount()
      payStatus = 'Paid'
    }
    else if (paymentStatus == 'Pending'){
      if(currency === ''){
        amtPaid = 0
        amtPaid = amtPaid.toLocaleString('en-US', {
      style: 'NGN',
      currency: currency,
    });
      }
    else {
      amtPaid = 0
      amtPaid = amtPaid.toLocaleString('en-US', {
      style: 'currency',
      currency: currency,
    });
    }
      payStatus = 'Pending'
    }

    else if (paymentStatus === 'Partly_Paid'){
      if(currency === ""){
        amtPaid = parseFloat(amountPaid);
        amtPaid = amtPaid.toLocaleString('en-US', {
        style: 'NGN',
        currency: currency,
      });
      }
      else{
        amtPaid = parseFloat(amountPaid);
        amtPaid = amtPaid.toLocaleString('en-US', {
        style: 'currency',
        currency: currency,
      });
      }
      payStatus = 'Partly_Paid'
    }
    else if (paymentStatus === ''){
      if (currency === ""){
        amtPaid = 0;
        amtPaid = amtPaid.toLocaleString('en-US', {
        style: 'currency',
        currency: 'NGN',
      });
      }
      else {
        amtPaid = 0;
        amtPaid = amtPaid.toLocaleString('en-US', {
        style: 'currency',
        currency: currency,
      });
      }

      payStatus = 'Pending'
    }
    const checkInternetConnection = async () => {
      const invoiceCollectionRef = collection(db, 'invoice');
      try {
        const snapshot = await getCountFromServer(invoiceCollectionRef);
        setInternet(true)
      }catch(error){
        if (error = "FirebaseError: [code=unavailable]: Connection failed."){
          setGeneratingInvoice(false);
          setIsDisabled(false);
          setInternet(false);
          alert("Connection failed!\nPlease check your Internet connection and try again");
          console.log('error 215');
          return
        }
        console.log(error)
      
      }
     
    };
    
    checkInternetConnection();
    if (internet){
      try{
        //Add Invoice and Item to an Invoice collection and item subcollection
      let invoiceDocRef;
      console.log('here')
     try{
      invoiceDocRef = await createInvoiceDocumentFromAuth(uid, customerFields, items, invoiceId, amtPaid, payStatus);
      console.log('here')
     }catch(error){
        console.log(error, error.message);
         }
      // Invoice Document and add to sessionStorage
      const documentSnapshot = await getDoc(invoiceDocRef);
      const documentData = documentSnapshot.data();
      const documentDataString = JSON.stringify(documentData);
      sessionStorage.setItem("invoiceData", documentDataString);
      }catch(error){
          console.log(error)
      }
      const itemsString = JSON.stringify(items);
      sessionStorage.setItem('items', itemsString)
      setGeneratingInvoice(false);
      resetAll();
      window.open('/invoice-app/view-invoice', '_blank');
      setShowItemDiv(false);
      setShowCustomerDiv(true);
      setIsDisabled(false);
    }
    else{
      return
    }
  };

  const totalAmount = ()=>{
   let amt =  items.reduce((accumulator, currentElement) =>{
      return (accumulator + currentElement.itemQuantity * currentElement.itemCost)
      }, 0)
  if (currency != ''){
      amt = amt.toLocaleString('en-US', {
        style: 'currency',
        currency: currency,
      });
    }
    else {
      amt = amt.toLocaleString('en-US', {
        style: 'currency',
        currency: 'NGN',
      });
    }
      return amt
  }
  
  const costAndAmount = (item)=>{
    const itemCost = parseFloat(item.itemCost);
    let formattedItemCost;
    let formattedItemTotalAmount;
   if (currency === ''){
         formattedItemCost = itemCost.toLocaleString('en-US', {
          style: 'currency',
          currency: 'NGN',
        });
        const itemTotalAmount = item.itemQuantity * item.itemCost
       formattedItemTotalAmount = itemTotalAmount.toLocaleString('en-US', {
          style: 'currency',
          currency: 'NGN',
    });
   }
   else {
    formattedItemCost = itemCost.toLocaleString('en-US', {
      style: 'currency',
      currency: currency,
    });
    const itemTotalAmount = item.itemQuantity * item.itemCost
    formattedItemTotalAmount = itemTotalAmount.toLocaleString('en-US', {
      style: 'currency',
      currency: currency,
    });
   }
    return [formattedItemCost, formattedItemTotalAmount]
  }

  const addItem = (e) =>{
    e.preventDefault();
    if (currency === ''){
      setItems([...items, {...itemFields, currency:'NGN'}]);
    }
    else setItems([...items, {...itemFields}]);
    resetItemDetailsFields();
  }
  const removeItem = (Id)=>{
          setItems(items.filter(item => item.itemId != Id ));
      }

  const auth = getAuth();
  function handleSignOut() {
    setLoggingOut(true)
    sessionStorage.removeItem('user-email')
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        setLoggingOut(false);
        navigate('/')
      })
      .catch((error) => {
        console.log(error)
      });
  }

  const handleCustomerDiv = (e) =>{
    e.preventDefault();
    setShowCustomerDiv(false);
    setShowItemDiv(true);
  }
  const handleItemDiv = () =>{
    setShowItemDiv(false);
    setShowCustomerDiv(true);
  }
  
  const customerDiv = 
      <>
        <Form onSubmit={handleCustomerDiv} className='row'>
        <h5 className=''>Bill to:</h5>
          <Col xs = 'auto' md = '4'>
            <Form.Group className="mb-3" controlId="cName">
            <Form.Control type="text" name="cName" required placeholder="Customer Name"  value = {cName} onChange={handleChangeCustomers} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="cAddress">
              <Form.Control type="text" name="cAddress" placeholder="Customer Address" value = {cAddress} onChange={handleChangeCustomers} />
            </Form.Group>
          </Col>
          <Col xs = 'auto' md = '4'>
            <Form.Group className="mb-3" controlId="cEmail">
              <Form.Control type="email" name="cEmail" placeholder="Customer Email" value = {cEmail} onChange={handleChangeCustomers} />
            </Form.Group>
            <Form.Group controlId="currency">
              <select
                required
                className="form-select mb-3"
                name="currency"
                value={currency}
                onChange={handleChangeItem} >
                  <option className="text-gray" value="">Select Currency</option>
                  <option value="NGN">Naira (₦)</option>
                  <option value="USD">Dollar ($)</option>
                  <option value="EUR">Euros (€)</option>
                  <option value="GBP">Pound (£)</option>
                </select>     
              </Form.Group>

          </Col>
          <Col  ref={customerBtnRef}>
              <Button type='submit' className='create-invoice-btn'>Go to Item Details <ChevronRight /> </Button>
          </Col>
        </Form>
        <Row>
         
        </Row>
      </>
  const ItemDetails =  <>
   <Row>
      <Col ref={customerBtnRef}>
          <Button onClick={handleItemDiv} className='create-invoice-btn'> <ChevronLeft /> Go to Customer Details</Button>
      </Col>
    </Row>
    <Row className='mt-3'>
      <Col>
        <Form className='row' onSubmit={addItem}>
          <h5 className=''>Item(s):</h5>
            <Col>
              <Form.Group className="mb-3" controlId="itemName">
                <Form.Control required type="text" name="itemName" placeholder="Item Name" value = {itemName} onChange={handleChangeItem} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="itemCost">
                <Form.Control onKeyDown={handleKeyDown} required type="number" name="itemCost" placeholder="Item Cost" value = {itemCost} onChange={handleChangeItem} />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3" controlId="itemQuantity">
                <Form.Control onKeyDown={handleKeyDown} required type="number" name="itemQuantity" placeholder="Item Quantity" value = {itemQuantity} onChange={handleChangeItem} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                <Form.Control required as="textarea" rows={3}  placeholder='Item Description' name='itemDescription' value = {itemDescription} onChange={handleChangeItem}/>
              </Form.Group>
              <Button className='create-invoice-btn add-item-btn' type='submit'>Add Item</Button>
            </Col>
        </Form>
      </Col>     
    </Row>
  </>
    
  const ItemsTable =  <>
      <Row className='mt-4' >
      <Col lg = '11'>
        <Table striped bordered hover responsive className=''>
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {
              items.map(item => {
               const[formattedItemCost, formattedItemTotalAmount] = costAndAmount(item)
               return (
                <tr className='create-invoice-tr' key={item.itemId} style={{position:'relative'}}>
                  <td>{item.itemName}</td>
                  <td>{item.itemDescription}</td>
                  <td>{item.itemQuantity}</td>
                  <td>{formattedItemCost}</td>
                  <td>{formattedItemTotalAmount}</td>
                  <td style={{cursor:"pointer"}} onClick={()=>{removeItem(item.itemId)}}><Trash /></td>
                  {/* <div onClick={()=>{removeItem(item.itemId)}} className='create-invoice-hidden-div d-none'><Trash /></div> */}
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
              <td>{totalAmount()}</td>
              <td></td>
            </tr>
          </tfoot>
        </Table>
      </Col>
    </Row>
    <Form onSubmit={handleInvoiceClick} className='row mb-5'>
      <Col xs = 'auto' md ='4' className='mb-2 mb-sm-0'>
        <Form.Group>
          <select required className="form-select" value={paymentStatus} onChange={handleSelectPayment}>
            <option value="">Select payment status for this invoice</option>
            <option value="Pending">Pending</option>
            <option value="Partly_Paid">Partly Paid</option>
            <option value="Paid">Paid</option>
          </select>
          </Form.Group>
      </Col>
      {paymentStatus === 'Partly_Paid' && (
    <Col xs = 'auto' md ='4' className='mb-2 mb-sm-0'>
      <Form.Group className="" controlId="partlyPaid">
        <Form.Control required type="number" name="partlyPaid" placeholder="Please type the part payment made" value={amountPaid} onChange={handlePartPayment} />
      </Form.Group>
    </Col>
  )}
      <Col xs = 'auto' style={{display:'flex'}}>
      <Button className='create-invoice-btn' type='submit' disabled = {isDisabled} >Generate Invoice</Button>
            { generatingInvoice ? 
              <Spinner className='ms-3 mt-1' animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
                :
              <div></div>
            }
      </Col>
    </Form>
   </>
    
const itemsDiv = <>
      {ItemDetails}
      {ItemsTable}
</>
const asideDiv = <>
            <Offcanvas className = "col-lg-3 dashboard-aside" show={showCanvas} onHide={handleCloseCanvas} responsive="lg">
            <Row className='dashboard-aside-first-row mb-4'>
                    <Col className='mb-4'>
                      <Offcanvas.Body>
                        <Offcanvas.Title className='offcanvas-title'>Welcome, {userEmail}</Offcanvas.Title>
                    </Offcanvas.Body>
                    </Col>  
                    </Row>
              <Row className='create-invoice-aside-first-row'>
               <Link to="/dash" style={{ textDecoration:'none', color : "white"}}><p className="">< HouseFill className='offcanvas-link-home' /> <span>Home</span></p></Link><hr/>
               <Link to="/invoice-table" style={{ textDecoration:'none', color : "white"}}><p className=""><Eye className='' /> <span>View Invoices</span></p></Link><hr/>
               <Link to = '/create' style={{ textDecoration:'none', color : "white"}}><p className="" style={{color:'gray'}}><PlusCircleFill /> <span className='offcanvas-link-create-invoice'>Create Invoice</span></p></Link><hr/>

               <p className='dashboard-signout' onClick={handleSignOut} >
                {loggingOut ? 
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                : <span> <BoxArrowDownRight /> Sign Out</span>} 
                </p><hr/>
              </Row>
            </Offcanvas>
</>

const fetchUserDetails = async () =>{
  const user_Email = sessionStorage.getItem('user-email')
  if(!user_Email){
    navigate('/')
  }
  setUserEmail(user_Email)
  setLoading(false);
}
useEffect(()=>{
  setTimeout( fetchUserDetails, 100);
}, [])

  return (
    <div>
     {
      loading ? <Container>
      <Row className='justify-content-center mt-5'>
          <Col xs={1}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </Col>
      </Row>
    </Container>:
      <>
       {/* Navbar */}
       <Container fluid>
       <Row className='justify-content-between'>
           <Col lg = '3' className='dashboard-navbar navbar-brand p-3 text-center' ><h5 className='dashboard-navbar-brand'>InvoiceApp</h5></Col>
           <Col className='d-lg-none'>
           <i className="fa fa-bars" variant="primary" onClick={handleShowCanvas}></i>
           </Col>
           
       </Row>
   </Container>
     <Container fluid>
        <Row className=''>
           {/* aside */}
               {asideDiv}
         <Col>
         {showCustomerDiv ? customerDiv : <div></div>}
         {showItemDiv ? itemsDiv : <div></div>}
         </Col>
        </Row>
     </Container>
     </>
     }
      
    </div>
  )
}
