// pages/404.js (Custom 404 page for Next.js)
import React from 'react';
import { Row, Col, Button, Container } from 'react-bootstrap';
import Link from 'next/link'; // Use Next.js Link

const Custom404 = () => {
  return (
    <Container className="text-center py-5" style={{ minHeight: '60vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Row>
        <Col>
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p className="text-muted">Sorry, the page you are looking for doesn't exist or has been moved.</p>
          <Link href="/" passHref legacyBehavior>
            <Button variant="primary" className="mt-3">Go to Home Page</Button>
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default Custom404; 