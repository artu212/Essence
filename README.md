# Essence

**More than a look**

O **Essence** é um sistema web demonstrativo de gerenciamento de agendamentos para barbearias, salões de beleza e outros estabelecimentos de serviços. O projeto foi desenvolvido como atividade acadêmica, com foco em uma experiência simples para clientes e em ferramentas de organização para estabelecimentos.

## Objetivo

Facilitar a descoberta de estabelecimentos e o agendamento de serviços, permitindo consultar profissionais e horários, além de oferecer recursos demonstrativos de gestão de agenda e catálogo de produtos.

## Acesse o projeto

- **Demonstração:** https://artu212.github.io/Essence/
- **Repositório:** https://github.com/artu212/Essence

> A versão publicada é uma demonstração acadêmica. Os dados são armazenados localmente no navegador e não são compartilhados entre usuários ou dispositivos.

## Funcionalidades implementadas

### Para clientes

- Pesquisa e visualização de estabelecimentos cadastrados.
- Consulta de serviços, profissionais e horários disponíveis.
- Agendamento sem necessidade de criar conta, com nome e telefone.
- Consulta e gerenciamento demonstrativo de agendamentos, conforme os fluxos disponíveis na interface.
- Visualização de catálogo de produtos quando habilitado pelo estabelecimento.
- Carrinho demonstrativo com ajuste de quantidades e cálculo de valores, sem processamento de pedidos ou pagamentos reais.

### Para estabelecimentos — painel demonstrativo

- Cadastro e edição de informações do estabelecimento.
- Gerenciamento de serviços, preços, duração e profissionais.
- Configuração de dias e horários de funcionamento.
- Visualização e gerenciamento de agendamentos.
- Bloqueio de horários ou períodos de indisponibilidade e publicação de avisos.
- Campos opcionais de contato e links, como Instagram, WhatsApp e Google Maps.
- Ativação opcional de catálogo, cadastro e edição de produtos, com imagens anexadas localmente.

### Interface e persistência

- Layout adaptável a diferentes tamanhos de tela.
- Formatação de valores monetários em reais nos formulários atualizados.
- Exibição de imagens de produtos sem distorção intencional.
- Navegação entre página principal e catálogo na mesma aba.
- Persistência local de dados via `localStorage`, sujeita aos limites do navegador.

## Tecnologias

- HTML5
- CSS3
- JavaScript (sem framework)
- `localStorage` para armazenamento demonstrativo
- Git e GitHub para versionamento
- GitHub Pages para hospedagem estática

## Como executar

**Online:** acesse https://artu212.github.io/Essence/.

**Localmente:**

1. Clone o repositório:
   ```bash
   git clone https://github.com/artu212/Essence.git
   ```
2. Abra a pasta do projeto em um editor ou IDE.
3. Abra `index.html` em um navegador ou utilize um servidor local da IDE.

O projeto não exige instalação de dependências de back-end para a demonstração.

## Como testar

1. Cadastre ou selecione um estabelecimento.
2. Configure serviços, profissionais e horários no painel demonstrativo.
3. Realize um agendamento de teste e confira a disponibilidade.
4. Teste alterações e bloqueios de horários.
5. Habilite o catálogo, cadastre produtos e teste o carrinho.
6. Recarregue a página para conferir a persistência local.
7. Repita os principais fluxos no celular e registre eventuais problemas.

Ao reportar um erro, informe o dispositivo, o navegador, as etapas executadas, o resultado esperado e o resultado obtido. Capturas de tela ajudam a reproduzir a falha.

## Limitações conhecidas

- Não há servidor, banco de dados centralizado nem autenticação real.
- O painel administrativo é demonstrativo e **não possui controle de acesso adequado para uso comercial**.
- Os dados de um navegador não são sincronizados com outros navegadores ou dispositivos.
- Não há confirmação real de agendamentos por WhatsApp, integração de pagamentos, processamento de compras ou controle de estoque.
- O uso de imagens e dados no `localStorage` depende do espaço disponibilizado pelo navegador.

## Equipe

- **Arthur Costa** — desenvolvimento e coordenação.
- **Gustavo Trega** — protótipos e usabilidade.
- **Rafael Alexandre** — requisitos e documentação.

## Organização e acompanhamento

O projeto foi planejado e desenvolvido em etapas, com acompanhamento de tarefas e versionamento centralizado no repositório. Para consultar a evolução e as pendências, veja:

- [`STATUS.md`](STATUS.md) — andamento da entrega acadêmica.
- [`docs/Essence - HISTORICO DE DESENVOLVIMENTO.md`](docs/Essence%20-%20HISTORICO%20DE%20DESENVOLVIMENTO.md) — registro resumido da evolução.

## Situação atual

**Implementação publicada para testes da equipe.** A versão do código foi enviada à branch `master` no commit `c7d1d98`, em 17/11/2026. A validação independente, a documentação dos resultados e a apresentação acadêmica ainda devem ser concluídas.
