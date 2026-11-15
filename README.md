# Himitsu — protótipo online (etapa 2)

Esta etapa acrescenta um servidor de sinalização Socket.IO e conexões WebRTC entre navegadores.

## Requisitos
- Node.js 18 ou superior
- Navegador moderno
- HTTPS em produção (obrigatório para captura de tela; `localhost` funciona em desenvolvimento)

## Executar localmente
```bash
npm install
npm start
```
Abra `http://localhost:3000` em dois navegadores ou dispositivos na mesma rede (para testes simples). Para acessar remotamente, publique o servidor em um host com HTTPS.

## O que esta etapa demonstra
- Criação/entrada por código de sala
- Lista de participantes em tempo real
- Sinalização WebRTC por Socket.IO
- Compartilhamento de tela e áudio opcional
- Visualização de streams recebidos e seleção da tela principal
- Tela cheia individual

## Limitações importantes
- **Ainda é um protótipo técnico, não um serviço pronto para público.** A conexão WebRTC usa STUN público e pode falhar em algumas redes; produção precisa de TURN.
- A arquitetura atual é mesh (cada participante envia mídia diretamente a cada outro participante). É adequada apenas para testes pequenos; não é a arquitetura final para salas grandes. Para dezenas de pessoas, a próxima etapa deve substituir a malha por um SFU (por exemplo, LiveKit ou mediasoup), com infraestrutura e custos próprios.
- O áudio compartilhado depende do navegador e da fonte escolhida. Se áudio do Discord e do jogo estiverem misturados na mesma saída do sistema, o navegador não consegue separá-los automaticamente. O microfone não é solicitado.
- O servidor atual não possui autenticação, persistência, moderação, limites de sala ou proteção contra abuso. Não exponha publicamente sem implementar esses controles.
- Para produção, configure HTTPS/WSS, TURN autenticado, rate limiting, validação de mensagens, limites de participantes e política de privacidade.

## Próxima etapa recomendada
Migrar a mídia para um SFU e fazer testes de carga controlados antes de permitir salas maiores.
