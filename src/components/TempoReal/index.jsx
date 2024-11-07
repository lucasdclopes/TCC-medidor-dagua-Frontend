import { Component } from "react";
import { Container, Table, Row, Col } from 'react-bootstrap';
import './index.css';
import HttpService from '../../services/HttpService';
import HttpServiceHandler from '../../services/HttpServiceHandler';
import DateHelper from "../../helpers/DateHelper";
import ErroModal from '../ErroModal';
import Button from 'react-bootstrap/Button';
import MenuLogado from '../MenuLogado';
import { Modal } from 'react-bootstrap';
import React from "react";

import ReactApexChart from 'react-apexcharts'
import ApexCharts from "apexcharts";


const TEMPO_REFRESH = 4000;
const LIMITE_TABELA = 20;

const Y_MIN_PADRAO = 10;
const Y_MAX_PADRAO = 20;

var loop;

//Calcula o valor mínimo do eixo Y
function calcularMinY(min) {
  console.log('min ' + min);

  let minNovo = Y_MIN_PADRAO;
  while (min - 5 < minNovo){
    minNovo -= 2;
  }
  return minNovo;
}

//Calcula o valor máximo do eixo Y
function calcularMaxY(max) {
  console.log('max ' + max);

  let maxNovo = Y_MAX_PADRAO;
  while (max + 5 > maxNovo){
    maxNovo += 2;
  }
  return maxNovo;
}

export default class TempoReal extends Component{


  constructor(props){
    super(props);

   
    this.state = {

      //Configuraçòes do gráfico abaixo
      series: [
        {
          type: 'line',
          name: "Altura da água (cm)",
          data: new Array()
        }
      ],
      options: { 
        chart: {
          id: 'realtime',
          height: 600,
          type: 'area',
          animations: {
            enabled: true,
            easing: 'linear',
            dynamicAnimation: {
              speed: TEMPO_REFRESH
            }
          },
          toolbar: {
            show: false
          },
          zoom: {
            enabled: false
          }
        },
        colors: ['#008FFB'],
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.9,
            stops: [0, 90, 100]
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'smooth'
        },
        title: {
          text: 'Monitoramento em tempo real',
          align: 'left'
        },
        markers: {
          size: 0
        },
        xaxis: {
          type: 'datetime',
          range: TEMPO_REFRESH * 10 
        },
        yaxis: {
          max: calcularMaxY,
          min: calcularMinY
        },
        stroke:{
          curve: 'stepline',
          //curve: 'smooth',
        },
        legend: {
          position: 'top',
          horizontalAlign: 'right',
          floating: true,
          offsetY: -25,
          offsetX: -5,
          onItemHover: {
            highlightDataSeries: false
          },
          onItemClick: {
            toggleDataSeries: false
        }
        }
      },
      //fim das configurações do gráfico
      dadosTabela: [],
      filtros : {
        paginacaoRequest : {
          size: 2,
          page: 1
        },
        tempoReal : true
      },
      erroModal : {
        mensagemErro : '',
        show : false,
        titulo : ''
      },
      sucessoModal : {
        mensagem : '',
        show : false,
        redirect : ''
      }   
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

    this.checkGerarGrafico = (dadosGrafico) => {
      return Array.isArray(dadosGrafico) && dadosGrafico.length  > 0;
    }

    this.obterLista = () => {
      //console.log('obterLista');
      let filtros = this.state.filtros;
      if (this.state.dadosTabela.length < 1){
        filtros = {
          paginacaoRequest : {
            size: LIMITE_TABELA,
            page: 1
          },
        }
      }
      //obtém os dados do servidor
      HttpService.listarMedicoes(filtros)
      .then((response) => {
        if (!response){
          return;
        }
        if (!response.data) {
          return;
        }
        let responseData = response.data;

        //evitar IDs repetidos (o gráfico atualizou mais rápido que o servidor recebeu novos dados do módulo ESP)
        if (this.state.dadosTabela){
          //console.log('organizando dados recebidos');
          responseData = responseData.filter((resp) => !(this.state.dadosTabela.map(el => el.idMedicao).includes(resp.idMedicao)));
        }

        let responseDataTabela = responseData.slice();
        if (responseData.length > 1) //a ordem do servidor é diferente da necessária pro gráfico
          responseData.reverse();

        let series = this.state.series.slice();
        let seriesDist = series[0].data;
        let dadosTabela = [...responseDataTabela,...this.state.dadosTabela];
        
        if (dadosTabela.length > LIMITE_TABELA){
          dadosTabela.pop(); 
        }
        //De tempo em tempo é necessário limpar o gráfico
        //Se limpar com muita frequência, o gráfico fica redesenhando constantemente. 
        //Se demorar para limpar, ocupa muita memória.
        if (seriesDist.length > 1000) {
          console.log('limpando');
          //mantém somente os últimos 20 registros
            series = [{ 
              data: seriesDist.slice(seriesDist.length - 20, seriesDist.length)
            }]       
        } 

        for (let i = 0; i < responseData.length; i++) {
          let dataItemDist = {
            x : DateHelper.stringIsoParaJs(responseData[i].dtMedicao),
            y : response.data[i].vlDistancia
          }
          seriesDist.push(dataItemDist); 
          //coloca os novos dados de medição no fim do array,
          //array este que está atrelado ao gráfico
        }

        //atualiza o gráfico
        ApexCharts.exec('realtime', 'updateSeries', [{   
          data: seriesDist  
        }]);

        //atualiza os dados no state
        this.setState(prevState => ({
          ...prevState,
          series : series,
          dadosTabela : dadosTabela,
          filtros : {
            ...prevState.filtros
          }
        }));
        
      })
      .catch((error) => {
        console.log(error);
        let httpServiceHandler = new HttpServiceHandler();
        httpServiceHandler.validarExceptionHTTP(error,this);
      })
      //this.limparFiltros();
    }

  }

  render(){
    return (
      <div>

        <Container className="containerTempoReal" fluid>

          <Row>
            <Col xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 10, offset: 1}} lg={{span: 10, offset: 1}}>
              <MenuLogado/>
            </Col>
          </Row>

          <Row>
            <Col xs={{span: 6, offset: 0}} sm={{span : 6, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
              <h3 className="Dados">Dados</h3>
            </Col>
          </Row>
          
          {
            //verifica se tem dados na serie do gráfico pra poder desenhá-lo
          (this.checkGerarGrafico(this.state.series[0].data)) && 
          <Col style={{marginTop : "60px"}} xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
          <ReactApexChart options={this.state.options} series={this.state.series} type="line" height={600} />
          </Col>
          }

          <Row style={{marginTop : "60px"}}>
            <Col xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
              <h4>Dados recentes mensurados </h4>
              <Table responsive="sm" striped bordered hover>
                <thead>
                  <tr>
                      <th>#</th>
                      <th>Nível (cm)</th>
                      <th>Momento da Medição</th>
                  </tr>
                </thead>

                <tbody>
                {
                    this.state.dadosTabela.map((dado) => {
                    return (
                        
                      <tr key={dado.idMedicao}>
                        <td>{dado.idMedicao}</td>
                        <td>{dado.vlDistancia}</td>
                        <td>{dado.dtMedicao}</td>
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
          </Container>
      </div>
    )
  }

  
  componentDidMount() {
    this.obterLista();
    loop = window.setInterval(() => {
      this.obterLista();
      
    }, TEMPO_REFRESH)
  }

  componentWillUnmount(){
    window.clearInterval(loop); 
  }


}