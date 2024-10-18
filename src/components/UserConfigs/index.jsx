import { Component } from "react";
import { Container, Table, Form, Row, Col, InputGroup, FormControl, ButtonGroup, ToggleButton, Card } from 'react-bootstrap';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import './index.css';
import HttpService from '../../services/HttpService';
import HttpServiceHandler from '../../services/HttpServiceHandler';
import ErroModal from '../ErroModal';
import Button from 'react-bootstrap/Button';
import MenuLogado from '../MenuLogado';
import { Modal } from 'react-bootstrap';
import ConfirmacaoModal from "../ConfirmacaoModal";
import Switch from "react-switch";

const TipoAlerta = {
  0:"Selecione",
  1:"Temperatura",
  2:"Umidade"
} 

function getAlertaById (configs, idAlerta) {
  return configs.filter(el => el.idAlerta == idAlerta)[0];
}

function getIndexAlertaById (configs, idAlerta) {
  for (let i = 0; i < configs.length; i++) {
    
    if (configs[i].idAlerta == idAlerta)
      return i;  
  }

}

const dadosLimpos = {      
  configKey:"",
  configValue:""
}

export default class configs extends Component{

  constructor(props){
    super(props);

    this.state = {
      ...dadosLimpos,
      configs : [],   
      isEdicao: false,
      isNovo: false,
      erroModal : {
        mensagemErro : '',
        show : false,
        titulo : ''
      },
      sucessoModal : {
        mensagem : '',
        show : false,
        redirect : ''
      }, 
      confirmacaoModal : {
        perguntaConfirmacao : '',
        show : false,
        titulo : '',
        callBackSim : null
      },      
    };

    this.closeErroModal = () => {
      this.setState({
        erroModal : {
          mensagemErro : '',
          showModalErro : false,
          titulo : ''
        }
      });
    }

    this.closeSucessoModal = () => {
      if (this.state.sucessoModal.redirect) {
        window.location = this.state.sucessoModal.redirect;
      }

      this.setState({
        sucessoModal : {
          mensagem : '',
          show : false
        }
      });
    }

    this.obterLista = () => {
      HttpService.listarConfigs ()
      .then((response) => {
        if (response){
          this.setState(prevState => ({
            ...prevState,
            configs : response.status == 204 ? this.state.configs : response.data,
            filtros : {
              ...prevState.filtros
            }
          }));
        }
      })
      .catch((error) => {
        let httpServiceHandler = new HttpServiceHandler();
        httpServiceHandler.validarExceptionHTTP(error,this);
      })
    }

    this.toggleStatusAlerta = (e, configs, idAlerta) => {
      console.log('toggleStatusAlerta');
      configs = [...configs];
      configs[getIndexAlertaById(configs,idAlerta)].isHabilitado = e;

      HttpService.salvarAlerta({
        isHabilitado : e,
      },
      idAlerta
      )
      .then((response) => {
        this.setState(prevState => ({
          ...prevState,
          configs : configs
        }), () => {
          this.obterLista();
        });

      })
      .catch((error) => {
        new HttpServiceHandler().validarExceptionHTTP(error, this);
      }); 


    }

    this.abrirSucessoModal = (msg,redirect) => {
      this.setState({
        sucessoModal : {
          mensagem : msg,
          show : true,
          redirect : redirect
        }
      });
    }


    this.exibirDadosConfig = (configKey) => {
      this.limparDados();
      this.setState(prevState => ({
        ...prevState, 
        configKey : configKey,
        configValue : this.state.configs[configKey],
        isEdicao: true,
        isNovo: false
      }));
    }


    this.salvarConfig = (e) => {

      let jsonRequest = {[this.state.configKey]: this.state.configValue };

      HttpService.salvarConfig(jsonRequest)
      .then((response) => {
        if (response) {
          this.setState({
            sucessoModal : {
              mensagem : (this.state.idAlerta == 0)?'Configuração alterada com sucesso.':'Config atualizada',
              show : true
            }
          });
        }

      this.setState(prevState => ({
        ...prevState,
        ...dadosLimpos,
        isEdicao: false,
        isNovo: false
      }), () => {
        this.obterLista();
      });

      })
      .catch((error) => {
        new HttpServiceHandler().validarExceptionHTTP(error, this);
      }); 
    }

    this.cancelar = () => {

      this.setState(prevState => ({
        ...prevState,
        ...dadosLimpos,
        isNovo: false,
        isEdicao: false
      }), () => {
        this.obterLista();
      });
    }

    this.handleChange = (e) => {
      
      console.log(e.target.type);
      console.log(e.target.value);
      console.log('e.target.name ' + e.target.name);

      const name = e.target.name;
      const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      this.setState(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  
    this.limparDados = (e) => {
      console.log('limpando dados');
      this.setState(prevState => ({
        ...prevState,
        ...dadosLimpos
      }
      ));
    }    
  }

  

  render(){

    return (
      <div>

        <Container className="containerConfigs" fluid>

          <Row>
            <Col xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 10, offset: 1}} lg={{span: 10, offset: 1}}>
              <MenuLogado/>
            </Col>
          </Row>

          <Row>
            <Col xs={{span: 6, offset: 0}} sm={{span : 6, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
              <h3 className="configs">Configurações do Sistema</h3>
            </Col>
          </Row>
        
          <Row className="mb-3">
            <Col xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
              <Form>
                <Row>

                  <Col xs={6}>
                    <Form.Group className="inputConfig" controlId="alertaForm.configKey">
                        <Form.Label>Nome da Configuração</Form.Label>
                        <Form.Control type="text" disabled={true} value={this.state.configKey} 
                        onChange={this.handleChange} name="configKey" required autoComplete="false" maxLength="3"
                        />
                    </Form.Group>
                  </Col>
                
                  <Col xs={6}>
                    <Form.Group className="inputConfig" controlId="alertaForm.configValue">
                        <Form.Label>Valor da configuração</Form.Label>
                        <Form.Control type="text" disabled={!(this.state.isNovo || this.state.isEdicao )} value={this.state.configValue} 
                        onChange={this.handleChange} name="configValue" required autoComplete="false" maxLength="200"
                        />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
              <Button variant="success" className="btnSalvarConfig" onClick={this.salvarConfig} disabled={!(this.state.isEdicao || this.state.isNovo )}>Salvar</Button>
              <Button variant="secondary" className="btnCancelar" onClick={this.cancelar} disabled={!(this.state.isEdicao || this.state.isNovo )}>Cancelar</Button>        
            </Col>
          </Row>

          <Row style={{marginTop : "60px"}}>
            <Col xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
              <h4>Itens de configuração </h4>
              <Table responsive="sm" striped bordered hover>
                <thead>
                  <tr>
                      <th>Configuração</th>
                      <th>Valor</th>
                  </tr>
                </thead>

                <tbody>
                {
                    Object.keys(this.state.configs).map((index) => {
                    return (
                        
                        <tr key={index}>
                        <td>{index}</td>
                        <td>{this.state.configs[index]}</td>
                        <td style={{textAlign : "center"}}>
                            {/* <Button onClick={() => {this.visualizarAula(aula.idAula)}}>Visualizar Aula</Button> */}
                            <Button onClick={() => {this.exibirDadosConfig(index)}}>Editar</Button>
                        </td>
                        </tr>
                    )
                    })
                }
                </tbody>
              </Table>
            </Col>
          </Row>

          <Modal show={this.state.sucessoModal.show} onHide={this.closeSucessoModal}>
            <Modal.Header closeButton>
              <Modal.Title>Sucesso</Modal.Title>
            </Modal.Header>
            <Modal.Body>{this.state.sucessoModal.mensagem}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={this.closeSucessoModal}>
                Ok
                </Button>
            </Modal.Footer>
          </Modal>
            
          <ErroModal closeErroModal={this.closeErroModal} erroModal={this.state.erroModal}/>
          <ConfirmacaoModal closeConfirmacaoModal={this.closeConfirmacaoModal} handleSimConfirmacaoModal={this.handleSimConfirmacaoModal} confirmacaoModal={this.state.confirmacaoModal}></ConfirmacaoModal>
        </Container>
      </div>
    )
  }

  componentDidMount() {      
    this.obterLista();
  }

}