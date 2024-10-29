# TCC- Medidor d'água (Frontend)

O projeto em execução pode ser acessado no endereço http://??????/

Este projeto foi criado utilizando o React [Create React App](https://github.com/facebook/create-react-app).

## Sobre

Este projeto é do TCC do curso de Engenheria de Computação da Univesp. O projeto consiste em um sistema de monitoramento de caixa d'água e acionamento de uma bomba d'água.

Neste front-end temos um gráfico de monitoramento em tempo real utilizando a lib apexcharts. Também há um gráfico para apresentar dados de histórico, feito com o ChartJs. Finalmente, uma tela para configurar e-mails de alerta caso o sensor de nível atinja certos parâmetros.

## Requisitos

Para executar este projeto você precisa também estar executando o backend deste sistema, que está localizado em 
[https://github.com/lucasdclopes/PI-sensores](https://github.com/lucasdclopes/TCC-medidor-dagua)

Também é necessário instalar o node.js + npm. Os testes foram feitos na versão LTS 18.16.0, que inclui o npm 9.51
https://nodejs.org/en/download

## Dependências

Com os requisitos atendidos. É necessário instalar as dependências. Com um prompt de comando, navegue até o diretório onde o repositório foi clonado e execute o comando `npm install`. A execução do comando pode levar alguns minutos.

## Executando

Com tudo instalado, ainda no diretório clonado, execute `npm start` e aguarde alguns segundos. Normalmente o browser será aberto no endereço correto. Se não abrir, a URL padrão é  [http://localhost:3000](http://localhost:3000)

## Endereço do backend

Caso esteja executando o backend em um endereço customizado ou em outra máquina, é possível alterar o o http host no arquivo `src/services/HttpService/index.jsx` e altere o valor da variável `urlBase`
