import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Container, Button, Card, Row, Col } from "react-bootstrap";
import { useSpring, animated, useTrail } from "@react-spring/web";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // مهم: بدون /api هنا
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/users`
        );
        setUsers(response.data);
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des utilisateurs.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [API_BASE_URL]);

  const handleApprove = async (userId) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/users/approve/${userId}`
      );

      // نحذف من القائمة لأنه انتقل إلى Users
      setUsers(users.filter(user => user._id !== userId));

    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'approbation de l'utilisateur.");
    }
  };

  const handleReject = async (userId) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/users/reject/${userId}`
      );

      setUsers(users.filter(user => user._id !== userId));

    } catch (err) {
      console.error(err);
      setError("Erreur lors du rejet de l'utilisateur.");
    }
  };

  const rowAnimation = useTrail(users.length, {
    opacity: 1,
    x: 0,
    from: { opacity: 0, x: 20 },
    config: { tension: 180, friction: 12 }
  });

  const buttonAnimation = useSpring({
    transform: "scale(1)",
    from: { transform: "scale(0.9)" },
    config: { tension: 120, friction: 10 }
  });

  if (loading) return <div className="text-center">Chargement...</div>;
  if (error) return <div className="text-danger text-center">{error}</div>;

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4 text-center text-primary">
        Tableau des utilisateurs en attente
      </h2>

      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="shadow-sm">
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead className="table-light">
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Entreprise</th>
                    <th>Type</th>
                    <th>Adresse</th>
                    <th>Email pro</th>
                    <th>Téléphone</th>
                    <th>Site web</th>
                    <th>Description</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {rowAnimation.map((style, index) => {
                    const user = users[index];
                    return (
                      <animated.tr key={user._id} style={style}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.companyName}</td>
                        <td>{user.businessType}</td>
                        <td>{user.address}</td>
                        <td>{user.professionalEmail}</td>
                        <td>{user.phone}</td>
                        <td>{user.website}</td>
                        <td>{user.businessDescription}</td>
                        <td>{user.status}</td>
                        <td className="d-flex justify-content-around">
                          <animated.div style={buttonAnimation}>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApprove(user._id)}
                            >
                              Approuver
                            </Button>
                          </animated.div>

                          <animated.div style={buttonAnimation}>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleReject(user._id)}
                            >
                              Rejeter
                            </Button>
                          </animated.div>
                        </td>
                      </animated.tr>
                    );
                  })}
                </tbody>

              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
