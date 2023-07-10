// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
  } from 'firebase/auth';
  import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB09E5ceot3RPiOR8OfQMhlSR9MtmM7MK8",
  authDomain: "rad5-invoice.firebaseapp.com",
  projectId: "rad5-invoice",
  storageBucket: "rad5-invoice.appspot.com",
  messagingSenderId: "709183223488",
  appId: "1:709183223488:web:b8e50a7f6ce4c4c56f5f25"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore();

export const signInAuthUserWithEmailAndPassword = async (email, password) => {
    if (!email || !password) return;
  
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const createInvoiceId = () => {
    // Generate a random number between 0 and 99999
    const randomNumber = Math.floor(Math.random() * 100000);
  // Convert the random number to a string and pad it with leading zeros
    const paddedNumber = randomNumber.toString().padStart(5, '0');
  // Combine the "RAD5" string with the padded random number to create the invoice ID
    const invoiceId = `RAD5-${paddedNumber}`;
    return invoiceId;
  }

let check = '';
const checkIfInvoiceIdExists = async (invoiceCollectionRef, invoiceId) => {
  console.log('here')

   try{
    console.log('i have entered')
     // Get all documents in the collection
     const querySnapshot = await getDocs(invoiceCollectionRef);
     console.log('error should be up')
     querySnapshot.forEach((doc) => {
      const docData = doc.data();
      for (let x in docData){
        if (x === 'invoiceId' && docData[x] === invoiceId ){
          invoiceId = createInvoiceId();
          checkIfInvoiceIdExists(invoiceCollectionRef, invoiceId);   
        }
      }
    });
   } catch(error){
    console.log('error 0')
      console.log(error, 'here')
   }
    // Loop through each document and get the data
    
    return invoiceId;
}

  export const createInvoiceDocumentFromAuth = async (
    uid,
    invoiceDetails = {}, items = [], invoiceId, amountPaid, paymentStatus
  ) => {
    try{
      const { cName, cAddress, cEmail} = invoiceDetails;
  console.log('here')

      const invoiceCollectionRef = collection(db, 'invoice');
  console.log('here')

    try{
      invoiceId =  await checkIfInvoiceIdExists(invoiceCollectionRef, invoiceId);
    }catch(error){
      console.log(error);
    }
    const createdAt = new Date();
      try {
        // console.log('invoiceDetails:', invoiceDetails);
        const invoiceDocRef = await addDoc(invoiceCollectionRef, {
          cName:cName.toLowerCase(), cAddress, cEmail, invoiceId, createdAt, Amount_Paid : amountPaid, Payment_Status:paymentStatus 
        });
      const itemSubCollectionRef = collection(invoiceDocRef, "items");
      const itemDocRef = await addDoc(itemSubCollectionRef, ...items );
      return invoiceDocRef
      } catch (error) {
        console.log('error creating the user', error.message);
      }

    } catch(error){
        console.log(error);
    }
     
  };

  