// Inicio ScaleDrone e WebRTC
if(!location.hash){
    location.hash = Math.floor(Math.random() * 0xFFFFFF).toString(16)
}

const roomHash = location.hash.substring(1)

const drone = new ScaleDrone('yiS12Ts5RdNhebyM') // este ID é fornecido pelo scaledrone só para testes


// Agora vamos rastrear quando alguem entra na sala
const roomName = 'observable-'+roomHash;

/*
    proximo passo é um servidor de referencia para a conexão - o proprio google fornece
*/
const configuration = {

    iceServers:[

        {
            urls: 'stun:stun.l.google.com:19302'
        }

    ]

}

let room
let pc

let number = 0

function OnSuccess(){}

function onError(error){
    console.log(error)
}


/*
    Agora vamos começar a detectar quem entra na sala
*/
drone.on('open', error => {
    if(error){
        return console.log(error)
    }

    room = drone.subscribe(roomName)// se nao acontecer nenhum erro, a gente vai receber todos os eventos referente do id da sala.

    room.on('open', error => {
        // se acontecer erro, capturamos aqui!
    })

    // Evento quando alguem entra na sala.
    room.on('members', members => {
        // quando alguem se conecta na sala!
        // console.log('Conectado!')
        // console.log("Conexões abertas: "+members.length)
        number = members.length - 1
        const isOfferer = members.length >= 2

        startWebRTC(isOfferer) // Aqui está o coração
    })
})

function sendMessage(message){
    drone.publish({
        room: roomName,
        message
    })
}


function startWebRTC(isOfferer){


    pc = new RTCPeerConnection(configuration)

    pc.onicecandidate = event => {
        if(event.candidate){
            sendMessage({'candidate':event.candidate})
        }
    }

    if(isOfferer){
        pc.onnegotiationneeded = () => {
            pc.createOffer().then(localDescCreated).catch(onError)
        }
    }


    /*
        Agora vamos mostrar no frontend
    */
    pc.ontrack = event => {
        const stream = event.streams[0]

        if(!remoteVideo.srcObject || remoteVideo.srcObject.id !== stream.id){
            remoteVideo.srcObject = stream
        }
    }


    /*
        Agora vamos pegar o device (webcam ou microfone)
    */
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
    }).then(stream => {
        localVideo.srcObject = stream  // srcObject é o stream que esta sendo passado via webcam e microfone
        stream.getTracks().forEach(track=>pc.addTrack(track,stream))
    }, onError)

    /*
        Agora vamos rastrear quando alguem sai da nossa sala
    */
    room.on('member_leave',function(member){
        // Usuário saiu!
        remoteVideo.style.display = "none"
    })

    /*
        Evento para troca de informações
    */
    room.on('data',(message, client)=>{
        
        if(client.id === drone.clientId){
            return // para não mandar informação para nós mesmo.
        } 

        if(message.sdp){
            pc.setRemoteDescription(new RTCSessionDescription(message.sdp), () => {
                if(pc.remoteDescription.type === 'offer'){
                    pc.createAnswer().then(localDescCreated).catch(onError)
                }
            }, onError)
        }else if(message.candidate){
            pc.addIceCandidate(
                new RTCIceCandidate(message.candidate), OnSuccess, onError
            )
        }
    })
}


function localDescCreated(desc){
    pc.setLocalDescription(
        desc, () => sendMessage({'sdp': pc.localDescription}), onError
    )
}
