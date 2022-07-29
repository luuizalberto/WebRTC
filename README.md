# Sistema de chat e vídeo
[![NPM](https://img.shields.io/npm/l/react)](https://github.com/luuizalberto/React-Native-Insider4.0/blob/main/LICENSE)

Basicamente estou utilizando o scaledrone para ter os eventos que a gente tem quando: usuário entra, troca de informação etc. 
E o RTCPeerConnection para ficar realizando as trocas de informações.

## Principais detalhes do código:

Neste projeto utilizo o ID padrão fornecido pelo scaledrone só para testes;

Rastreo quando alguem entra na sala;

Proximo passo é um servidor de referencia para a conexão - o proprio google fornece;

Detecto quem entra na sala;

startWebRTC(isOfferer) é o coração do códido para quando alguém entra na sala;

Depois disso mostro no front da aplicação;

pego o device (webcam ou microfone);

Passo o srcObject que é o stream que esta sendo passado via webcam e/ou microfone;

Rastreo quando alguém sai da nossa sala;

e Por fim o evento para troca de informações.
