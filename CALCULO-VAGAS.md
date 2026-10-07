# Distribuição das vagas e situações judiciais

## O que aparece no painel

“Entenda a distribuição das vagas” apresenta os oito eleitos federais e os 24 estaduais. É possível escolher cargo e partido/federação, consultar votos nominais e de legenda válidos, QE, QP, mínimos individuais, vagas por QP e pelas sobras e cada rodada de médias. As tabelas de múltiplos do QE explicam votos necessários para uma, duas ou mais vagas por QP; nas sobras não existe um limiar fixo que assegure uma vaga independentemente dos concorrentes. Também é possível gerar relatório para salvar como PDF.

“Situação judicial e simulação de vagas” apresenta seis candidaturas com votos anulados sub judice na base. As cinco proporcionais têm hipóteses isoladas de validação de seus votos; o caso de senador não usa quocientes proporcionais. Situação registrada na totalização não é confirmação do andamento judicial. Processos e decisões ainda não estão cadastrados e não há atualização automática. As simulações não alteram os resultados oficiais nas outras partes do painel.

## Referência legal

Resolução TSE nº 23.677/2021, texto atualizado para 2026: artigos 8 a 12-A. https://www.tse.jus.br/legislacao/compilada/res/2021/resolucao-no-23-677-de-16-de-dezembro-de-2021

QE: votos válidos ÷ vagas; fração até 0,5 é descartada, acima de 0,5 arredonda-se para cima. QP: votos válidos de partido/federação ÷ QE, desprezada a fração. Para vagas por QP, exige-se votação nominal de 10% do QE. Primeira etapa de sobras: mínimo partidário de 80% do QE e individual de 20%. A média usa votos válidos ÷ (QP + sobras já atribuídas + 1). Quando essa etapa se esgota, a regra contempla sobras remanescentes sem os mínimos 80/20. Percentuais podem produzir frações; como votos são inteiros, alcançar um mínimo fracionário requer o inteiro imediatamente superior.

As médias são comparadas com aritmética racional no script. Desempates usam votos da legenda/federação, votos do candidato e idade conforme a norma. Não houve empate decisivo nos cálculos publicados.

## Validação e exemplos

Os arquivos oficiais de totalização do TSE foram conferidos em 07/10/2026. A reprodução deve coincidir com QE, votos válidos e lista de eleitos oficiais antes de publicar um cenário. Federal: 462.485 votos válidos, QE 57.811 e oito eleitos. Estadual: 470.012 votos válidos, QE 19.584 e 24 eleitos.

PSD estadual: 37.917 votos nominais válidos + 2.003 de legenda = 39.920; QP = piso(39.920 / 19.584) = 2. Mínimos para uma, duas e três vagas por QP: 19.584, 39.168 e 58.752. As duas vagas foram preenchidas por Jailson Amorim e Antônio Pedro, ambos acima do mínimo individual.

No cenário de Antônia Lúcia, só seus 6.127 votos são validados. O QE sobe para 58.576, PT/PCdoB/PV fica abaixo de 80% do QE, MDB passa a duas vagas e União/PP mantém quatro. Ney entra, Perpétua sai e Zé Adriano permanece nessa hipótese. Nenhuma decisão judicial posterior foi confirmada ou incorporada.

## Manutenção e novos casos

- `situacoes-judiciais.json` é o cadastro autoritativo dos casos: candidato, fonte, data, número de processo, link de decisão, observação e cenário. `process` e `decisionURL` devem permanecer nulos enquanto não houver fonte oficial confirmada. Novos casos precisam corresponder a um candidato da base.
- `distribuicao-vagas.json` contém os cálculos estaduais completos, separados das hipóteses judiciais.
- `tools/calcular_vagas.py` reproduz dados de totalização oficiais. `verified_base(data)` valida a base e `calculate(data, [numero])` permite conferir uma hipótese proporcional antes de incluí-la no cadastro. Não é um monitor de processos.
- Execute `python build.py` depois de atualizar os cadastros/fontes. O build incorpora ambos os arquivos no HTML e confere as listas oficiais e os totais contra a base do painel. Os dados eleitorais e de simulações devem ser atualizados juntos; não misture pleitos, datas de coleta ou versões de federações.

Os campos são estaduais e não dependem dos filtros por bairros ou seções. Isso evita apresentar quocientes locais como se determinassem vagas estaduais.
