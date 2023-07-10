import React, { useEffect } from 'react'
import { Container, Row, Col, Table } from 'react-bootstrap';
import './invoice.css'
export default function Invoice() {
    const uid = sessionStorage.getItem("uid");
    const invoiceDataString = sessionStorage.getItem('invoiceData');
    const invoiceData = JSON.parse(invoiceDataString);
    console.log(invoiceData)
    // useEffect(() => {
        
    // })
  return (
    <div></div>
  )
}
