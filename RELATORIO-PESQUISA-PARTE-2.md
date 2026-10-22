# Relatório de pesquisa — Parte 2

**Tema:** prontuários e registros veterinários, controle de vacinação e apoio à rotina clínica.  
**Data de consulta das fontes:** 22 de outubro de 2026.

## Objetivo e método

Foram consultadas normas do Conselho Federal de Medicina Veterinária e diretrizes profissionais da World Small Animal Veterinary Association (WSAVA) e da American Animal Hospital Association (AAHA). A pesquisa foi usada para orientar os campos e os limites funcionais dos novos módulos; não substitui orientação clínica nem constitui validação regulatória do protótipo.

## Síntese investigativa

### Prontuário e documentação veterinária

A Resolução CFMV nº 1.321/2020 estabelece normas para documentos no âmbito da clínica médico-veterinária. Como consequência prática para um sistema de informação, os registros precisam ser organizados e consultáveis, associados ao animal e ao atendimento, e permitir identificar informações relevantes como datas e profissional responsável. A organização eletrônica facilita a consulta do histórico e o acompanhamento de atendimentos sem depender apenas da memória ou de papéis dispersos.

Na aplicação, o histórico de vacinação registra animal, tutor, imunização, data, profissional, lote, observações e retorno recomendado. O módulo de prescrições associa a receita ao animal e organiza diagnóstico/finalidade, medicamento e instruções para consulta posterior. Esses formulários são um protótipo demonstrativo: não oferecem assinatura digital, armazenamento seguro em servidor, integração com prontuário institucional nem garantem conformidade jurídica.

### Controle de vacinação

As diretrizes globais da WSAVA enfatizam que a vacinação de cães e gatos deve seguir recomendações profissionais ajustadas ao contexto e às necessidades do paciente. As diretrizes da AAHA também distinguem vacinas essenciais e recomendações que podem variar com o estilo de vida e os riscos individuais do cão. Portanto, um sistema deve apoiar o registro e o acompanhamento de datas, mas não decidir sozinho quais vacinas aplicar ou definir o protocolo de reforços.

O módulo registra imunizações e permite consultar retornos vencidos ou em dia. Esse filtro é uma ajuda operacional para localizar registros que merecem acompanhamento; nesta versão, não há envio automático de lembretes ou notificações.

## Referências bibliográficas

1. **CONSELHO FEDERAL DE MEDICINA VETERINÁRIA (CFMV).** Resolução nº 1.321, de 24 de abril de 2020. Institui normas sobre os documentos no âmbito da clínica médico-veterinária e dá outras providências. Disponível em: [texto oficial em PDF](https://manual.cfmv.gov.br/arquivos/resolucao/1321.pdf). Acesso em: 22 out. 2026.
2. **WORLD SMALL ANIMAL VETERINARY ASSOCIATION (WSAVA).** *WSAVA Guidelines for the Vaccination of Dogs and Cats*, 2024. Disponível em: [página das diretrizes globais de vacinação](https://wsava.org/global-guidelines/vaccination-guidelines/) e [resumo executivo de 2024 em PDF](https://wsava.org/wp-content/uploads/2024/05/2024-Guidelines-for-the-Vaccination-of-Dogs-and-Cats.pdf). Acesso em: 22 out. 2026.
3. **AMERICAN ANIMAL HOSPITAL ASSOCIATION (AAHA).** *2022 AAHA Canine Vaccination Guidelines* (página atualizada em 2024). Disponível em: [diretrizes de vacinação canina](https://www.aaha.org/resources/2022-aaha-canine-vaccination-guidelines/). Acesso em: 22 out. 2026.

## Aplicação da pesquisa ao projeto

- Manter histórico de imunizações pesquisável por animal/tutor, com data, profissional e lote.
- Registrar a data de retorno sugerida pelo profissional e facilitar a identificação de retornos vencidos.
- Permitir consulta de prescrições associadas ao animal sem gerar recomendações clínicas automáticas.
- Tratar os dados apresentados como dados de demonstração: a aplicação salva no `localStorage` do navegador e não é um prontuário clínico seguro ou uma solução de produção.
