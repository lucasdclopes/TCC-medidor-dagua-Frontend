import axios from 'axios';

const host = window.location.protocol + "//" + window.location.host;
//const urlBase = 'http://192.168.15.53:8080/tcc-medidor-dagua/api'; //<- testes local
//const urlBase = 'http://localhost:8080/api'; //<- testes local
const urlBase = host + ':8080/tcc-medidor-dagua/api'; //<- build acesso na rede
const defaultHeaders = {
  headers : {
    "Content-Type": "application/json",
    "Accept-Language" : "pt-br"
    //,"token" : UsuarioLogadoDto.getTokenAcesso() ? UsuarioLogadoDto.getTokenAcesso() : ""
  }
}
const defaultConfig = {
  headers : defaultHeaders.headers 
}

export default class HttpService{

  //configura as informações de paginações
  static queryPaginacao = (paginacao) => {
    return (!paginacao.size || !paginacao.page) ? 
      '' : 
      'size=' + paginacao.size + '&page=' + (paginacao.page); 
  } 
  //configura todos os parâmetros no formato query string
  static gerarParams = (arrParams) => {
    return (arrParams.length > 0) ? 
      '?'+arrParams.join('&'):'';
  }

  static listarMedicoes = async (filtros) => {
    //console.log(filtros);
    let url = urlBase + '/medicao';
    let queryParams = [];

    if (filtros.paginacaoRequest) {
      queryParams.push(HttpService.queryPaginacao(
        filtros.paginacaoRequest
        ));
    }

    if (filtros.dtInicial) {
      queryParams.push('dtInicial=' + filtros.dtInicial);
    }
    if (filtros.dtFinal) {
      queryParams.push('dtFinal=' + filtros.dtFinal);
    }
    if (filtros.tempoReal) {
      queryParams.push('tempoReal=' + filtros.tempoReal);
    }
    if (filtros.tipoAgrupamento && filtros.tipoAgrupamento > 0) {
      queryParams.push('tipoAgrupamento=' + filtros.tipoAgrupamento);
    }

    url += HttpService.gerarParams(queryParams);

    let response = await axios.get(url,defaultConfig);
    return response;
  }


  static listarConfigs = async () => {
    let url = urlBase + '/userconfig';
    let response = await axios.get(url,defaultConfig);
    return response;
  }

  static salvarConfig = async (payload) => {
    let url = urlBase + '/userconfig';
    let response = await axios.put(url,payload,defaultConfig);
    return response;
  }

  static listarAlertas = async (filtros) => {

    let url = urlBase + '/alerta';
    let queryParams = [];

    if (filtros.paginacaoRequest) {
      
      queryParams.push(HttpService.queryPaginacao(
        filtros.paginacaoRequest
        ));
    }

    url += HttpService.gerarParams(queryParams);

    let response = await axios.get(url,defaultConfig);
    return response;
  }

  static listarAlertasEnviados = async (idAlerta) => {

    let url = urlBase + '/alerta/' + idAlerta;

    let response = await axios.get(url,defaultConfig);
    return response;
  }

  static salvarAlerta =  (postData,idAlerta) => {
    console.log('salvarAlerta: ', postData);
    let isUpdate = false
    if (typeof idAlerta !== 'undefined' && idAlerta > 0) {
      isUpdate = true;
    }
    let url = urlBase + '/alerta/'+ ((isUpdate)? ""+idAlerta :"") ;
    let config = defaultConfig;
    
    if (isUpdate) {
      return axios.put(url,postData,config);
    } else {
      return axios.post(url,postData,config);
    }
  }

  static deletarAlerta = async (idAlerta) => {
    let url = urlBase + '/alerta/' +idAlerta;
    let response = await axios.delete(url,defaultConfig);
    return response;
  }

}