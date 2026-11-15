# Midnight Minute Studio — PWA Android

## Hospedar gratuitamente no GitHub Pages
1. Abra https://github.com no Chrome do Android e entre na sua conta.
2. Crie um repositório **público** chamado `midnight-minute-studio`.
3. Envie **os arquivos de dentro desta pasta** para a raiz do repositório: `index.html`, `script.js`, `style.css`, `manifest.json`, `sw.js` e a pasta `icons/`. Não envie apenas o ZIP.
4. Em **Settings → Pages**, escolha **Deploy from a branch**, branch **main** e pasta **/(root)**. Salve.
5. Acesse `https://SEU-USUARIO.github.io/midnight-minute-studio/` (substitua SEU-USUARIO pelo seu login GitHub).
6. No Chrome Android, toque **⋮ → Instalar app** ou **Adicionar à tela inicial**. O botão dentro do app pode aparecer em dispositivos compatíveis.

O GitHub Pages fornece HTTPS para repositórios públicos dentro dos limites gratuitos do serviço. A instalação requer um navegador compatível.

## Funcionalidades
- Criação de roteiro em inglês com templates locais e episódio piloto do elevador.
- Prévia da voz via speechSynthesis.
- Cenas procedurais e legendas 720x1280.
- Exportação WebM com som ambiente, conforme suporte do navegador.
- Cache offline do aplicativo após primeira visita.

## Limitações
- A narração da prévia **não entra** no vídeo exportado.
- Sem IA de imagens, exportação MP4 nativa ou publicação automática no YouTube.
- O Chrome Android precisa suportar `MediaRecorder` e `canvas.captureStream`.
- Para atualizar o app, abra-o online e reinicie-o após o novo deploy.
- Os textos ficam no navegador; a hospedagem recebe as requisições comuns dos arquivos.
