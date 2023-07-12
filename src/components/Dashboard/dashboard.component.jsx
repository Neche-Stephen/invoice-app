import React from 'react';
import { useEffect, useState, useRef } from 'react';
import { getAuth, signOut} from "firebase/auth";
import {
    getDocs,
    getDoc,
    collection,
    addDoc,
    deleteDoc,
    updateDoc,
    doc, orderBy, query, where, limit, getCountFromServer
  } from "firebase/firestore";
import { db, auth } from '../../utils/firebase.utils';
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Spinner, Badge, Table, Modal, Form, Alert} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './dashboard.css';
import Offcanvas from 'react-bootstrap/Offcanvas';
import HighlightedText from './HighlightedText';


import { BoxArrowDownRight, Eye, HouseFill, PlusCircleFill, Search } from 'react-bootstrap-icons';
import { v4 as uuid } from 'uuid';

export default function Dashboard() {
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const handleShowSignoutModal = () => setShowSignOutModal(true);
  const [searchResults, setSearchResults] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);
  const [showCanvas, setShowCanvas] = useState(false);
  const handleCloseCanvas = () => setShowCanvas(false);
  const handleShowCanvas = () => setShowCanvas(true);
  const [searchInvoiceId, setSearchInvoiceId] = useState('');
  const uid = sessionStorage.getItem("uid");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [myInvoices, setMyInvoices] = useState([]);
  const [numberInvoices, setNumberInvoices] = useState(0);
  const [numberInvoicesPending, setNumberInvoicesPending] = useState(0);
  const [numberInvoicesCompleted, setNumberInvoicesCompleted] = useState(0);
  const [showSignout, setShowSignOut] = useState(false);
  const searchText = useRef();
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // const [searchClick, setSearchClick] = use


  const viewInvoice = async (invoiceId) =>{
    console.log(invoiceId)
      sessionStorage.setItem('invoiceId', invoiceId)      
      // navigate('/view-invoice')
      // navigate('/view-invoice', { target: '_blank' });
      window.open('/invoice-app/view-invoice', '_blank');
      setSearchQuery('')
    }

  const navigate = useNavigate();
  const fetchUserDetails = async () =>{
    const user_Email = sessionStorage.getItem('user-email')
    if(!user_Email){
      navigate('/')
    }
    setUserEmail(user_Email)
    getInvoices();
  }

  const getInvoices = async () => {
    let invoices = [];
    const invoiceCollectionRef = collection(db, 'invoice');
    const q = query(invoiceCollectionRef, orderBy("createdAt", "desc"), limit(5));
    try {
      const snapshot = await getCountFromServer(invoiceCollectionRef);
      const documentCount = snapshot.data().count;
      console.log('count: ', snapshot.data().count);
      const querySnapshot = await getDocs(q);
      setNumberInvoices(documentCount);
      countPendingOrPartlyPaidInvoices();
      countCompletedInvoices();
      querySnapshot.forEach((doc) => {
          invoices.push(doc.data())
      });
      setMyInvoices(invoices);
      setLoading(false)
    }catch(error){
      if (error = "FirebaseError: [code=unavailable]: Connection failed."){
        alert("Connection failed, \nCould not fetch details \nPlease check your Internet connection and try again");
      }
      setLoading(false);
      console.log(error)
    }
   
    
  }
  const auth = getAuth();

  function handleSignOut() {
      setLoggingOut(true)
      sessionStorage.removeItem('user-email')
      signOut(auth)
        .then(() => {
          // Sign-out successful.
          setLoggingOut(false);
          navigate("/")
        })
        .catch((error) => {
          // An error happened.
        })
    }
  const countPendingOrPartlyPaidInvoices = async () => {
      const invoiceCollection = collection(db, 'invoice');
      const q = query(invoiceCollection, where('Payment_Status', 'in', ['Pending', 'Partly_Paid']));
    
      try {
        const querySnapshot = await getDocs(q);
        const count = querySnapshot.size;
        console.log('Number of documents:', count);
        setNumberInvoicesPending(count)
      } catch (error) {
        console.log('Error getting documents:', error);
      }
    };
  const countCompletedInvoices = async () => {
      const invoiceCollection = collection(db, 'invoice');
      const q = query(invoiceCollection, where('Payment_Status', 'in', ['Paid']));
    
      try {
        const querySnapshot = await getDocs(q);
        const count = querySnapshot.size;
        console.log('Number of documents completed:', count);
        setNumberInvoicesCompleted(count)
      } catch (error) {
        console.log('Error getting documents:', error);
      }
    };
    // const handleSearch = async (searchInvoiceId) => {
    //   if (searchInvoiceId === '') return
    //   setSearching(true);
    //   try {
    //     const invoicesCollectionRef = collection(db, 'invoice');
    //     // Create a query to search for documents where invoiceId field contains "rad5"
    //     const q = query(invoicesCollectionRef, where('invoiceId', '>=', searchInvoiceId), orderBy('invoiceId'), limit(1));
    //     // Get the matching documents
    //     const querySnapshot = await getDocs(q);
    //     if (querySnapshot.empty) {
    //       // No documents found with the given condition
    //       console.log('Invoice ID does not exist');
    //       setSearching(false);
    //       searchText.current.innerHTML = 'Invoice ID does not exist'
    //     } 
    //     else {
    //       searchText.current.innerHTML = '';
    //       setSearching(false);
    //       setSearchInvoiceId('')
    //       viewInvoice(searchInvoiceId);
    //     }
    //   } catch (error) {
    //     console.error('Error searching for invoice:', error);
    //     setSearching(false)
    //   }
    // };

  useEffect(()=>{
  fetchUserDetails()
  }, [])
   
  useEffect(() => {
    const fetchSearchResults = async () => {

      if (searchQuery === '') {
        setSearchResults([]); // Clear the search results if the query is empty
        return;
      }

      try {
        const q = query(
          collection(db, 'invoice'),
          where('cName', '>=', searchQuery),
          where('cName', '<', searchQuery + 'z')
        );
     
        const querySnapshot = await getDocs(q);

        const results = querySnapshot.docs.map((doc) => doc.data());
        setSearchResults(results);
        console.log(results);
      } catch (error) {
        console.error('Error searching Firestore:', error);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

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
 <div>
      
  {/* Navbar */}
 <Container fluid>
  <Row className='justify-content-between'>
      <Col lg = '3' className='dashboard-navbar navbar-brand p-3 text-center' ><h5 className='dashboard-navbar-brand'>InvoiceApp</h5></Col>
      <Col className='d-lg-none'>
      <i className="fa fa-bars" variant="primary" onClick={handleShowCanvas}></i>
      </Col>
      <Col xs = "4" className='p-3'>
          <Form.Control placeholder="Search Invoice" onClick={handleShowModal} />
      </Col>
      {/* Search Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Body>
        <Container>
        <Row className='mt-md-3 mt-5 mb-4'>
            <Col>
            <Form.Control
                  type="text"
                  placeholder="Search invoices by customer name"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
            </Col>
        </Row>
      {searchQuery !== '' ? 
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
                    searchResults
                      .map(invoice => {
                        let aDate =  invoice.createdAt
                        aDate = aDate.toDate();
                        const options = { day: 'numeric', month: 'long', year: 'numeric' };
                        const formattedDate = aDate.toLocaleDateString('en-US', options);
                        const capitalizeFirstLetter = (str) => str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                            const cName = invoice.cName;
                            const capitalizedName = capitalizeFirstLetter(cName);
                        return (
                        <tr key={uuid()}>
                          <td>{formattedDate}</td>
                          <td>{invoice.invoiceId}</td>
                          <td>{<HighlightedText text={capitalizedName} searchQuery={searchQuery} />}</td>
                          <td>
                              <Eye onClick={(e) => {viewInvoice(invoice.invoiceId)}} style={{cursor:'pointer'}} />
                            {/* </Button> */}
                            </td>
                        </tr>
                        )
                      })
                    }
                  
                </tbody>
              </Table>
            </Col>
          </Row> 
      :
      <div></div>
      }
        </Container>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
  </Row>
