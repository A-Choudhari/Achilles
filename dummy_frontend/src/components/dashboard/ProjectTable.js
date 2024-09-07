"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardBody, CardTitle, CardSubtitle, Table, Button } from "reactstrap";
import axios from "axios";
import { useSession } from "next-auth/react";
import user1 from "../../assets/images/users/user1.jpg";
import user2 from "../../assets/images/users/user2.jpg";
import user3 from "../../assets/images/users/user3.jpg";
import user4 from "../../assets/images/users/user4.jpg";
import user5 from "../../assets/images/users/user5.jpg";
// import {Button, ButtonGroup} from "@nextui-org/button";

// Define placeholder table data
const placeholderData = [
  {
    avatar: user1,
    name: "Hanna Gover",
    email: "hgover@gmail.com",
    project: "Flexy React",
    status: "pending",
    weeks: "35",
    budget: "95K",
  },
  {
    avatar: user2,
    name: "Hanna Gover",
    email: "hgover@gmail.com",
    project: "Lading pro React",
    status: "done",
    weeks: "35",
    budget: "95K",
  },
  // ... (other data)
];

const ProjectTables = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState(null);
  const { data: session, status } = useSession();
  console.log(status);
  useEffect(() => {
    const fetchData = async () => {
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
          "http://127.0.0.1:8000/api/getCookies",
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
        setEmail(session.user.email);
        setLoading(false);
      } catch(error) {
        console.error("Error fetching the data:", error);
        setError(`Error fetching the data: ${error}`);
      }
    };

    fetchData();

  }, [session, status]);

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const sendEmail = async(id) => {
    const response1 = await fetch('http://127.0.0.1:8000/api/csrf_token',
    );
    const data = await response1.json();
    console.log("CSRF Token: ", data.csrfToken);
    console.log(email);
    const response = await axios.post(
      "http://127.0.0.1:8000/api/sendEmail",
      {
        "id": id
      },
      {
        headers: {
          'X-CSRFToken': data.csrfToken,
          'Authorization': `Bearer ${email}`,
        },
        withCredentials: true
      }
    );
  };


  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Card>
      <CardBody>
        <CardTitle tag="h5">Websites</CardTitle>
        <CardSubtitle className="mb-2 text-muted" tag="h6">
          Overview of data given to website
        </CardSubtitle>
        <div className="table-responsive">
          <Table className="text-nowrap mt-3 align-middle" borderless>
            <thead>
              <tr>
                <th>Website Name</th>
                <th>Number of Cookies</th>
                <th>Status</th>
                <th>Date Visited</th>
                <th>Send Email</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((tdata, index) => (
                <tr key={index} className="border-top">
                  <td>
                    <div className="d-flex align-items-center">
                      <div style={{ width: "25px", height: "25px", padding:"5px", position:"relative" }}>
                        <Image
                          src={tdata.image}
                          alt="icon"
                          layout="fill"
                          objectFit="cover"
                          style={{ height: "100%", width: "100%", borderRadius: "50%" }}
                        />
                      </div>
                      <div className="ms-3">
                        <h6 className="mb-0">{tdata.name}</h6>
                        <span className="text-muted">Visit Count: {tdata.visit_count}</span>
                      </div>
                    </div>
                  </td>
                  <td>{tdata.cookie_num}</td>
                  <td>
                    {tdata.status === "pending" ? (
                      <span className="p-2 bg-danger rounded-circle d-inline-block ms-3" />
                    ) : tdata.status === "holt" ? (
                      <span className="p-2 bg-warning rounded-circle d-inline-block ms-3" />
                    ) : (
                      <span className="p-2 bg-success rounded-circle d-inline-block ms-3" />
                    )}
                  </td>
                  <td>{formatDate(tdata.date_visited)}</td>
                  <td>
                    <Button color="primary" variant="shadow" onClick={() => sendEmail(tdata.id)}>
                      Send Email
                    </Button> 
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </CardBody>
    </Card>
  );
};

export default ProjectTables;
