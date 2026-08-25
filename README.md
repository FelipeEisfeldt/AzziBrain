# AzziBrain

### API elaborada por **Felipe Eisfeldt**

**API geradora de ideias para a Azzi**, com painel local no visual do site
[azzi.digital](https://www.azzi.digital/).

Concepção, arquitetura e implementação: **Felipe Eisfeldt**.

O programa roda no seu próprio computador. Ele procura sozinho uma inteligência
artificial instalada na máquina (Claude ou Gemini) e se conecta nela. Se não
achar nenhuma, **continua funcionando normalmente** com o conteúdo próprio já
embutido — nada quebra.

---

# Guia para iniciantes (usando o Claude Code)

Você não precisa saber programar. Vai conversar com o Claude Code em português,
e ele faz o trabalho. Do zero até a tela aberta leva mais ou menos **5 minutos**.

## Passo 1 — Instalar o Node.js

O Node.js é o motor que faz o projeto rodar. É a única coisa que você precisa
instalar na mão.

1. Acesse **https://nodejs.org**
2. Baixe a versão marcada como **LTS** (é a estável).
3. Abra o arquivo baixado e vá clicando em *Avançar* até o fim. Pode aceitar
   tudo como vem.
4. **Feche o Claude Code e abra de novo.** Isso é importante: programas
   recém-instalados só aparecem para janelas abertas depois deles.

## Passo 2 — Pedir os arquivos ao Claude Code

Abra o Claude Code e **escreva esta frase** na caixa de conversa:

```
Clone o repositório https://github.com/FelipeEisfeldt/AzziBrain.git
numa pasta dentro dos meus Documentos e abra o projeto.
```

O Claude vai pedir sua autorização para executar. **Aceite.** Em alguns segundos
os arquivos estão no seu computador e ele já está trabalhando dentro da pasta
certa.

> **Não tem o Git instalado?** Se o Claude avisar que faltou o Git, responda:
> *"instale o Git para mim"* — ou baixe em **https://git-scm.com** e repita o
> passo.

## Passo 3 — Instalar as peças do projeto

Ainda no Claude Code, escreva:

```
Rode npm install nesta pasta.
```

Vai passar bastante texto na tela — é normal, demora de 30 segundos a 2 minutos.
Terminou quando aparecer algo como `added 206 packages`.

> Avisos amarelos com `npm warn deprecated` são normais e **não** são erro.

Este passo só é necessário **uma vez**.

## Passo 4 — Rodar pela primeira vez

Escreva no Claude Code:

```
Rode npm run dev e me diga o endereço para abrir no navegador.
```

Depois de alguns segundos aparece este quadro:

```
------------------------------------------------------------------
  AzziBrain - Motor de Ideias da Azzi
  Interface:  http://localhost:3000
  IA:         [--] Modo heurístico (sem IA)
------------------------------------------------------------------
```

Abra o navegador (Chrome, Edge, Firefox) e acesse:

**http://localhost:3000**

Pronto. O painel está no ar. 🎉

## Atalho: peça tudo de uma vez

Se preferir não ir passo a passo, cole isto no Claude Code depois de instalar o
Node.js:

```
Clone https://github.com/FelipeEisfeldt/AzziBrain.git nos meus Documentos,
instale as dependências com npm install, rode npm run dev e me avise
quando estiver no ar.
```

## Passo 5 — Como parar e como voltar depois

- **Para parar:** peça *"pare o servidor"* ao Claude, ou aperte `Ctrl + C` na
  janela onde ele está rodando.
- **Para voltar:** abra o Claude Code na pasta do projeto e escreva
  *"rode npm run dev"*. **Não precisa** repetir o `npm install`.

---

# Conectar uma inteligência artificial

Sem IA o projeto já funciona, mas fica repetindo as ideias que já existem.
Ligando uma IA, ele passa a **criar ideias novas** e o consultor responde de
verdade às suas perguntas.

Se você está lendo isto dentro do Claude Code, provavelmente já tem o Claude
instalado — mas o AzziBrain precisa dele disponível como **comando**. Escreva:

```
Instale o Claude Code globalmente com npm e verifique se o comando claude funciona.
```

Ou faça na mão, num terminal:

```bash
npm install -g @anthropic-ai/claude-code
claude
```

Faça o login que abrir no navegador, digite `/exit` para sair e rode
`npm run dev` de novo. O selo no topo da página deve mudar para
**"Claude Code (CLI local)"**.

📄 **O passo a passo completo das 4 formas está no arquivo
`COMO-CONECTAR-IA.docx`**, na pasta do projeto — e também pode ser baixado
clicando no nome dele dentro da própria página.

## Ordem em que o projeto procura a IA

Vence a primeira que ele encontrar:

| Ordem | O que ele procura | Precisa de chave paga? |
| ----- | ------------------------------------- | ---------------------- |
| 1º | comando `claude` instalado | **não** |
| 2º | `ANTHROPIC_API_KEY` no arquivo `.env` | sim |
| 3º | comando `gemini` instalado | **não** |
| 4º | `GEMINI_API_KEY` no arquivo `.env` | sim |
| 5º | nenhuma — modo determinístico | **não** |

Para fixar um provedor específico, crie um arquivo `.env` na pasta do projeto
com, por exemplo, `AI_PROVIDER=claude-cli`. Veja `.env.example` como modelo.

---

# Se der algum problema

O caminho mais rápido é **colar a mensagem de erro no Claude Code** e pedir para
ele resolver. Mas os casos comuns são estes:

| O que aparece | O que fazer |
| ------------- | ----------- |
| `npm não é reconhecido` | O Node.js não está instalado, ou o Claude Code está aberto desde antes da instalação. Feche e abra o Claude Code. Se persistir, refaça o Passo 1. |
| `Cannot find module` | Você pulou o `npm install`. Peça ao Claude para rodá-lo. |
| `EADDRINUSE` / porta 3000 em uso | Outro programa está usando a porta. Feche-o, ou peça: *"mude a porta do projeto para 3001"*. |
| A página não abre | O servidor precisa continuar rodando. Se você fechou a janela, peça *"rode npm run dev"* de novo. |
| O selo continua "Modo heurístico" | O projeto só procura IA quando inicia. Pare e rode `npm run dev` outra vez. |
| O consultor diz "Sua pergunta não foi lida" | É o esperado sem IA vinculada: o texto exibido é fixo. Conecte o Claude ou o Gemini (seção acima). |
| A primeira resposta da IA demora | Normal: a IA local precisa iniciar. As próximas são bem mais rápidas. |

---

# Para quem já programa

## Comandos

```bash
npm install      # instala as dependências (uma vez)
npm run dev      # sobe API + interface em http://localhost:3000
npm run build    # build de produção (dist/)
npm start        # roda o build
npm run lint     # checagem de tipos (tsc --noEmit)
npm run doc      # regera o COMO-CONECTAR-IA.docx
```

## Rotas

| Método | Rota | O que faz |
| ------ | ---- | --------- |
| GET | `/api/v1/ai/status` | qual IA está vinculada nesta máquina |
| GET | `/api/v1/generator/ideas` | os 20 cards ativos |
| POST | `/api/v1/generator/regenerate-card` | nova ideia num card (`cardIndex`) |
| POST | `/api/v1/generator/regenerate-all` | regenera o grid inteiro |
| POST | `/api/v1/generator/deep-prompt` | system prompt completo de uma ideia |
| POST | `/api/v1/ai/deep-analysis` | consultor estratégico |
| GET | `/api/v1/esg/passports` | surveys e análise de sentimento |
| GET | `/api/v1/copacking/current-plate` | ativação de evento e patrocinadores |
| GET | `/COMO-CONECTAR-IA.docx` | baixa o guia de conexão |

Exemplo:

```bash
curl http://localhost:3000/api/v1/ai/status
```

## Estrutura

```
server.ts                          API Express + Vite em modo middleware
src/server/aiProvider.ts           detecção da IA e geração unificada
src/engine/ideaGeneratorEngine.ts  motor das ideias
src/components/azzi/               interface no visual de azzi.digital
scripts/gerar-doc.py               gera o COMO-CONECTAR-IA.docx
```

O motor de ideias não conhece nenhum provedor: recebe uma função
`(prompt, system) => Promise<string>`. Trocar de IA não encosta nele.

## Design

Tokens extraídos do site real:

- `#232323` texto e fundos escuros · `#f3f3f3` papel
- `#d4ee2a` acento (verde-limão) · `#ff85d6` `#cc3858` `#e3aebd` destaques
- Playfair Display (títulos), Poppins (interface), Open Sans (texto corrido)

## Privacidade

Tudo roda na sua máquina. O AzziBrain não envia nada para servidores da Azzi.
Se você ligar uma IA, apenas o texto do pedido vai para o provedor escolhido
(Anthropic ou Google), como em qualquer uso normal deles.

---

# Autoria

**Felipe Eisfeldt** — autor da API AzziBrain.

Trouxe a API para a Azzi e respondeu por ela de ponta a ponta: a concepção do
motor de ideias, a arquitetura de detecção automática de IA, a modelagem dos
dados de evento e a interface baseada na identidade de azzi.digital.

Ao reutilizar, adaptar ou publicar este projeto, mantenha o crédito.

· [azzi.digital](https://www.azzi.digital/) ·
