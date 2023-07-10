import logo from './logo.svg';
import './App.css';
import Dashboard from './components/Dashboard/dashboard.component';
import { Routes, Route } from 'react-router-dom';
import SignIn from './components/SignIn/sign-in.component';
import CreateInvoice from './components/CreateInvoice/create-invoice.component';
import Invoice from './components/invoice.component';
import InvoiceTable from './components/InvoiceTable/invoiceTable.component';
import ViewInvoice from './components/view-invoice.component';
import {
  getDocs,
  getDoc,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc, orderBy, query, where, limit, getCountFromServer
} from "firebase/firestore";
import { db, auth } from './utils/firebase.utils';


function App() {
  // const checkInternetConnection = async () => {
  //   const invoiceCollectionRef = collection(db, 'invoice');
  //   try {
  //     const snapshot = await getCountFromServer(invoiceCollectionRef);      
  //   }catch(error){
  //     if (error = "FirebaseError: [code=unavailable]: Connection failed."){
  //       alert("Connection failed, \nCould not fetch details \nPlease check your Internet connection and try again");
  //     }
  //     console.log(error)
  //   }
   
   
  // };
  
  // checkInternetConnection();
  
  return (
    <Routes>
      <Route path='/' element={<SignIn/>} />
      <Route path='/dash' element={<Dashboard/>} />
      <Route path='/create' element={<CreateInvoice/>} />
      <Route path='/invoice' element={<Invoice/>} />
      <Route path='/invoice-table' element={<InvoiceTable/>} />
      <Route path='/view-invoice' element={<ViewInvoice/>} />
  </Routes>
 
  );
}

export default App;