</Container>
<Container fluid>
      <Row>
        {/* aside */}
          <Offcanvas className = "col-lg-3 dashboard-aside" show={showCanvas} onHide={handleCloseCanvas} responsive="lg">
            <Row className='dashboard-aside-first-row mb-4'>
              <Col className='mb-4'>
                <Offcanvas.Body>
                  <Offcanvas.Title className='offcanvas-title'>Welcome, {userEmail}</Offcanvas.Title>
              </Offcanvas.Body>
              </Col>  
            </Row>
            <Row className='dashboard-aside-second-row'>
              <Link to="/dash" style={{ textDecoration:'none', color : "white"}}><p style={{color:'gray'}}>< HouseFill className='offcanvas-link-home' /> <span>Home</span></p></Link><hr/>
              <Link to="/invoice-table" style={{ textDecoration:'none', color : "white"}}><p className=""><Eye /> <span className='offcanvas-link'>View Invoices</span></p></Link><hr/>
              <Link to = '/create' style={{ textDecoration:'none', color : "white"}}><p className=""><PlusCircleFill /> <span className='offcanvas-link-create-invoice'>Create Invoice</span></p></Link><hr/>
              <p className='dashboard-signout' onClick={handleSignOut} >
              {loggingOut ? 
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              : <span> <BoxArrowDownRight /> Sign Out</span>} 
              </p><hr/>
                  
            </Row>
          </Offcanvas>
        
            {/* Main */}
         <Col className='main mt-5'>
                {/* Widget One */}
              <Row>
                  <Col xs = '6' sm = '4' className='mb-3' >
                    <div className='dashboard-widget-card shadow-lg p-2' style={{backgroundColor: "#0D47A1", color:"white"}}>
                      <h5>Total Invoices</h5>
                      <p style={{fontWeight: 'bold', fontSize:"1.2em"}}>{numberInvoices}</p>
                    </div>
                  </Col>

                  <Col xs = '6' sm = '4'  >
                    <div className='dashboard-widget-card shadow-lg p-2' style={{backgroundColor: "#28A745", color:"white"}}>
                      <h5>Completed Invoices</h5>
                      <p style={{fontWeight: 'bold', fontSize:"1.2em"}}>{numberInvoicesCompleted}</p>
                    </div>
                  </Col>

                  <Col xs = '6' sm = '4'  >
                    <div className='dashboard-widget-card shadow-lg p-2' style={{backgroundColor: "#DC3545 ", color:"white"}}>
                      <h5>Pending Invoices</h5>
                      <p style={{fontWeight: 'bold', fontSize:"1.2em"}}>{numberInvoicesPending}</p>
                    </div>
                  </Col>
              </Row>
                  {/* Table of Invoices */}
              <Row className='justify-content-center mt-5'>
                <Col>
                    <h4>Recent Invoices</h4>
                </Col>
              </Row>
             {
                myInvoices.length > 0 ?  
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
                      myInvoices
                          .map(invoice => {
                            // console.log(invoice.createdAt)
                            let aDate =  invoice.createdAt
                            aDate = aDate.toDate();
                            const options = { day: 'numeric', month: 'long', year: 'numeric' };
                            const formattedDate = aDate.toLocaleDateString('en-US', options);
                            const capitalizeFirstLetter = (str) => str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                            const cName = invoice.cName;
                            const capitalizedName = capitalizeFirstLetter(cName);

                          return (
                            <tr key={uuid()}>
                            {/* <td>{aDate instanceof Date ? aDate.toLocaleDateString() : ''}</td> */}
                            <td>{formattedDate}</td>
                            <td>{invoice.invoiceId}</td>
                            <td>{capitalizedName}</td>
                            <td>
                                <Eye onClick={() => {viewInvoice(invoice.invoiceId)}} style={{cursor:'pointer'}} />
                              {/* </Button> */}
                              </td>
                        </tr>
                          )
                          })
                        }
                    
                    </tbody>
                  </Table>
                </Col>
              </Row>
                :
               <Row>
                  <Col md = {6}>
                  <Alert className='' variant = 'warning'>
                <strong> Couldn't Fetch Invoices</strong> <br />Either you don't have any available invoice or your device does not have a healthy internet connection at the moment. Please try reloading.
                </Alert>
                  </Col>
               </Row>
             }
         </Col>
         
      </Row>
 </Container>
</div> 

 

}
