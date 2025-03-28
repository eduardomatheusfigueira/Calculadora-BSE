import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';

const Abacus = ({ pedraPositions: initialPositions }) => {
  const [molas, setMolas] = useState({
    'Saúde': { 'Saneamento': 0.8, 'Educação': 0.3 },
    'Saneamento': { 'Educação': 0.5 },
    'Educação': {}
  });
  const [pedraPositions, setPedraPositions] = useState(initialPositions || {
    'Saúde': 300,
    'Saneamento': 400,
    'Educação': 200
  });
  const [isDragging, setIsDragging] = useState(false);
  const [activePedra, setActivePedra] = useState(null);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    if (initialPositions) {
      setPedraPositions(initialPositions);
    }
  }, [initialPositions]);

  const handleMolaChange = (ind1, ind2, value) => {
    const newMolas = { ...molas };
    if (newMolas[ind1] && newMolas[ind1][ind2] !== undefined) {
      newMolas[ind1][ind2] = parseFloat(value);
    } else if (newMolas[ind2] && newMolas[ind2][ind1] !== undefined) {
      newMolas[ind2][ind2] = parseFloat(value); // Corrigido ind2 para ind1 no segundo caso, e ind1 para ind2 no acesso
    }
    setMolas(newMolas);
  };


  const handleMouseDown = (event, indicador) => {
    setIsDragging(true);
    setActivePedra(indicador);
    setOffsetY(event.clientY - event.target.cy.baseVal.value);
  };

  const handleMouseMove = (event) => {
    if (!isDragging) return;
    let y = event.clientY - offsetY;
    if (y < 100) y = 100;
    if (y > 500) y = 500;

    const deltaY = y - pedraPositions[activePedra]; // Calcula a diferença de posição

    const newPositions = { ...pedraPositions };
    newPositions[activePedra] = y; // Atualiza a pedra ativa

    // Aplica o efeito "mola" para as pedras conectadas
    for (const connectedPedra in molas[activePedra]) {
      const molaEffect = molas[activePedra][connectedPedra];
      let connectedPedraNewY = pedraPositions[connectedPedra] + deltaY * molaEffect;

      // Garante que a nova posição esteja dentro dos limites
      if (connectedPedraNewY < 100) connectedPedraNewY = 100;
      if (connectedPedraNewY > 500) connectedPedraNewY = 500;
      newPositions[connectedPedra] = connectedPedraNewY;
    }

    // Para molas bidirecionais (se 'Saneamento' também influencia 'Saúde', por exemplo)
    for (const indicador in molas) {
      if (molas[indicador].hasOwnProperty(activePedra) && indicador !== activePedra) {
        const molaEffect = molas[indicador][activePedra];
        let connectedPedraNewY = pedraPositions[indicador] + deltaY * molaEffect;
         if (connectedPedraNewY < 100) connectedPedraNewY = 100;
        if (connectedPedraNewY > 500) connectedPedraNewY = 500;
        newPositions[indicador] = connectedPedraNewY;
      }
    }


    setPedraPositions(newPositions);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setActivePedra(null);
  };

  const calculateValue = (position) => {
    return ((500 - position) / 400).toFixed(2);
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4 justify-content-center">
        <Col xs={12} className="text-center">
          <h1>Ábaco de Indicadores Interativo</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card className="shadow">
            <Card.Body>
              <Card.Title>Ábaco</Card.Title>
              <Card.Text>
                Arraste as pedras para interagir com o ábaco. Os valores abaixo refletem os resultados dos cálculos.
              </Card.Text>
              <div style={{ height: '600px', border: '1px solid #ccc', position: 'relative', overflow: 'hidden' }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}>
                <svg width="100%" height="100%">
                  <line x1="150" y1="100" x2="150" y2="500" stroke="#8B4513" strokeWidth="6" />
                  <line x1="148" y1="100" x2="148" y2="500" stroke="#D2B48C" strokeWidth="2" />
                  <line x1="152" y1="100" x2="152" y2="500" stroke="#D2B48C" strokeWidth="2" />

                  <line x1="400" y1="100" x2="400" y2="500" stroke="#8B4513" strokeWidth="6" />
                  <line x1="398" y1="100" x2="398" y2="500" stroke="#D2B48C" strokeWidth="2" />
                  <line x1="402" y1="100" x2="402" y2="500" stroke="#D2B48C" strokeWidth="2" />

                  <line x1="650" y1="100" x2="650" y2="500" stroke="#8B4513" strokeWidth="6" />
                  <line x1="648" y1="100" x2="648" y2="500" stroke="#D2B48C" strokeWidth="2" />
                  <line x1="652" y1="100" x2="652" y2="500" stroke="#D2B48C" strokeWidth="2" />

                  <circle cx="150" cy={pedraPositions['Saúde']} r="25" fill="#1E90FF" stroke="#104E8B" strokeWidth="3" style={{cursor: 'grab'}}
                    onMouseDown={(e) => handleMouseDown(e, 'Saúde')}
                  />
                  <circle cx="400" cy={pedraPositions['Saneamento']} r="25" fill="#1E90FF" stroke="#104E8B" strokeWidth="3" style={{cursor: 'grab'}}
                    onMouseDown={(e) => handleMouseDown(e, 'Saneamento')}
                  />
                  <circle cx="650" cy={pedraPositions['Educação']} r="25" fill="#1E90FF" stroke="#104E8B" strokeWidth="3" style={{cursor: 'grab'}}
                    onMouseDown={(e) => handleMouseDown(e, 'Educação')}
                  />

                  <line x1="150" y1={pedraPositions['Saúde']} x2="400" y2={pedraPositions['Saneamento']} stroke="#FF4500" strokeWidth={molas['Saúde']['Saneamento'] * 5 + 1} strokeDasharray="4 2" />
                  <line x1="150" y1={pedraPositions['Saúde']} x2="650" y2={pedraPositions['Educação']} stroke="#FF4500" strokeWidth={molas['Saúde']['Educação'] * 5 + 1} strokeDasharray="4 2" />
                  <line x1="400" y1={pedraPositions['Saneamento']} x2="650" y2={pedraPositions['Educação']} stroke="#FF4500" strokeWidth={molas['Saneamento']['Educação'] * 5 + 1} strokeDasharray="4 2" />

                   <text x="150" y="80" textAnchor="middle" style={{fontSize: '14px', fontWeight: 'bold', fill: '#333'}}>Saúde</text>
                   <text x="400" y="80" textAnchor="middle" style={{fontSize: '14px', fontWeight: 'bold', fill: '#333'}}>Saneamento</text>
                   <text x="650" y="80" textAnchor="middle" style={{fontSize: '14px', fontWeight: 'bold', fill: '#333'}}>Educação</text>

                   <text x="150" y="520" textAnchor="middle" style={{fontSize: '12px', fill: '#333'}}>Valor: {calculateValue(pedraPositions['Saúde'])}</text>
                   <text x="400" y="520" textAnchor="middle" style={{fontSize: '12px', fill: '#333'}}>Valor: {calculateValue(pedraPositions['Saneamento'])}</text>
                   <text x="650" y="520" textAnchor="middle" style={{fontSize: '12px', fill: '#333'}}>Valor: {calculateValue(pedraPositions['Educação'])}</text>
                </svg>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow">
            <Card.Body>
              <Card.Title>Controles do Ábaco</Card.Title>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Editar Molas (Tolerância)</Form.Label>
                  <div className="mb-2">
                    <Form.Label htmlFor="molaSaudeSaneamento" style={{fontSize: '0.9rem'}}>Saúde - Saneamento:</Form.Label>
                    <Form.Control id="molaSaudeSaneamento" type="number" size="sm" defaultValue={molas['Saúde']['Saneamento']} onChange={(e) => handleMolaChange('Saúde', 'Saneamento', e.target.value)} />
                  </div>
                  <div className="mb-2">
                    <Form.Label htmlFor="molaSaudeEducacao" style={{fontSize: '0.9rem'}}>Saúde - Educação:</Form.Label>
                    <Form.Control id="molaSaudeEducacao" type="number" size="sm" defaultValue={molas['Saúde']['Educação']} onChange={(e) => handleMolaChange('Saúde', 'Educação', e.target.value)} />
                  </div>
                  <div className="mb-2">
                    <Form.Label htmlFor="molaSaneamentoEducacao" style={{fontSize: '0.9rem'}}>Saneamento - Educação:</Form.Label>
                    <Form.Control id="molaSaneamentoEducacao" type="number" size="sm" defaultValue={molas['Saneamento']['Educação']} onChange={(e) => handleMolaChange('Saneamento', 'Educação', e.target.value)} />
                  </div>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Adicionar Nova Haste</Form.Label>
                  <Form.Control type="text" placeholder="Nome da Haste" />
                  <Button variant="primary" className="mt-2">Adicionar Haste</Button>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Abacus;
