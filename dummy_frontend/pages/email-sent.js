"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardTitle,
  Button,
  Collapse,
} from "reactstrap";
import { useSession } from "next-auth/react";
import axios from "axios";

const EmailList = () => {
  const [emails, setEmails] = useState([]); // State to hold emails fetched from backend
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      if (status === "loading") {
        // Wait for the session to load
        return;
      }

      if (!session) {
        console.log("not authenticated");
        return;
      }

      try {
        const response1 = await fetch('http://127.0.0.1:8000/api/csrf_token');
        const data = await response1.json();
        const response = await axios.get(
          "http://127.0.0.1:8000/api/sendEmail",
          {
            headers: {
              'X-CSRFToken': data["csrfToken"],
              'Authorization': `Bearer ${session.user.email}`,
            }
          }
        );

        const receivedData = response.data.data;
        console.log("Data received: ", receivedData);
        setEmails(receivedData); // Update state with the fetched data
      } catch (error) {
        console.error("Error fetching the data:", error);
      }
    };

    fetchData();
  }, [session, status]);

  return (
    <div className="container mt-4">
      {emails.map((email, index) => (
        <EmailItem key={index} email={email} />
      ))}
    </div>
  );
};

const EmailItem = ({ email }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <Card className="mb-3">
      <CardBody>
        <CardTitle tag="h5">
          Sent to: {email.recipient}
          <Button
            color="primary"
            size="sm"
            className="float-end"
            onClick={toggle}
          >
            {isOpen ? "Hide Details" : "Show Details"}
          </Button>
        </CardTitle>
        <Collapse isOpen={isOpen}>
          <div className="mt-3">
            <p><strong>Subject:</strong> {email.subject}</p>
            <p><strong>Body:</strong> {email.body}</p>
          </div>
        </Collapse>
      </CardBody>
    </Card>
  );
};

export default EmailList;
