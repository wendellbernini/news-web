# Integração Power BI - NewsWeb API

Este guia explica como integrar o Power BI com a API REST do NewsWeb para análise de dados.

## Pré-requisitos

1. Acesso administrativo ao NewsWeb
2. Power BI Desktop instalado
3. API Key válida (gerar em /admin/api-keys)

## Endpoints Disponíveis

### 1. Lista de Notícias

```
GET /api/v1/news
```

**Parâmetros:**

- page (opcional): Número da página
- category (opcional): Filtrar por categoria
- startDate (opcional): Data inicial (YYYY-MM-DD)
- endDate (opcional): Data final (YYYY-MM-DD)

**Resposta:**

```json
{
  "data": [
    {
      "id": "string",
      "title": "string",
      "category": "string",
      "views": number,
      "createdAt": "string (ISO date)",
      "updatedAt": "string (ISO date)"
    }
  ],
  "page": number,
  "totalItems": number,
  "itemsPerPage": number
}
```

### 2. Análise de Visualizações

```
GET /api/v1/analytics/views
```

**Parâmetros:**

- startDate (opcional): Data inicial (YYYY-MM-DD)
- endDate (opcional): Data final (YYYY-MM-DD)

**Resposta:**

```json
{
  "data": [
    {
      "newsId": "string",
      "newsTitle": "string",
      "totalViews": number,
      "uniqueUsers": number
    }
  ],
  "totalViews": number,
  "totalUniqueUsers": number,
  "period": {
    "start": "string",
    "end": "string"
  }
}
```

### 3. Análise de Categorias

```
GET /api/v1/analytics/categories
```

**Parâmetros:**

- startDate (opcional): Data inicial (YYYY-MM-DD)
- endDate (opcional): Data final (YYYY-MM-DD)

**Resposta:**

```json
{
  "data": [
    {
      "category": "string",
      "totalNews": number,
      "totalViews": number,
      "averageViews": number,
      "latestNews": "string (ISO date)"
    }
  ],
  "totalCategories": number,
  "totalNews": number,
  "totalViews": number,
  "period": {
    "start": "string",
    "end": "string"
  }
}
```

## Configuração no Power BI

1. Abra o Power BI Desktop

2. Clique em "Obter Dados" > "Web"

3. Configure a fonte de dados:

   - URL: URL base da API + endpoint desejado
   - Método de autenticação: Chave de API
   - Parâmetro de chave: x-api-key
   - Valor da chave: Sua API Key

4. Configure os parâmetros:

   - Crie parâmetros para datas
   - Use parâmetros na URL da consulta

5. Transforme os dados:
   - Expanda colunas aninhadas
   - Converta tipos de dados
   - Crie medidas calculadas

## Exemplos de Consultas M

### Notícias por Categoria

```m
let
    Source = Json.Document(Web.Contents("https://sua-api.com/api/v1/analytics/categories", [
        Headers=[#"x-api-key"="sua-api-key"],
        Query=[
            startDate=Date.ToText(StartDate, "yyyy-MM-dd"),
            endDate=Date.ToText(EndDate, "yyyy-MM-dd")
        ]
    ])),
    data = Source[data],
    #"Convertido para Tabela" = Table.FromList(data, Splitter.SplitByNothing(), null, null, ExtraValues.Error)
in
    #"Convertido para Tabela"
```

### Visualizações por Notícia

```m
let
    Source = Json.Document(Web.Contents("https://sua-api.com/api/v1/analytics/views", [
        Headers=[#"x-api-key"="sua-api-key"],
        Query=[
            startDate=Date.ToText(StartDate, "yyyy-MM-dd"),
            endDate=Date.ToText(EndDate, "yyyy-MM-dd")
        ]
    ])),
    data = Source[data],
    #"Convertido para Tabela" = Table.FromList(data, Splitter.SplitByNothing(), null, null, ExtraValues.Error)
in
    #"Convertido para Tabela"
```

## Exemplos de Visualizações

1. Gráfico de Barras: Visualizações por Categoria

   - Eixo X: Categoria
   - Eixo Y: Total de Visualizações
   - Cor: Média de Visualizações

2. Gráfico de Linha: Tendência de Visualizações

   - Eixo X: Data
   - Eixo Y: Total de Visualizações
   - Segmentação: Categoria

3. Cartões de Métricas

   - Total de Notícias
   - Total de Visualizações
   - Média de Visualizações por Notícia
   - Usuários Únicos

4. Mapa de Calor: Engajamento por Dia/Hora
   - Linhas: Dia da Semana
   - Colunas: Hora do Dia
   - Valores: Total de Visualizações

## Atualizações Automáticas

1. Configure a atualização agendada:

   - Power BI Service > Dataset
   - Credenciais > Atualizar
   - Defina frequência

2. Monitore falhas de atualização:
   - Configure alertas
   - Verifique logs

## Boas Práticas

1. Cache e Performance

   - Use parâmetros para datas
   - Limite o volume de dados
   - Implemente paginação

2. Segurança

   - Não compartilhe API Keys
   - Use HTTPS
   - Monitore uso da API

3. Manutenção
   - Documente transformações
   - Use descrições em medidas
   - Mantenha backup dos relatórios

## Suporte

Para suporte ou dúvidas:

1. Consulte a documentação completa
2. Entre em contato com o administrador
3. Abra um ticket de suporte
