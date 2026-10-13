# Votos Acre — consulta com dados divulgados e estimativas brutas

Coleta financeira e legislativa: 13/10/2026. Eleição: fotografia de 05/10/2026. Sem atualização automática. Os valores são nominais, sem correção por inflação. O painel eleitoral anterior, o domínio e a aplicação exclusiva de Antônio Pedro foram preservados.

## Publicação

Extraia o ZIP e substitua `index.html` na raiz do repositório `votos-acre`. O HTML contém os dados e funciona sem consultar APIs financeiras no navegador. Para manter o código-fonte atualizado, envie também `src/`, `build.py`, `prestacao-contas.json`, `conferencia-prestacao-contas.json` e este documento. Preserve `CNAME` e `.nojekyll`. O index tem aproximadamente 17 MB, abaixo dos 25 MB do upload pelo navegador. Não envie o ZIP como página: extraia primeiro.

Abra o menu **Prestação de contas**, ou acrescente `#pagina=prestacao` ao endereço. A abertura retorna ao resumo geral, com filtros e totais por instituição. As tabelas detalhadas aparecem ao escolher uma pessoa ou instituição. Fontes e critérios ficam em uma seção expansível. A comparação de políticos pode ser aberta sem selecionar uma pessoa individualmente.

## Como ler os valores

- **Remuneração divulgada em folha:** bruto, descontos e líquido encontrados no portal do Executivo. A folha pode conter extras e acertos. Bruto e líquido não são somados.
- **Subsídio estimado nos meses sem folha:** cálculo a partir das leis de cada época e dos períodos institucionais registrados. É bruto, sem descontos; não comprova pagamento individual. Não inclui 13º, férias, benefícios, ajuda de custo, extras ou verbas de gabinete.
- **Cotas e gabinete registrados:** despesas institucionais publicadas; não são renda pessoal. Verba disponível é autorização; somente o gasto publicado entra na base financeira.
- **Base financeira parcial:** remuneração divulgada, mais estimativas dos meses sem folha, mais cotas e gastos de gabinete registrados. Folha e estimativa para a mesma pessoa, cargo e mês não são somadas duas vezes. Gastos sem cobertura não são estimados como zero. Esse total não é custo público completo nem valor comprovadamente recebido pelo político.

Estimativas consideram meses e dias efetivamente incluídos no período registrado. Meses incompletos são proporcionais aos dias do mês civil. O limite é 13/10/2026, inclusive. Licenças remuneradas, afastamentos, descontos por faltas e complementações podem alterar o pagamento real. Eventos da Câmara não são usados para presumir exercício indefinido depois do término da legislatura. Vínculos antigos do Executivo não são prolongados até hoje.

Mandatos futuros não entram na base até hoje. A consulta individual traz uma **projeção separada** de mandato legislativo futuro, com o salário atual constante e sem reajustes futuros. Essa projeção não representa gasto ocorrido.

## Cobertura das tabelas legais

- Deputados estaduais: valores e vigências explicitados na Lei estadual 4.136/2023, de janeiro de 2023 em diante. Tabelas estaduais anteriores ainda não validadas na base: as lacunas são mostradas, sem aplicar o salário atual retroativamente nem presumir automaticamente 75% do salário federal.
- Deputados federais e senadores: Decretos Legislativos 112/2007 (desde abril), 805/2010 (desde fevereiro de 2011), 276/2014 (desde fevereiro de 2015) e 172/2022 (reajustes de janeiro e abril de 2023, fevereiro de 2024 e fevereiro de 2025). Períodos anteriores à cobertura permanecem lacunas.
- Governador e vice: leis anuais 3.601/2020, 3.669/2020 e 3.886/2021 para 2020–2022; cálculo desde abril de 2023 com Lei 4.063/2022 e tabela da magistratura da Lei 4.134/2023; Lei 4.279/2023 para 2024, Lei 4.523/2025 para 2025 e Lei 4.752/2025 para 2026. Janeiro–março de 2023 e períodos mais antigos sem tabela numérica validada permanecem lacunas no modelo. Folhas publicadas continuam disponíveis mesmo quando falta uma tabela do modelo. Vice: percentual oficial de 95% para os períodos modelados; percentuais históricos de outros períodos não são presumidos iguais.

Exemplo conferido: Adailton Cruz em 2025 = janeiro de R$ 31.948,49 + 11 meses de R$ 33.448,49 = **R$ 399.881,88 brutos estimados**. Seu primeiro período começa em fevereiro de 2023. O período de 2027–2031 é futuro e é apresentado somente na projeção separada.

## Comparar políticos

Expanda **Comparar dois ou mais políticos**, escolha cada nome e clique **Adicionar à comparação**. Para a razão por projeto, selecione um ano no filtro principal. A tabela mostra folha divulgada, subsídio estimado, base parcial, projetos apresentados e projetos com votação registrada. Pessoas podem ser removidas individualmente. A instituição e o ano dos filtros também se aplicam à comparação.

