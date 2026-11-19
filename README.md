# G0DM0D3 MCP — Railway

Este projeto publica um adaptador MCP (Model Context Protocol) para conectar um cliente MCP à API G0DM0D3 já hospedada no Railway.

## 1. Criar um repositório para o adaptador

1. Descompacte este ZIP no computador.
2. Crie um repositório NOVO no GitHub, por exemplo `g0dm0d3-mcp`.
3. Envie todos os arquivos e pastas deste projeto para a raiz desse repositório.
4. Não coloque chaves no GitHub.

## 2. Criar o segundo serviço no Railway

1. Railway → New Project → Deploy from GitHub Repo.
2. Escolha o repositório `g0dm0d3-mcp`.
3. O Railway deve detectar o Dockerfile.
4. Em Variables, configure:

| Variável | Valor |
|---|---|
| `G0DM0D3_API_BASE` | `https://SEU-DOMINIO-DA-API.up.railway.app` (sem `/v1`) |
| `GODMODE_API_KEY` | O mesmo valor configurado no serviço da API |
| `MCP_AUTH_TOKEN` | Crie um token longo e aleatório, diferente da chave da API |
| `PORT` | Não definir manualmente; Railway fornece a porta |

`OPENROUTER_API_KEY` não precisa ser copiada para o adaptador: ela fica somente no serviço original G0DM0D3.

5. Gere um domínio público em Settings → Networking.

## 3. Endpoints

- Health: `https://SEU-DOMINIO-MCP.up.railway.app/health`
- MCP Streamable HTTP: `https://SEU-DOMINIO-MCP.up.railway.app/mcp`

O endpoint MCP exige `Authorization: Bearer SEU_MCP_AUTH_TOKEN`.

## Ferramentas incluídas

- `g0dm0d3_health`
- `g0dm0d3_info`
- `g0dm0d3_models`
- `g0dm0d3_chat`
- `g0dm0d3_ultraplinian`
- `g0dm0d3_consortium`
- `g0dm0d3_autotune`
- `g0dm0d3_parseltongue_encode`
- `g0dm0d3_parseltongue_detect`
- `g0dm0d3_stm_transform`

## Segurança

- Nunca publique `GODMODE_API_KEY`, `MCP_AUTH_TOKEN` ou `OPENROUTER_API_KEY` no GitHub.
- Não envie essas chaves por chat.
- O serviço MCP encaminha chamadas à API G0DM0D3; ele não substitui nem hospeda a API original.
- Recursos de pesquisa/dataset podem depender de tier e variáveis adicionais no serviço original.

## Observação sobre ChatGPT

Depois do deploy, será necessário adicionar o endpoint `/mcp` como conector/servidor MCP em uma experiência do ChatGPT que aceite servidores MCP remotos. A disponibilidade dessa opção depende do plano e das configurações da conta.
