"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import React from 'react';
import { useState, useEffect } from "react";
import { MDBCol, MDBContainer, MDBRow, MDBCard, MDBCardTitle, MDBCardText, MDBCardBody, MDBCardImage, MDBBtn, MDBIcon } from 'mdb-react-ui-kit';
import axios from "axios";


export default function Basic() {
  const [tableData, setTableData] = useState({});
  const [error, setError] = useState(null); // Initialize error state
  const [loading, setLoading] = useState(true); // Initialize loading state
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchData = async() => {
      console.log("HIIIII");
      if (status === "loading") {
        // Wait for the session to load
        console.log("loading");
        return;
      }

      if (!session) {
        // Handle the case where there is no session (user not authenticated)
        console.log("not authenticated");
        setError("User is not authenticated");
        setLoading(false);
        return;
      }
      try {
        const response1 = await fetch('http://127.0.0.1:8000/api/csrf_token');
        const data = await response1.json();
        console.log("CSRF Token: ", data.csrfToken);
        const response = await axios.get(
          "http://127.0.0.1:8000/api/getUserinfo",
          {
            headers: {
              'X-CSRFToken': data["csrfToken"],
              'Authorization': `Bearer ${session.user.email}`,
            }
          }
        );

        const receivedData = response.data.data;
        
        console.log("Data received: ", receivedData);
        // Process the received data and update tableData
        setTableData(receivedData);
      } catch(error) {
        console.log(error);
        setError("Failed to fetch data");
      } finally {
        setLoading(false); // Ensure loading is set to false in both success and failure cases
      }
    }

    fetchData();
  }, [session, status]); // Dependency array to ensure effect runs only when session or status changes
  
    return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#9de2ff' }}>
      <MDBContainer fluid className="flex-grow-1 d-flex flex-column justify-content-center py-5">
        <MDBRow className="justify-content-center">
          <MDBCol className="col-12">
            <MDBCard style={{ borderRadius: '15px' }}>
              <MDBCardBody className="p-5">
                <div className="d-flex flex-column flex-lg-row text-black">
                  <div className="flex-shrink-0 mb-4 mb-lg-0 text-center">
                    {!loading && !session && (
                    <>
                    <MDBCardImage
                      style={{ width: '250px', height: '250px', objectFit: 'cover', borderRadius: '10px' }}
                      src='https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-profiles/avatar-1.webp'
                      alt='Profile picture'
                      fluid />
                    </>
                    )}
                    {!loading && session && (
                        <>
                        <MDBCardImage
                          style={{ width: '250px', height: '250px', objectFit: 'cover', borderRadius: '10px' }}
                          src={session.user.image}
                          alt='Profile picture'
                          fluid />
                        </>
                    )}
                  </div>
                  <div className="flex-grow-1 ms-lg-5">
                    {!loading && !session && (
                    <>
                    <MDBCardTitle className="display-4 mb-3">First Last</MDBCardTitle>
                    <MDBCardText className="lead mb-4">Standard User</MDBCardText>
                    </>
                    )}
                    {!loading && session && (
                    <>
                    <MDBCardTitle className="display-4 mb-3">{session.user.name}</MDBCardTitle>
                    <MDBCardText className="lead mb-4">Standard User</MDBCardText>
                    </>
                    )}
                    <div className="d-flex justify-content-start rounded-3 p-4 mb-4"
                      style={{ backgroundColor: '#efefef' }}>
                      <div className="px-3">
                        <p className="small text-muted mb-1">Websites</p>
                        <p className="mb-0 h5">{tableData["company_num"]}</p>
                      </div>
                      <div className="px-3 border-start">
                        <p className="small text-muted mb-1">Cookies</p>
                        <p className="mb-0 h5">{tableData["cookie_num"]}</p>
                      </div>
                      <div className="px-3 border-start">
                        <p className="small text-muted mb-1">Danger</p>
                        <p className="mb-0 h5">{tableData["danger"]}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}