# Diagrama Tecnico - GM Finance

Este diagrama pode ser usado em documentacao Markdown com suporte a Mermaid.

```mermaid
flowchart TD
    app["App Android<br/>(gm_finance)"]
    backend["Backend / API<br/>(gm_back)"]
    evolution["Evolution API / WhatsApp"]
    postgres["PostgreSQL<br/>servidor proprio"]
    llm["LLM local<br/>servidor proprio"]

    app -->|"HTTPS"| backend
    evolution -->|"Webhook HTTPS / mTLS"| backend
    backend -->|"SQL / rede privada"| postgres
    backend -->|"HTTPS / mTLS"| llm
```

## Versao com agrupamento por ambiente

```mermaid
flowchart LR
    subgraph mobile["Dispositivo do usuario"]
        app["App Android<br/>(gm_finance)"]
    end

    subgraph server["Servidor proprio"]
        backend["Backend / API<br/>(gm_back)"]
        postgres["PostgreSQL"]
        llm["LLM local"]
    end

    subgraph external["Servico externo"]
        evolution["Evolution API / WhatsApp"]
    end

    app -->|"HTTPS"| backend
    evolution -->|"Webhook HTTPS / mTLS"| backend
    backend -->|"SQL / rede privada"| postgres
    backend -->|"HTTPS / mTLS"| llm
```

## Observacao para PDF

O diagrama aparece corretamente no PDF somente se a ferramenta que gerar o PDF tiver suporte a Mermaid.

Funciona bem em ferramentas como:

- Markdown Preview Mermaid Support no VS Code, exportando depois para imagem/PDF.
- Mermaid CLI, gerando PNG ou SVG antes de inserir no PDF.
- Documentacoes baseadas em MkDocs, Docusaurus ou GitHub Pages com Mermaid habilitado.

Se o gerador de PDF nao suportar Mermaid, o ideal e exportar o diagrama para SVG ou PNG e inserir a imagem no documento final.