**Razão por projeto = subsídio bruto estimado do ano ÷ quantidade de projetos do período.** Não são incluídas verbas de gabinete nesse numerador. Valor sem estimativa, período sem cobertura ou quantidade zero não gera uma divisão. Não se presume custo zero quando faltam dados.

Essa razão não demonstra quanto custou produzir um projeto, sua importância, aprovação, resultado, qualidade ou eficiência. Autoria/coautoria incluída: uma matéria pode aparecer para vários autores. Projetos são PL/PLC/PLP/PEC/PDL/PDC/PR/PRC/PLS/PRS, conforme a casa, não todo requerimento ou indicação. Para comparação, prefira mesma casa e ano. O ano oficial de uma proposição pode não ser o ano em que cada coautor aderiu a ela.

Votações estaduais: a base disponível vai de 11/06/2025 a 10/08/2026. A contagem anual considera apenas projetos com registro nesse intervalo, não todas as deliberações do ano. Votações federais e leis resultantes ainda não consolidadas. Ausência de registro não prova que nunca houve votação. Governador não é avaliado como legislador com essa base.

## Comparar com a renda de um trabalhador

Informe a renda mensal que seria inteiramente poupada; referência inicial: mínimo de 2026, R$ 1.621. A interface mostra **anos aproximados** e **tempo necessário para juntar o valor**, sem a antiga coluna de meses decimais. Fração de ano de 0,5 ou mais arredonda para cima.

O detalhamento usa o resultado original: 12 meses/ano, 30 dias/mês, 24 horas/dia; a última fração de hora arredonda para cima. É tempo equivalente de poupança, não jornada de trabalho nem calendário civil exato. A comparação anual do subsídio estimado usa as leis de cada época. O cenário de subsídio constante é separado e usa os valores de referência atuais.

## Bases e limites restantes

Câmara: 91 cadastros históricos do Acre; CEAP 2008–2026, com registros encontrados para parte deles. Senado: 47 cadastros ligados ao Acre identificados pela UF dos mandatos; CEAPS 2010–2026. ALEAC: mandatos, autoria e tramitação do SAPL. Executivo: folhas mensais de 2002 a outubro de 2026 consultadas para Jorge Viana, Tião Viana, Binho Marques, Gladson Cameli e Mailza Assis; competências ausentes não são zero. Gabinete da Câmara: janeiro–julho de 2026 para os oito deputados em exercício, valores disponíveis e gastos publicados, sem nomes de servidores.

A lista inicial mostra políticos em exercício ou eleitos na fotografia. O histórico é opcional. A busca aceita nome público/civil e combina palavras, sem distinguir acentos ou caixa; outros filtros podem ocultar resultados. Há um botão para ampliar a busca. Não são listados servidores e assessores como políticos. “Ativo” no SAPL isoladamente não comprova mandato atual: também é exigida a data do período.

União de cadastros pelo nome civil completo, normalizado para acentos, caixa e espaços. Exceção documentada: Mailza Assis da Silva / Mailza Assis Cameli. Grafias divergentes ou abreviações podem manter a mesma pessoa em perfis diferentes; não tratar a contagem histórica como número definitivo de pessoas distintas. Licenças e substituições exigem leitura das fontes.

Custos detalhados e encargos das equipes, benefícios, folha individual legislativa, despesas operacionais do Executivo e ALEAC, histórico completo das vice-governadorias, resultados de governo, votações federais e leis resultantes continuam incompletos. A aplicação oferece uma base indicativa, não prestação financeira auditada de cada centavo.

Restituições das cotas são exibidas separadamente, sem abatimento automático que possa duplicar créditos. Registros negativos das fontes são preservados. Fontes ficam junto das tabelas. Não há sincronização automática após a publicação.

## Reproduzir e verificar

`prestacao-contas.json` inclui as estimativas calculadas e as lacunas. Rode `python build.py` para regenerar o HTML a partir dos arquivos de origem do pacote; isso não faz uma nova coleta. O build reconcilia a votação dos 323 candidatos e 2.270 seções. `conferencia-prestacao-contas.json` registra conferências financeiras e estruturais. Foram testados limites de reajuste, anos completos e parciais, ausência de duplicação mensal, substituição da estimativa por folha no mesmo mês/cargo, falta de dados versus zero, exclusão de futuros mandatos e razão com projetos do ano selecionado. Arquivos brutos e identificadores pessoais de terceiros não estão no pacote publicado.

Impressão/PDF inclui as tabelas da seleção e expande os detalhes. Escolha pessoa, ano ou instituição para reduzir o tamanho do relatório.
# Valor por projeto

A consulta individual mostra a fórmula subsídio bruto estimado ÷ projetos de autoria/coautoria, para o ano escolhido e para cada período legislativo identificado. É uma curiosidade aritmética, não o custo real de elaboração de um projeto. Cotas e gabinete não entram. A estimativa usa as leis e datas do exercício, sem descontos; não comprova pagamento recebido. Períodos incompletos, meses parciais e lacunas legais são informados. Projetos sem data exata usam o ano da matéria, com aviso. Mandatos futuros ficam fora. Sem salário disponível ou sem projetos, não há divisão.

