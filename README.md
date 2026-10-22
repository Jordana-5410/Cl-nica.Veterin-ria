# Zenvet — Gestão Veterinária

Zenvet combina tranquilidade na gestão com cuidado veterinário em uma plataforma web responsiva para clínicas e centros de pet care, desenvolvida com React, TypeScript e Vite.

A identidade visual usa tons terrosos, azul-petróleo, azul-claro e creme, conforme a paleta fornecida.

## Módulos

- **Orçamentos e propostas** ([BudgetProposals.tsx](./src/modules1/BudgetProposals.tsx)): seleção de serviços e itens, subtotal automático e atualização da situação da proposta.
- **Agendamento de serviços** ([ServiceSchedule.tsx](./src/modules1/ServiceSchedule.tsx)): cadastro de horário, profissional e recurso, com alteração do status entre agendado, em atendimento e concluído.
- **Controle de estoque** ([InventoryControl.tsx](./src/modules1/InventoryControl.tsx)): cadastro de insumos, filtro por categoria, alerta de estoque mínimo e movimentações de entrada e saída.
- **Controle de vacinação e retornos** ([VaccinationControl.tsx](./src/modules2/VaccinationControl.tsx)): registro de imunizações, histórico sanitário, busca e filtro de retornos vencidos.
- **Agendamento de banhos e tosas** ([GroomingSchedule.tsx](./src/modules2/GroomingSchedule.tsx)): grade de horários, seleção de profissional e porte do pet, com atualização de situação e prevenção de conflitos.
- **Histórico de receitas e prescrições** ([PrescriptionHistory.tsx](./src/modules2/PrescriptionHistory.tsx)): registro e consulta de receitas veterinárias associadas ao animal.

A tela inicial apresenta a clínica ao lado da ilustração `public/Animals.png`, e o menu lateral dá acesso aos seis módulos. Os dados de demonstração são mantidos no `localStorage` do navegador; autenticação e integração com uma API/banco de dados ainda não fazem parte desta base. O controle de vacinação e os registros de prescrição são ferramentas de organização demonstrativas, não substituem a decisão do médico-veterinário nem constituem um prontuário seguro de produção.

A pesquisa de referência desta etapa está em [RELATORIO-PESQUISA-PARTE-2.md](./RELATORIO-PESQUISA-PARTE-2.md).

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

Use **Limpar dados de demonstração** no menu para reiniciar os dados locais dos módulos.
