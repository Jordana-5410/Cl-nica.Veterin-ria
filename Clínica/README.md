# Zenvet — Gestão Veterinária

Zenvet combina tranquilidade na gestão com cuidado veterinário em uma plataforma web responsiva para clínicas e centros de pet care, desenvolvida com React, TypeScript e Vite.

A identidade visual usa tons terrosos, azul-petróleo, azul-claro e creme, conforme a paleta fornecida.

## Módulos

- **Orçamentos e propostas** ([BudgetProposals.tsx](./src/modules/BudgetProposals.tsx)): seleção de serviços e itens, subtotal automático e atualização da situação da proposta.
- **Agendamento de serviços** ([ServiceSchedule.tsx](./src/modules/ServiceSchedule.tsx)): cadastro de horário, profissional e recurso, com alteração do status entre agendado, em atendimento e concluído.
- **Controle de estoque** ([InventoryControl.tsx](./src/modules/InventoryControl.tsx)): cadastro de insumos, filtro por categoria, alerta de estoque mínimo e movimentações de entrada e saída.

A tela inicial reúne atalhos para os três módulos. O estado dos dados é mantido enquanto a aplicação estiver aberta; persistência, autenticação e integração com uma API/banco de dados ainda não fazem parte desta base.

## Executar localmente

```sh
npm install
npm run dev
```

## Verificar e compilar

```sh
npm run lint
npm run build
```

Os dados de exemplo são mantidos no estado da interface.
