import React, { useEffect } from 'react'
import { Container, Row, Col, Table, Spinner, Form, Pagination} from 'react-bootstrap';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, query, where, orderBy,  } from 'firebase/firestore';
import { getAuth, signOut } from "firebase/auth";
import { db, auth } from '../../utils/firebase.utils';
import { useState} from 'react';
import { v4 as uuid } from 'uuid';
import { useNavigate } from "react-router-dom";
import { Eye } from 'react-bootstrap-icons';
import { Button, Modal, Offcanvas, Alert } from "react-bootstrap";
import { HouseFill, Trash, Plus, PlusCircleFill, BoxArrowDownRight } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import './invoice-table.css';
import HighlightedText from '../Dashboard/HighlightedText';



export default function InvoiceTable() {
  const [userEmail, setUserEmail] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const handleShowSignoutModal = () => setShowSignOutModal(true);
  const [showCanvas, setShowCanvas] = useState(false);
  const handleCloseCanvas = () => setShowCanvas(false);
  const handleShowCanvas = () => setShowCanvas(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [myInvoices, setMyInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSignout, setShowSignOut] = useState(false);
  const navigate = useNavigate();
  const handleCloseSignOutModal = () => {
    setShowSignOut(false)
    navigate('/')
  };
  const handleShow = () => setShowSignOut(true);

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
        // An error happened.
      })
  }
  const getInvoices = async () => {
      let invoices = []
        const invoiceCollectionRef = collection(db, 'invoice');
        const q = query(invoiceCollectionRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
           invoices.push(doc.data())
        });
        setMyInvoices(invoices);
        setLoading(false)
    }
    const viewInvoice = async (e, invoiceId) =>{
      e.preventDefault();
      sessionStorage.setItem('invoiceId', invoiceId)      
      // navigate('/view-invoice')
      // navigate('/view-invoice', { target: '_blank' });
      window.open('/invoice-app/view-invoice', '_blank');
    }
    useEffect(() => {
        getInvoices();
    }, []);

    // Pagination logic
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [invoicesPerPage] = useState(10);
  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices = myInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);
  const totalPages = Math.ceil(myInvoices.length / invoicesPerPage);

  const paginate = pageNumber => setCurrentPage(pageNumber);

  const fetchUserDetails = async () =>{
    const user_Email = sessionStorage.getItem('user-email')
    if(!user_Email){
      navigate('/')
    }
    setUserEmail(user_Email)
  }
  useEffect(()=>{
    setTimeout( fetchUserDetails, 0);
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

  return loading ?
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
                                .map((invoice,_, myInvoices) => {
                                  if (myInvoices.length !== 0){
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
                                  }
                                  else {
                                    return (<tr key={uuid()}>
                                    <td>
                                        NO
                                      </td>
                                      <td>
                                        NO
                                      </td>
                                  </tr>)
                                  }
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
           {/* Aside */}
                <Offcanvas className = "col-lg-3 dashboard-aside" show={showCanvas} onHide={handleCloseCanvas} responsive="lg">
                <Row className='dashboard-aside-first-row mb-4'>
                    <Col className='mb-4'>
                      <Offcanvas.Body>
                        <Offcanvas.Title className='offcanvas-title'>Welcome, {userEmail}</Offcanvas.Title>
                    </Offcanvas.Body>
                    </Col>  
                    </Row>
                  <Row className='invoice-table-first-row'>
                        <Link to="/dash" style={{ textDecoration:'none', color : "white"}}><p className="">< HouseFill className='offcanvas-link-home' /> <span>Home</span></p></Link><hr/>
                        <Link to="/invoice-table" style={{ textDecoration:'none', color : "white"}}><p className="" style={{color:'gray'}}><Eye /> <span className='offcanvas-link'>View Invoices</span></p></Link><hr/>
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
            <Col>
           
        {
         currentInvoices.length > 0 ?
         <>
         <Row>
       <Col>
       <Table striped bordered hover>
       <thead>
         <tr>
           <th>Date Created</th>
           <th>Invoice Id</th>
           <th>Customer</th>
           <th>Action</th>
         </tr>
       </thead>
       <tbody>
       {
           currentInvoices
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
                 <td>{capitalizedName}</td>
                 <td>
                     <Eye onClick={(e) => {viewInvoice(e,invoice.invoiceId)}} style={{cursor:'pointer'}} />
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
   <Row>
         <Col>
           {/* Pagination */}
             <Pagination>
                 {Array.from({ length: totalPages }, (_, index) => (
                   <Pagination.Item
                     key={index + 1}
                     active={index + 1 === currentPage}
                     onClick={() => paginate(index + 1)}
                   >
                     {index + 1}
                   </Pagination.Item>
                 ))}
               </Pagination>
         </Col>
   </Row>
     </>
     :
     <Row>
     <Col md = {6}>
     <Alert className='' variant = 'warning'>
   <strong> Couldn't Fetch Invoices</strong> <br />It seems your device does not have a healthy Internet connection at the moment. Please try reloading
   </Alert>
     </Col>
  </Row>

        }
            </Col>
        </Row>

        

    </Container>
    </div>
}
