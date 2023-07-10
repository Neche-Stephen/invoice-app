import React from 'react';
import { useState } from 'react';
import { signInAuthUserWithEmailAndPassword } from '../../utils/firebase.utils';
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Table, Button, Spinner, Modal } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import ReactDOM from 'react-dom';
import { Alert } from 'react-bootstrap';
import "./signIn.css"
const defaultFormFields = {
    email: '',
    password: '',
  };

export default function SignIn() {
  const [isDisabled, setIsDisabled] = useState(false);
  const [formFields, setFormFields] = useState(defaultFormFields);
  const { email, password } = formFields;
  const [loggingIn, setLoggingIn] = useState(false);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [alertMessage, setAlertMessage] = useState('');

  const navigate = useNavigate();
  const resetFormFields = () => {
      setFormFields(defaultFormFields);
    };
  const handleChange = (event) => {
      const { name, value } = event.target;
      setFormFields({ ...formFields, [name]: value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsDisabled(true);
        setLoggingIn(true)
        try {
          const response = await signInAuthUserWithEmailAndPassword(
            email,
            password
          );
          resetFormFields();
          sessionStorage.setItem("uid" , response.user.uid);
          sessionStorage.setItem("user-email" , response.user.email);
          setIsDisabled(false);
          setLoggingIn(false);
          navigate("/dash");
          resetFormFields();
        } catch (error) {
          switch (error.code) {
            case 'auth/wrong-password':
              setAlertMessage('incorrect password for email');
              setShow(true);
              setLoggingIn(false);
              setIsDisabled(false);
              break;
            case 'auth/user-not-found':
              setLoggingIn(false);
              setIsDisabled(false);
              setAlertMessage('no user associated with this email')
              handleShow();
              break;
            case 'auth/too-many-requests':
              setLoggingIn(false);
              setIsDisabled(false);
              setAlertMessage("Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.");
              handleShow();
              break;
            default:
              console.log(error);
              setLoggingIn(false);
              setIsDisabled(false);
              setAlertMessage('Request failed, please try again');
              setShow(true);
          }
        }
      };
    
  return (
    <div className='sign-in-component'>
      <Container className='mt-5'>
        <Row className='justify-content-center'>
            <Col xs='auto'>
            <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>An Error Occured</Modal.Title>
            </Modal.Header>
            <Modal.Body><Alert variant="danger">
                              <p>{alertMessage}</p>
                            </Alert></Modal.Body>
            </Modal>
            </Col>
        </Row>
        <Row className='justify-content-center'>
          <Col md = '6' lg ='4'>
            <h5>Sign in and create invoices for your customers</h5>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email address</Form.Label>
                <Form.Control className='sign-in-input' type="email" name="email" placeholder="Enter email" required value = {email} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control className='sign-in-input' type="password" placeholder="Password" name="password" required value = {password} onChange={handleChange} />
              </Form.Group>
              <Button className='sign-in-btn' disabled = {isDisabled} variant="primary" type="submit">
                    Sign in
              </Button>
            </Form>
          </Col>
        </Row>
        <Row className='justify-content-center mt-3'>
          <Col lg = '4' sm = '6'>
          {loggingIn
          ?
          <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
          </Spinner>
          :
          <div></div>}
          </Col>
        </Row>
      </Container>
    </div>
  )
}
