import React from "react";
import {
  Row,
  Col,
  CardTitle,
  CardBody,
  Button,
  Card,
  CardSubtitle,
} from "reactstrap";
import Image from "next/image";
import simg from "../src/assets/images/background/icons2.jpg";

const About = () => {
  const features = [
    {
      title: "Chrome Extension Tracking",
      desc: "A Chrome extension monitors user activity and cookies across all tabs, ensuring comprehensive tracking of the data being shared with websites.",
      icon: "bi bi-google",
    },
    {
      title: "Scheduled Data Transmission",
      desc: "A cron job transfers data from the 15 most recent tabs to our Django backend every 15 minutes, ensuring timely updates and accurate analysis.",
      icon: "bi bi-globe2",
    },
    {
      title: "Risk Assessment",
      desc: "Data is processed through a vector database to evaluate the danger level of each cookie (high, medium, low). An average danger level is calculated to inform users of their overall risk.",
      icon: "bi-lock",
    },
    {
      title: "Database Update",
      desc: "Information is stored in a MySQL database on a PHP server, maintaining an organized and secure record of user data and cookie assessments.",
      icon: "bi bi-database-fill-lock",
    },
    {
      title: "User Dashboard",
      desc: "The Next.js frontend dashboard provides a user-friendly interface showing detailed summaries of cookie data, risk levels, email activities, and visual graphs of data trends over time.",
      icon: "bi-gear",
    },
    {
      title: "Automated Data Removal Requests",
      desc: "Emails are automatically sent to customer support of companies that have collected sensitive data, using the user's registered email to request data removal.",
      icon: "bi-star",
    },
  ];
  return (
    <Row>
      <Col>
        {/* --------------------------------------------------------------------------------*/}
        {/* Card-1*/}
        {/* --------------------------------------------------------------------------------*/}
        <Card>
          <CardBody>
            <h4>Achilles</h4>
            <p>
            Our service empowers users to regain control over their personal data by tracking where their sensitive information is shared online. 
            We analyze the data's sensitivity and handle requests to delete it from companies' databases, ensuring better privacy and security for users.
            </p>

          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Row>
              {features.map((feature) => (
                <Col lg="4" className="mb-5 pb-3" key={feature.title}>
                  <div>
                    <i className={`bi ${feature.icon} text-primary fs-2`} />

                    <CardTitle tag="h5" className="my-3">
                      {feature.title}
                    </CardTitle>
                    <CardSubtitle className="text-muted col-10">
                      {feature.desc}
                    </CardSubtitle>
                  </div>
                </Col>
              ))}
            </Row>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default About;
