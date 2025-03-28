import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Navbar, Nav, Offcanvas, Table, Modal } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { calculateBenefits } from './calculator';
import About from './components/About';
import Abacus from './components/Abacus'; // Importe o componente Abacus

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [interventionValue, setInterventionValue] = useState(0);
  const [interventionType, setInterventionType] = useState('percentage_esgoto');
  const [selectedIndicators, setSelectedIndicators] = useState([]);
  const [results, setResults] = useState([]);
  const [chartData, setChartData] = useState({});
  const [activeSection, setActiveSection] = useState('calculator'); // Changed from key to activeSection
  const [abacusPositions, setAbacusPositions] = useState({ // Estado para as posições do Ábaco
    'Saúde': 300,
    'Saneamento': 400,
    'Educação': 200
  });

  const [editingCoefficients, setEditingCoefficients] = useState({});
  const [editingJobCoefficients, setEditingJobCoefficients] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentCoefficient, setCurrentCoefficient] = useState(null);
  const [newCoefficient, setNewCoefficient] = useState({ mainIndicator: '', subIndicator: '', coefficient: '', inputUnit: '', outputUnit: '' });
  const [newJobCoefficient, setNewJobCoefficient] = useState({ indicator: '', coefficient: '', inputUnit: '', outputUnit: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [isJobCoefficient, setIsJobCoefficient] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // State for sidebar visibility

  useEffect(() => {
    updateSelectedIndicators(interventionType);

    const initialEditingCoefficients = {};
    if (calculateBenefits.coeficientes) {
      for (const mainIndicator in calculateBenefits.coeficientes) {
        initialEditingCoefficients[mainIndicator] = {};
        for (const subIndicator in calculateBenefits.coeficientes[mainIndicator]) {
          initialEditingCoefficients[mainIndicator][subIndicator] = {
            coefficient: calculateBenefits.coeficientes[mainIndicator][subIndicator].coefficient,
            inputUnit: calculateBenefits.coeficientes[mainIndicator][subIndicator].inputUnit,
            outputUnit: calculateBenefits.coeficientes[mainIndicator][subIndicator].outputUnit
          };
        }
      }
    }
    setEditingCoefficients(initialEditingCoefficients);

    const initialEditingJobCoefficients = {};
    if (calculateBenefits.coeficientes_empregos) {
      for (const indicator in calculateBenefits.coeficientes_empregos) {
        initialEditingJobCoefficients[indicator] = {
          coefficient: calculateBenefits.coeficientes_empregos[indicator].coefficient,
          inputUnit: calculateBenefits.coeficientes_empregos[indicator].inputUnit,
          outputUnit: calculateBenefits.coeficientes_empregos[indicator].outputUnit
        };
      }
    }
    setEditingJobCoefficients(initialEditingJobCoefficients);

  }, []);

  const updateSelectedIndicators = (type) => {
    let initialIndicators = [];
    if (type.startsWith('percentage_')) {
      initialIndicators = Object.keys(calculateBenefits.coeficientes);
    } else if (type === 'money') {
      initialIndicators = Object.keys(calculateBenefits.coeficientes_empregos).concat(
        "Geração de Empregos Diretos",
        "Total de Salários Gerados",
        "Renda Gerada no Setor de Insumos",
        "Renda Total Gerada na Economia"
      );
    }
    setSelectedIndicators(initialIndicators);
  };

  const handleInterventionTypeChange = (e) => {
    setInterventionType(e.target.value);
    updateSelectedIndicators(e.target.value);
  }

  const handleCalculate = () => {
    const coverageIncrease = interventionType.startsWith('percentage_') ? interventionValue : 0;
    const investment = interventionType === 'money' ? interventionValue : 0;

    const calculatedResults = calculateBenefits.calculate(
      interventionType,
      coverageIncrease,
      investment,
      selectedIndicators
    );
    setResults(calculatedResults);

    const backgroundColors = calculatedResults.map(r => r.retorno > 0 ? 'bg-success' : 'bg-danger');

    setChartData({
      labels: calculatedResults.map(r => r.indicador),
      datasets: [{
        label: 'Retorno',
        data: calculatedResults.map(r => r.retorno),
        backgroundColor: backgroundColors,
      }]
    });

    // Atualizar posições do Abacus com base nos resultados
    updateAbacusPositions(calculatedResults);
  };

  const updateAbacusPositions = (results) => {
    const newPositions = { ...abacusPositions };
    const maxAbacusRange = 400; // Intervalo de movimento vertical do Ábaco (500 - 100)
    const maxBenefitValues = { // TODO: Determine valores máximos razoáveis ou use valores dinâmicos
      'Saúde': 10000000, // Exemplo de valor máximo para "Economia nos Custos com Saúde"
      'Saneamento': 10,     // Exemplo de valor máximo para "Aumento no Valor dos Imóveis" (%)
      'Educação': 1        // Exemplo de valor máximo para "Aumento na Escolaridade Média" (%)
    };


    results.forEach(result => {
      let abacusIndicator = '';
      let benefitValue = result.retorno;

      if (result.indicador === "Economia nos Custos com Saúde") {
        abacusIndicator = 'Saúde';
      } else if (result.indicador === "Aumento no Valor dos Imóveis") {
        abacusIndicator = 'Saneamento';
      } else if (result.indicador === "Aumento na Escolaridade Média") {
        abacusIndicator = 'Educação';
      }

      if (abacusIndicator) {
        // Mapear o valor do benefício para a posição Y no Ábaco (100 - 500)
        let position = 500 - (benefitValue / maxBenefitValues[abacusIndicator]) * maxAbacusRange;
        if (position < 100) position = 100; // Limite superior
        if (position > 500) position = 500; // Limite inferior
        newPositions[abacusIndicator] = position;
      }
    });
    setAbacusPositions(newPositions);
  };


  const handleEdit = (mainIndicator, subIndicator, coefficient, inputUnit, outputUnit, isJob = false) => {
    setIsJobCoefficient(isJob);
    if (isJob) {
      setCurrentCoefficient({ indicator: mainIndicator, coefficient, inputUnit, outputUnit });
      setNewJobCoefficient({ indicator: mainIndicator, coefficient, inputUnit, outputUnit });
    } else {
      setCurrentCoefficient({ mainIndicator, subIndicator, coefficient, inputUnit, outputUnit });
      setNewCoefficient({ mainIndicator, subIndicator, coefficient, inputUnit, outputUnit });
    }

    setShowEditModal(true);
    setIsAdding(false);
  };

  const handleAdd = (isJob = false) => {
    setIsJobCoefficient(isJob);
    setIsAdding(true);
    setShowEditModal(true);
    if (isJob) {
      setNewJobCoefficient({ indicator: '', coefficient: '', inputUnit: '', outputUnit: '' });
    } else {
      setNewCoefficient({ mainIndicator: '', subIndicator: '', coefficient: '', inputUnit: '', outputUnit: '' });
    }
  };

  const handleDelete = (mainIndicator, subIndicator, isJob = false) => {
    if (isJob) {
      const updatedCoefficients = { ...editingJobCoefficients };
      delete updatedCoefficients[mainIndicator];
      setEditingJobCoefficients(updatedCoefficients);

      // Update calculateBenefits object
      delete calculateBenefits.coeficientes_empregos[mainIndicator];
    } else {
      const updatedCoefficients = { ...editingCoefficients };
      if (subIndicator) {
        delete updatedCoefficients[mainIndicator][subIndicator];
        if (Object.keys(updatedCoefficients[mainIndicator]).length === 0) {
          delete updatedCoefficients[mainIndicator];

          // Update calculateBenefits object
          delete calculateBenefits.coeficientes[mainIndicator];
        } else {
          // Update calculateBenefits object
          delete calculateBenefits.coeficientes[mainIndicator][subIndicator];
        }
      } else {
        delete updatedCoefficients[mainIndicator];
        // Update calculateBenefits object
        delete calculateBenefits.coeficientes[mainIndicator];
      }
      setEditingCoefficients(updatedCoefficients);
    }
  };

  const handleUpdate = () => {
    if (isJobCoefficient) {
      const updatedCoefficients = { ...editingJobCoefficients };
      if (isAdding) {
        updatedCoefficients[newJobCoefficient.indicator] = {
          coefficient: parseFloat(newJobCoefficient.coefficient),
          inputUnit: newJobCoefficient.inputUnit,
          outputUnit: newJobCoefficient.outputUnit
        };
        // Update calculateBenefits object
        calculateBenefits.coeficientes_empregos[newJobCoefficient.indicator] = {
          coefficient: parseFloat(newJobCoefficient.coefficient),
          inputUnit: newJobCoefficient.inputUnit,
          outputUnit: newJobCoefficient.outputUnit
        };
      } else {
        updatedCoefficients[currentCoefficient.indicator] = {
          coefficient: parseFloat(newJobCoefficient.coefficient),
          inputUnit: newJobCoefficient.inputUnit,
          outputUnit: newJobCoefficient.outputUnit
        };
        // Update calculateBenefits object
        calculateBenefits.coeficientes_empregos[currentCoefficient.indicator] = {
          coefficient: parseFloat(newJobCoefficient.coefficient),
          inputUnit: newJobCoefficient.inputUnit,
          outputUnit: newJobCoefficient.outputUnit
        };
      }
      setEditingJobCoefficients(updatedCoefficients);
    } else {
      const updatedCoefficients = { ...editingCoefficients };
      if (isAdding) {
        if (!updatedCoefficients[newCoefficient.mainIndicator]) {
          updatedCoefficients[newCoefficient.mainIndicator] = {};
        }
        updatedCoefficients[newCoefficient.mainIndicator][newCoefficient.subIndicator] = {
          coefficient: parseFloat(newCoefficient.coefficient),
          inputUnit: newCoefficient.inputUnit,
          outputUnit: newCoefficient.outputUnit
        };
        // Update calculateBenefits object
        if (!calculateBenefits.coeficientes[newCoefficient.mainIndicator]) {
          calculateBenefits.coeficientes[newCoefficient.mainIndicator] = {};
        }
        calculateBenefits.coeficientes[newCoefficient.mainIndicator][newCoefficient.subIndicator] = {
          coefficient: parseFloat(newCoefficient.coefficient),
          inputUnit: newCoefficient.inputUnit,
          outputUnit: newCoefficient.outputUnit
        };
      } else {
        updatedCoefficients[currentCoefficient.mainIndicator][currentCoefficient.subIndicator] = {
          coefficient: parseFloat(newCoefficient.coefficient),
          inputUnit: newCoefficient.inputUnit,
          outputUnit: newCoefficient.outputUnit
        };
        // Update calculateBenefits object
        calculateBenefits.coeficientes[currentCoefficient.mainIndicator][currentCoefficient.subIndicator] = {
          coefficient: parseFloat(newCoefficient.coefficient),
          inputUnit: newCoefficient.inputUnit,
          outputUnit: newCoefficient.outputUnit
        };
      }
      setEditingCoefficients(updatedCoefficients);
    }

    setShowEditModal(false);
    setIsAdding(false);
    setCurrentCoefficient(null);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setIsAdding(false);
    setCurrentCoefficient(null);
  };

  const getFilteredIndicators = () => {
    if (interventionType.startsWith('percentage_')) {
      return selectedIndicators.filter(indicator =>
        calculateBenefits.coeficientes.hasOwnProperty(indicator)
      );
    } else if (interventionType === 'money') {
      return selectedIndicators.filter(indicator =>
        calculateBenefits.coeficientes_empregos.hasOwnProperty(indicator) ||
        ["Geração de Empregos Diretos", "Total de Salários Gerados", "Renda Gerada no Setor de Insumos", "Renda Total Gerada na Economia"].includes(indicator)
      );
    }
    return [];
  };

  const getInterventionLabel = () => {
    switch (interventionType) {
      case 'percentage_esgoto':
        return 'Aumento percentual no acesso à rede de esgoto';
      case 'percentage_agua':
        return 'Aumento percentual no acesso à água tratada';
      case 'percentage_banheiro':
        return 'Aumento percentual na disponibilidade de banheiro';
      case 'money':
        return 'Investimento (R$)';
      default:
        return 'Valor da Intervenção';
    }
  };

  const getChartTitle = () => {
    if (interventionType === 'money') {
      return `Investimento de R$${interventionValue.toFixed(2)}`;
    } else {
      let area = '';
      if (interventionType === 'percentage_esgoto') area = 'acesso à rede de esgoto';
      if (interventionType === 'percentage_agua') area = 'acesso à água tratada';
      if (interventionType === 'percentage_banheiro') area = 'disponibilidade de banheiro';

      return `Aumento de ${interventionValue}% no ${area}`;
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'calculator':
        return (
          <Card className="shadow">
            <Card.Body>
              <Card.Text className="text-center">
                Insira o valor do investimento em saneamento para calcular os retornos estimados.
              </Card.Text>

              <Row className="align-items-end">
                <Col xs={12} md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>{getInterventionLabel()}</Form.Label>
                    <Form.Control
                      type="number"
                      value={interventionValue}
                      onChange={(e) => setInterventionValue(parseFloat(e.target.value))}
                      className="mb-2"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Tipo de Intervenção:</Form.Label>
                    <Form.Select
                      value={interventionType}
                      onChange={handleInterventionTypeChange}
                      className="mb-2"
                    >
                      <option value="percentage_esgoto">Aumento percentual no acesso à rede de esgoto</option>
                      <option value="percentage_agua">Aumento percentual no acesso à água tratada</option>
                      <option value="percentage_banheiro">Aumento percentual na disponibilidade de banheiro</option>
                      <option value="money">Investimento (R$)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <h4 className="mt-4 text-center">Selecione os Indicadores:</h4>
                  <div className="d-flex flex-wrap justify-content-center">
                    {getFilteredIndicators().map(area => (
                      <Form.Check
                        inline
                        key={area}
                        label={area}
                        type="checkbox"
                        value={area}
                        checked={selectedIndicators.includes(area)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIndicators([...selectedIndicators, area]);
                          } else {
                            setSelectedIndicators(selectedIndicators.filter(b => b !== area));
                          }
                        }}
                        className="mx-2"
                      />
                    ))}
                  </div>
                </Col>
              </Row>

              <Row>
                <Col className="text-center">
                  <Button variant="primary" onClick={handleCalculate} className="w-100">
                    Calcular
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );
      case 'coefficients':
        return (
          <Card className="shadow">
            <Card.Body>
              <h4 className="mb-3">Coeficientes</h4>
              <Button variant="success" className="mb-3" onClick={() => handleAdd(false)}>
                Adicionar Coeficiente
              </Button>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Indicador</th>
                      <th>Sub-Indicador</th>
                      <th>Coeficiente</th>
                      <th>Unidade de Entrada</th>
                      <th>Unidade de Saída</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(editingCoefficients).map(([mainIndicator, subCoeficientes]) => (
                      Object.entries(subCoeficientes).map(([subIndicator, { coefficient, inputUnit, outputUnit }]) => (
                        <tr key={`${mainIndicator}-${subIndicator}`}>
                          <td>{mainIndicator}</td>
                          <td>{subIndicator}</td>
                          <td>{coefficient}</td>
                          <td>{inputUnit}</td>
                          <td>{outputUnit}</td>
                          <td>
                            <Button variant="info" size="sm" onClick={() => handleEdit(mainIndicator, subIndicator, coefficient, inputUnit, outputUnit)}>
                              Editar
                            </Button>{' '}
                            <Button variant="danger" size="sm" onClick={() => handleDelete(mainIndicator, subIndicator)}>
                              Excluir
                            </Button>
                          </td>
                        </tr>
                      ))
                    ))}
                  </tbody>
                </Table>
              </div>

              <h4 className="mt-4 mb-3">Coeficientes de Empregos</h4>
              <Button variant="success" className="mb-3" onClick={() => handleAdd(true)}>
                Adicionar Coeficiente de Emprego
              </Button>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Indicador</th>
                      <th>Coeficiente</th>
                      <th>Unidade de Entrada</th>
                      <th>Unidade de Saída</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(editingJobCoefficients).map(([indicator, { coefficient, inputUnit, outputUnit }]) => (
                      <tr key={indicator}>
                        <td>{indicator}</td>
                        <td>{coefficient}</td>
                        <td>{inputUnit}</td>
                        <td>{outputUnit}</td>
                        <td>
                          <Button variant="info" size="sm" onClick={() => handleEdit(indicator, null, coefficient, inputUnit, outputUnit, true)}>
                            Editar
                          </Button>{' '}
                          <Button variant="danger" size="sm" onClick={() => handleDelete(indicator, null, true)}>
                            Excluir
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        );
      case 'about':
        return <About />;
      case 'abacus':
        return <Abacus pedraPositions={abacusPositions} />;
      default:
        return <div>Seção não encontrada</div>;
    }
  };

  return (
    <Container fluid className="p-0">
      <Navbar bg="light" expand="md" className="mb-3">
        <Container fluid>
          <Navbar.Brand href="#">Calculadora de Retornos</Navbar.Brand>
          <Navbar.Toggle aria-controls="offcanvasNavbar-expand-md" onClick={() => setShowSidebar(!showSidebar)} />
          <Navbar.Offcanvas
            id={`offcanvasNavbar-expand-md`}
            aria-labelledby={`offcanvasNavbarLabel-expand-md`}
            placement="start"
            show={showSidebar}
            onHide={() => setShowSidebar(false)}
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id={`offcanvasNavbarLabel-expand-md`}>
                Menu
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-start flex-grow-1 pe-3">
                <Nav.Link onClick={() => {setActiveSection('calculator'); setShowSidebar(false);}}>Calculadora</Nav.Link>
                <Nav.Link onClick={() => {setActiveSection('coefficients'); setShowSidebar(false);}}>Coeficientes</Nav.Link>
                <Nav.Link onClick={() => {setActiveSection('abacus'); setShowSidebar(false);}}>Ábaco</Nav.Link>
                <Nav.Link onClick={() => {setActiveSection('about'); setShowSidebar(false);}}>Sobre</Nav.Link>
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>

      <Container fluid className="px-4">
        <Row className="mb-4 justify-content-center">
          <Col xs={12} className="text-center">
            <h1>Calculadora de Retornos de Investimentos em Saneamento</h1>
          </Col>
        </Row>

        {activeSection === 'calculator' && (
          <Row className="justify-content-center">
            <Col md={10} lg={8}>
              {renderSection()}
              {results.length > 0 && (
                <Card className="mt-4 shadow">
                  <Card.Body>
                    <h2 className="text-center mb-3">{getChartTitle()}</h2>
                    <Bar data={chartData} options={{
                      plugins: {
                        title: {
                          display: true,
                          text: `Retornos Estimados (${getChartTitle()})`,
                        },
                      },
                    }} />
                    <Row className="mt-4">
                      {results.map((result, index) => (
                        <Col key={index} xs={12} md={6} lg={4} className="mb-4">
                          <Card className={`border-0 shadow-sm ${result.retorno > 0 ? 'text-white bg-success' : 'text-white bg-danger'}`}>
                            <Card.Body>
                              <Card.Title className="text-center">{result.retorno_formatado}</Card.Title>
                              <Card.Text className="text-center">{result.indicador}</Card.Text>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        )}

        {activeSection === 'coefficients' && (
          <Row className="justify-content-center">
            <Col md={12} lg={10}>
              {renderSection()}
            </Col>
          </Row>
        )}

        {activeSection === 'about' && (
          <Row className="justify-content-center">
            <Col md={8}>
              {renderSection()}
            </Col>
          </Row>
        )}

        {activeSection === 'abacus' && (
          <Row className="justify-content-center">
            <Col md={12}>
              {renderSection()}
            </Col>
          </Row>
        )}


        <Modal show={showEditModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>{isAdding ? 'Adicionar' : 'Editar'} Coeficiente</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              {isJobCoefficient ? (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Indicador</Form.Label>
                    <Form.Control
                      type="text"
                      value={newJobCoefficient.indicator}
                      onChange={(e) => setNewJobCoefficient({ ...newJobCoefficient, indicator: e.target.value })}
                      disabled={!isAdding}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Coeficiente</Form.Label>
                    <Form.Control
                      type="number"
                      value={newJobCoefficient.coefficient}
                      onChange={(e) => setNewJobCoefficient({ ...newJobCoefficient, coefficient: e.target.value })}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Unidade de Entrada</Form.Label>
                    <Form.Control
                      type="text"
                      value={newJobCoefficient.inputUnit}
                      onChange={(e) => setNewJobCoefficient({ ...newJobCoefficient, inputUnit: e.target.value })}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Unidade de Saída</Form.Label>
                    <Form.Control
                      type="text"
                      value={newJobCoefficient.outputUnit}
                      onChange={(e) => setNewJobCoefficient({ ...newJobCoefficient, outputUnit: e.target.value })}
                    />
                  </Form.Group>
                </>
              ) : (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Indicador Principal</Form.Label>
                    <Form.Control
                      type="text"
                      value={newCoefficient.mainIndicator}
                      onChange={(e) => setNewCoefficient({ ...newCoefficient, mainIndicator: e.target.value })}
                      disabled={!isAdding}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Sub-Indicador</Form.Label>
                    <Form.Control
                      type="text"
                      value={newCoefficient.subIndicator}
                      onChange={(e) => setNewCoefficient({ ...newCoefficient, subIndicator: e.target.value })}
                      disabled={!isAdding}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Coeficiente</Form.Label>
                    <Form.Control
                      type="number"
                      value={newCoefficient.coefficient}
                      onChange={(e) => setNewCoefficient({ ...newCoefficient, coefficient: e.target.value })}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Unidade de Entrada</Form.Label>
                    <Form.Control
                      type="text"
                      value={newCoefficient.inputUnit}
                      onChange={(e) => setNewCoefficient({ ...newCoefficient, inputUnit: e.target.value })}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Unidade de Saída</Form.Label>
                    <Form.Control
                      type="text"
                      value={newCoefficient.outputUnit}
                      onChange={(e) => setNewCoefficient({ ...newCoefficient, outputUnit: e.target.value })}
                    />
                  </Form.Group>
                </>
              )}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleUpdate}>
              {isAdding ? 'Adicionar' : 'Atualizar'}
            </Button>
          </Modal.Footer>
        </Modal>

        <footer className="mt-5 p-3 bg-light text-center">
          <small>Desenvolvido por Itaipu Parquetec, Itaipu Binacional e Sanepar</small><br/>
          <small>Contato: contato@itaipuparquetec.com.br</small>
        </footer>
      </Container>
    </Container>
  );
}

export default App;
