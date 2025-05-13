-- Function: manutencao.fnc_gerardocumentoautomatico_processar_exclusao(integer, integer, integer, integer, integer, bigint, integer)

-- DROP FUNCTION manutencao.fnc_gerardocumentoautomatico_processar_exclusao(integer, integer, integer, integer, integer, bigint, integer);

CREATE OR REPLACE FUNCTION manutencao.fnc_gerardocumentoautomatico_processar_exclusao(
    pnusuario integer,
    pngrupo integer,
    pnempresa integer,
    pnfilial integer,
    pnunidade integer,
    pnsequencia bigint,
    pnacao integer)
  RETURNS manutencao.tp_fnc_gerardocumentoautomatico_processar_exclusao AS
$BODY$
/* **********************************************************
* Descrição da Função: 
* Data:  07/03/2023 
* Autor: Andréa Pinto 
* 
* Objetivo: 
* 	Excluir registro do painel do automático. 
*  
*  pnAcao = 1 - Validar e Excluir, 2 - Somente Validar
*  
* Alterações
* Data		Modificado por			Comentário 
************************************************************ 
* 
*********************************************************** */
DECLARE
	tRetorno manutencao.tp_fnc_gerardocumentoautomatico_processar_exclusao;
	
	cExceptionDetail TEXT;
	cExceptionContext TEXT;
	cQuery TEXT;
	cCampos TEXT;
	cWhere TEXT; 
	cProcedimento                     TEXT;
	cProcedimentoSeparador				 TEXT = RPAD('-- ',200,'*') || CHR(13);
	
	nPerm_Excluir INT;
	
	rValidar RECORD;
	
	jCampos JSON;
	
	tTabela					manutencao.gerardocumentoautomatico;
	
	tTabelaAfretamento	manutencao.gerardocumentoautomatico_afretamento;
	tTabelaColeta			manutencao.gerardocumentoautomatico_coleta;
	tTabelaConhecimento	manutencao.gerardocumentoautomatico_conhecimento;
	tTabelaControle		manutencao.gerardocumentoautomatico_controleemissao;
	tTabelaCrt				manutencao.gerardocumentoautomatico_crt;
	tTabelaGR				manutencao.gerardocumentoautomatico_gerenciamentorisco;
	tTabelaLog				manutencao.gerardocumentoautomatico_log;
	tTabelaManifesto		manutencao.gerardocumentoautomatico_manifesto;
	tTabelaMdfe				manutencao.gerardocumentoautomatico_mdfe;
	tTabelaMic				manutencao.gerardocumentoautomatico_mic;
	tTabelaNfse				manutencao.gerardocumentoautomatico_notafiscalservico;
	tTabelaPef				manutencao.gerardocumentoautomatico_pef;
	tTabelaPreGR			manutencao.gerardocumentoautomatico_pregerenciamentorisco;
	tTabelaPE				manutencao.gerardocumentoautomatico_programacaoembarque;
	tTabelaPEVazio			manutencao.gerardocumentoautomatico_programacaoembarquevazio;
	tTabelaRecibo			manutencao.gerardocumentoautomatico_recibo;
	tTabelaRedespacho		manutencao.gerardocumentoautomatico_redespacho;
	tTabelaRedContratado	manutencao.gerardocumentoautomatico_redespachocontratado;
	tTabelaTransporte		manutencao.gerardocumentoautomatico_transporte;
	tTabelaValePedagio	manutencao.gerardocumentoautomatico_valepedagio;
	
BEGIN
	tRetorno.erro = FALSE;
	tRetorno.mensagem = '';
	tRetorno.camposadicionais = NULL;
	cExceptionContext = '';
	jCampos = NULL;
	
	pnAcao = COALESCE(pnAcao,1);

	cProcedimento = 'Gerar Documento Automatico [Processar Exclusao] - Verifica se registro pode ser excluido';
	RAISE DEBUG '% ## %',cProcedimentoSeparador,cProcedimento;
	
	/*
	 * Verifica se registro pode ser excluido
	 */
	 
	nPerm_Excluir = 2;
	
	SELECT
		retorno.gerarpregerenciamentorisco
		,retorno.gerarconhecimento 
		,retorno.gerarnotafiscalservico 
		,retorno.gerarcrt 
		,retorno.gerarredespachorecebido 
		,retorno.gerarrecibo
		,retorno.gerarprogramacaoembarque 
		,retorno.gerarprogramacaoembarquevazio 
		,retorno.gerarafretamento 
		,retorno.gerarredespacho
		,(CASE retorno.documentocarga WHEN 1 THEN retorno.gerarmanifesto WHEN 2 THEN retorno.gerarredespacho WHEN 3 THEN retorno.gerartransporte ELSE 3 END) AS gerardoccarga
		,retorno.gerarpef
		,retorno.gerarmdfe
		,retorno.gerarvalepedagio
		,retorno.gerargerenciamentorisco
		,retorno.gerarmic
		,retorno.qtdnfe
		,retorno.gerardocumentoautomaticobloqueado

	INTO
		rValidar
	FROM fnc_fila_200_monitoramento(pnSequencia) AS retorno;
	
	/*
	 * Validar se os documentos estão cancelados ou em uma situação que não emita documento
	 */
	IF rValidar.gerarpregerenciamentorisco IN (3,6,8)
	       AND rValidar.gerarconhecimento IN (3,6,8) 
	       AND rValidar.gerarnotafiscalservico IN (3,6,8) 
	       AND rValidar.gerarcrt IN (3,6,8) 
	       AND rValidar.gerarredespachorecebido IN (3,8) 
	       AND rValidar.gerarrecibo IN (3,6,8) 
	       AND rValidar.gerarprogramacaoembarque IN (3,6,8) 
	       AND rValidar.gerarprogramacaoembarquevazio IN (3,6,8) 
	       AND rValidar.gerarafretamento IN (3,6,8) 
	       AND rValidar.gerarredespacho IN (3,8) 
	       AND rValidar.gerardoccarga IN (3,6,8)
	       AND rValidar.gerarpef IN (3,6,8) 
	       AND rValidar.gerarmdfe IN (3,6,8) 
	       AND rValidar.gerarvalepedagio IN (3,6,8) 
	       AND rValidar.gerargerenciamentorisco IN (3,6,8) 
	       AND rValidar.gerarmic IN (3,6,8) THEN
		nPerm_Excluir = 1;
	END IF;
	
	/*
	 * Se nem todos os documentos estiverem cancelados, mas estiver pendente de emissão
	 * de documento e ainda não possuir nota, sistema não vai gerar os documentos.
	 * Nessa situação, podemos excluir.
	 */
	IF nPerm_Excluir = 2 THEN
		
		IF (rValidar.gerarconhecimento = 1
	       OR rValidar.gerarnotafiscalservico = 1 
	       OR rValidar.gerarcrt = 1
	       OR rValidar.gerarredespachorecebido = 1 
	       OR rValidar.gerarrecibo = 1)
	       AND (COALESCE(rValidar.qtdnfe,0) = 0
	       		OR rValidar.gerardocumentoautomaticobloqueado = 1) THEN
	       nPerm_Excluir = 1;
		END IF;
		
	END IF;


	IF COALESCE (nPerm_Excluir,2) != 1 THEN
		-- MSG(7264) Para executar exclusão todos documentos devem estar nas situações "Não Se Aplica", "Cancelada Emissão" ou "Documento Cancelado".
		SELECT 
			erro
			,mensagem 
		INTO 
			tRetorno.erro 
			,tRetorno.mensagem 
		FROM avacorpi.fnc_monta_mensagemretorno(pnUsuario
						,'' -- Nome Validacao
						,TRUE -- Abortar True/False
						,NULL -- Mensagens a retornar
						,NULL -- Mensagens do JSON
						,NUll -- Codigo do Tipo documento Aviso
						,7264 -- Codigo da Mensagem Traducao
						);
		RETURN tRetorno;				
	END IF;
	
	IF pnAcao = 2 THEN
		RETURN tRetorno;
	END IF;

	/* ******************************************
	 * Excluir registros das tabelas filhas
	 ****************************************** */ 
	/*
	 * manutencao.gerardocumentoautomatico_afretamento
	 */
	cProcedimento = 'Gerar Documento Automatico [Processar Exclusao] - Afretamento';
	RAISE DEBUG '% ## %',cProcedimentoSeparador,cProcedimento;
	
	FOR tTabelaAfretamento IN 
		SELECT
			manutencao.gerardocumentoautomatico_afretamento.*
		FROM manutencao.gerardocumentoautomatico_afretamento
		
		WHERE
			sequencia = pnSequencia
	
	LOOP
		-- Campos para cláusula do Where
		cWhere = '{"sequencia" : '|| tTabelaAfretamento.sequencia ||'
					 ,"grupo" : '|| tTabelaAfretamento.grupo ||'
					 ,"empresa" : '|| tTabelaAfretamento.empresa ||'
					 ,"filial" : '|| tTabelaAfretamento.filial ||'
					 ,"unidade" : '|| tTabelaAfretamento.unidade ||'
					 ,"diferenciadornumero" : '|| tTabelaAfretamento.diferenciadornumero ||'
					 ,"numero" : '|| tTabelaAfretamento.numero ||'}';
		
		-- Chamar Função para Executar o Comando SQL
		SELECT
			retorno.erro
			,retorno.mensagem
		INTO
			rValidar
		FROM manutencao.fnc_gerardocumentoautomatico_afretamento_iae('E'
		        ,pnUsuario
		        ,pnGrupo
		        ,pnEmpresa
		        ,pnFilial
		        ,pnUnidade
		        ,tTabelaAfretamento
		        ,NULL -- pcCampos
		        ,cWhere -- pcWhere
		        ,TRUE -- pbValidarIntegridade
		        ) AS retorno;
		
		IF rValidar.erro THEN 
			RAISE EXCEPTION '%',rValidar.mensagem;
			--tRetorno.erro = rValidar.erro;
			--tRetorno.mensagem = rValidar.mensagem;
			--RETURN tRetorno;
		END IF;
	END LOOP;

	/*
	 * manutencao.gerardocumentoautomatico_coleta
	 */
	cProcedimento = 'Gerar Documento Automatico [Processar Exclusao] - Coleta';
	RAISE DEBUG '% ## %',cProcedimentoSeparador,cProcedimento;
	
	FOR tTabelaColeta IN
		SELECT
			manutencao.gerardocumentoautomatico_coleta.*
		FROM manutencao.gerardocumentoautomatico_coleta
		
		WHERE
			 sequencia = pnSequencia
	LOOP
		-- Campos para cláusula do Where
		cWhere = '{"sequencia" : '|| tTabelaColeta.sequencia ||'
					 ,"grupo" : '|| tTabelaColeta.grupo ||'
					 ,"empresa" : '|| tTabelaColeta.empresa ||'
					 ,"filial" : '|| tTabelaColeta.filial ||'
					 ,"unidade" : '|| tTabelaColeta.unidade ||'
					 ,"diferenciadornumero" : '|| tTabelaColeta.diferenciadornumero ||'
					 ,"serie" : '|| tTabelaColeta.serie ||'
					 ,"numero" : '|| tTabelaColeta.numero ||'}';
		
		-- Chamar Função para Executar o Comando SQL
		SELECT
			retorno.erro
			,retorno.mensagem
		INTO
			rValidar
		FROM manutencao.fnc_gerardocumentoautomatico_coleta_iae('E'
				,pnUsuario
		      ,pnGrupo
		      ,pnEmpresa
		      ,pnFilial
		      ,pnUnidade
				,tTabelaColeta
				,NULL -- pcCampos
				,cWhere -- pcWhere
				,TRUE -- pbValidarIntegridade
				) AS retorno;
		
		IF rValidar.erro THEN 
			RAISE EXCEPTION '%',rValidar.mensagem;
		END IF;
	END LOOP;

 	/*
 	 * manutencao.gerardocumentoautomatico_conhecimento
 	 */
 	cProcedimento = 'Gerar Documento Automatico [Processar Exclusao] - Conhecimento';
	RAISE DEBUG '% ## %',cProcedimentoSeparador,cProcedimento;
	
	FOR tTabelaConhecimento IN
		SELECT
			manutencao.gerardocumentoautomatico_conhecimento.*
		FROM manutencao.gerardocumentoautomatico_conhecimento
		
		WHERE
			 sequencia = pnSequencia
	LOOP
		-- Campos para cláusula do Where
		cWhere = '{"sequencia" : '|| tTabelaConhecimento.sequencia ||'
					 ,"grupo" : '|| tTabelaConhecimento.grupo ||'
					 ,"empresa" : '|| tTabelaConhecimento.empresa ||'
					 ,"filial" : '|| tTabelaConhecimento.filial ||'
					 ,"unidade" : '|| tTabelaConhecimento.unidade ||'
					 ,"diferenciadornumero" : '|| tTabelaConhecimento.diferenciadornumero ||'
					 ,"serie" : '|| tTabelaConhecimento.serie ||'
					 ,"numero" : '|| tTabelaConhecimento.numero ||'}';
		
		-- Chamar Função para Executar o Comando SQL
		SELECT
			retorno.erro
			,retorno.mensagem
		INTO
			rValidar
		FROM manutencao.fnc_gerardocumentoautomatico_conhecimento_iae('E'
				,pnUsuario
		      ,pnGrupo
		      ,pnEmpresa
		      ,pnFilial
		      ,pnUnidade
				,tTabelaConhecimento
				,NULL -- pcCampos
				,cWhere -- pcWhere
				,TRUE -- pbValidarIntegridade
				) AS retorno;
		
		IF rValidar.erro THEN  
			RAISE EXCEPTION '%',rValidar.mensagem;
		END IF;
	END LOOP;

	/*
	 * manutencao.gerardocumentoautomatico_controleemissao --->>>Perguntar para o Daniel
	 */ 
	 
	cProcedimento = 'Gerar Documento Automatico [Processar Exclusao] - Controle Emissao';
	RAISE DEBUG '% ## %',cProcedimentoSeparador,cProcedimento;
	
	FOR tTabelaControle IN
		SELECT
			manutencao.gerardocumentoautomatico_controleemissao.*
		FROM manutencao.gerardocumentoautomatico_controleemissao
		
		WHERE
			 sequencia = pnSequencia
	LOOP
		-- Campos para cláusula do Where
		cWhere = '{"sequencia" : '|| tTabelaControle.sequencia ||'
				    ,"tipodocumento" : '|| tTabelaControle.tipodocumento ||'}';
		
		-- Chamar Função para Executar o Comando SQL
		SELECT
			retorno.erro
			,retorno.mensagem
		INTO
			rValidar
		FROM manutencao.fnc_gerardocumentoautomatico_controleemissao_iae('E'
				,pnUsuario
		      ,pnGrupo
		      ,pnEmpresa
		      ,pnFilial
		      ,pnUnidade
				,tTabelaControle
				,NULL -- pcCampos
				,cWhere -- pcWhere
				,FALSE -- pbValidarIntegridade
				) AS retorno;
		
		IF rValidar.erro THEN 
			RAISE EXCEPTION '%',rValidar.mensagem;
		END IF;
	END LOOP;
	
	/*
	 * manutencao.gerardocumentoautomatico_crt
	 */
	 
	cProcedimento = 'Gerar Documento Automatico [Processar Exclusao] - CRT';
	RAISE DEBUG '% ## %',cProcedimentoSeparador,cProcedimento;
	
	FOR tTabelaCrt IN
		SELECT
			manutencao.gerardocumentoautomatico_crt.*
		FROM manutencao.gerardocumentoautomatico_crt
			
		WHERE
			 sequencia = pnSequencia
	LOOP
		-- Campos para cláusula do Where
			cWhere = '{"sequencia" : '|| tTabelaCrt.sequencia ||'
						 ,"grupo" : '|| tTabelaCrt.grupo ||'
						 ,"empresa" : '|| tTabelaCrt.empresa ||'
						 ,"filial" : '|| tTabelaCrt.filial ||'
						 ,"unidade" : '|| tTabelaCrt.unidade ||'
						 ,"diferenciadorsequencia" : '|| tTabelaCrt.diferenciadorsequencia ||'
						 ,"sequenciacrt" : '|| tTabelaCrt.sequenciacrt ||'}';
		
		-- Chamar Função para Executar o Comando SQL
		SELECT
			retorno.erro
			,retorno.mensagem
		INTO
			rValidar
		FROM manutencao.fnc_gerardocumentoautomatico_crt_iae('E'
				,pnUsuario
				,pnGrupo
				,pnEmpresa
				,pnFilial
				,pnUnidade
				,tTabelaCrt
				,NULL -- pcCampos
				,cWhere -- pcWhere
				,TRUE -- pbValidarIntegridade
				) AS retorno;
		
		IF rValidar.erro THEN 
			RAISE EXCEPTION '%',rValidar.mensagem;
		END IF;
	END LOOP;

	/*
	 * manutencao.gerardocumentoautomatico_gerenciamentorisco
	 */

	cProcedimento = 'Gerar Documento Automatico [Processar Exclusao] - GR';
	RAISE DEBUG '% ## %',cProcedimentoSeparador,cProcedimento;
	
	 FOR tTabelaGR IN
		SELECT
			manutencao.gerardocumentoautomatico_gerenciamentorisco.*
		FROM manutencao.gerardocumentoautomatico_gerenciamentorisco
			
		WHERE
			 sequencia = pnSequencia
	LOOP
		-- Campos para cláusula do Where
		cWhere = '{"sequenciagr" : '|| tTabelaGR.sequenciagr ||'}';
		
		-- Chamar Função para Executar o Comando SQL
		SELECT
			retorno.erro
			,retorno.mensagem
		INTO
			rValidar
		FROM manutencao.fnc_gerardocumentoautomatico_gerenciamentorisco_iae('E'
				,pnUsuario
				,pnGrupo
				,pnEmpresa
				,pnFilial
				,pnUnidade
				,tTabelaGR
				,NULL -- pcCampos
				,cWhere -- pcWhere
				,TRUE -- pbValidarIntegridade
				) AS retorno;
		
		IF rValidar.erro THEN 
			RAISE EXCEPTION '%',rValidar.mensagem;
		END IF;
	END LOOP;
	  
	 /*
	 * manutencao.gerardocumentoautomatico_log
	 */

	cProcedimento = 'Gerar Documento Automatico [Processar Exclusao] - Log';
	RAISE DEBUG '% ## %',cProcedimentoSeparador,cProcedimento;
	
	FOR tTabelaLog IN
		SELECT
			manutencao.gerardocumentoautomatico_log.*
		FROM manutencao.gerardocumentoautomatico_log
		
		WHERE
			 seqgerardocaut = pnSequencia
	LOOP
		-- Campos para cláusula do Where
		cWhere = '{"sequencia" : '|| tTabelaLog.sequencia ||'}';
	 	
		-- Chamar Função para Executar o Comando SQL
		SELECT
			retorno.erro
			,retorno.mensagem
		INTO
			rValidar
		FROM manutencao.fnc_gerardocumentoautomatico_log_iae('E'
				,pnUsuario
				,pnGrupo
				,pnEmpresa
				,pnFilial
				,pnUnidade
				,tTabelaLog
				,NULL -- pcCampos
				,cWhere -- pcWhere
				,FALSE -- pbValidarIntegridade
				) AS retorno;
	 	
		IF rValidar.erro THEN 
			RAISE EXCEPTION '%',rValidar.mensagem;
		END IF;
	END LOOP;
	 
	/*
	* manutencao.gerardocumentoautomatico_manifesto
	*/

	cProcedimento = 'Gerar Documento Automatico [Processar Exclusao] - Manifesto';
	RAISE DEBUG '% ## %',cProcedimentoSeparador,cProcedimento;
	
	FOR tTabelaManifesto IN
		SELECT
			manutencao.gerardocumentoautomatico_manifesto.*
		FROM manutencao.gerardocumentoautomatico_manifesto
	 		
		WHERE
			sequencia = pnSequencia
	LOOP
		-- Campos para cláusula do Where
		cWhere = '{"sequencia" : '|| tTabelaManifesto.sequencia ||'
					 ,"grupo" : '|| tTabelaManifesto.grupo ||'
					 ,"empresa" : '|| tTabelaManifesto.empresa ||'
					 ,"filial" : '|| tTabelaManifesto.filial ||'
					 ,"unidade" : '|| tTabelaManifesto.unidade ||'
					 ,"diferenciadornumero" : '|| tTabelaManifesto.diferenciadornumero ||'
					 ,"serie" : '|| tTabelaManifesto.serie ||'
					 ,"numero" : '|| tTabelaManifesto.numero ||'}';
	 	
		-- Chamar Função para Executar o Comando SQL
		SELECT
			retorno.erro
			,retorno.mensagem
		INTO
			rValidar
		FROM manutencao.fnc_gerardocumentoautomatico_manifesto_iae('E'
				,pnUsuario
				,pnGrupo
				,pnEmpresa
				,pnFilial
				,pnUnidade
				,tTabelaManifesto
				,NULL -- pcCampos
				,cWhere -- pcWhere
				,TRUE -- pbValidarIntegridade
				) AS retorno;
	 	
		IF rValidar.erro THEN 
			RAISE EXCEPTION '%',rValidar.mensagem;
		END IF;
	END LOOP;
	 
	 /*
	 * manutencao.gerardocumentoautomatico_mdfe 
	 */

	cProcedimento = 'Gerar Documento Automatico [Processar Exclusao] - MDFe';
	RAISE DEBUG '% ## %',cProcedimentoSeparador,cProcedimento;
	
	 FOR tTabelaMdfe IN
		SELECT
			manutencao.gerardocumentoautomatico_mdfe.*
		FROM manutencao.gerardocumentoautomatico_mdfe
			
		WHERE
			 sequencia = pnSequencia
	LOOP
		-- Campos para cláusula do Where
		cWhere = '{"grupo" : '|| tTabelaMdfe.grupo ||'
					 ,"empresa" : '|| tTabelaMdfe.empresa ||'
					 ,"filial" : '|| tTabelaMdfe.filial ||'
					 ,"unidade" : '|| tTabelaMdfe.unidade ||'
					 ,"diferenciadornumero" : '|| tTabelaMdfe.diferenciadornumero ||'
					 ,"serie" : '|| tTabelaMdfe.serie ||'
					 ,"numero" : '|| tTabelaMdfe.numero ||'}';
		
		-- Chamar Função para Executar o Comando SQL
		SELECT
			retorno.erro
			,retorno.mensagem
		INTO
			rValidar
		FROM manutencao.fnc_gerardocumentoautomatico_mdfe_iae('E'
				,pnUsuario
				,pnGrupo
				,pnEmpresa
				,pnFilial
				,pnUnidade
				,tTabelaMdfe
				,NULL -- pcCampos
				,cWhere -- pcWhere
				,TRUE -- pbValidarIntegridade
				) AS retorno;
		
		IF rValidar.erro THEN 
			RAISE EXCEPTION '%',rValidar.mensagem;
		END IF;
	END LOOP;

	cProcedimento = 'Gerar Documento Automatico [Processar Exclusao] - MIC';
	RAISE DEBUG '% ## %',cProcedimentoSeparador,cProcedimento;
	
	 /*
	 * manutencao.gerardocumentoautomatico_mic
	 */
	 FOR tTabelaMic IN
		SELECT
			manutencao.gerardocumentoautomatico_mic.*
		FROM manutencao.gerardocumentoautomatico_mic
			
		WHERE
			 sequencia = pnSequencia
	LOOP
		-- Campos para cláusula do Where
		cWhere = '{"sequencia" : '|| tTabelaMic.sequencia ||'
					 ,"grupo" : '|| tTabelaMic.grupo ||'
					 ,"empresa" : '|| tTabelaMic.empresa ||'
					 ,"filial" : '|| tTabelaMic.filial ||'
					 ,"unidade" : '|| tTabelaMic.unidade ||'
					 ,"diferenciadorsequencia" : '|| tTabelaMic.diferenciadorsequencia ||'
					 ,"sequenciamic" : '|| tTabelaMic.sequenciamic ||'}';
		
		-- Chamar Função para Executar o Comando SQL
		SELECT
			retorno.erro
			,retorno.mensagem
		INTO
			rValidar
		FROM manutencao.fnc_gerardocumentoautomatico_mic_iae('E'
				,pnUsuario
				,pnGrupo
				,pnEmpresa
				,pnFilial
				,pnUnidade
				,tTabelaMic
				,NULL -- pcCampos
				,cWhere -- pcWhere
				,TRUE -- pbValidarIntegridade
				) AS retorno;
		
		IF rValidar.erro THEN 
			RAISE EXCEPTION '%',rValidar.mensagem;
		END IF;
	END LOOP;
	 
	 /*
	 * manutencao.gerardocumentoautomatico_notafiscalservico
	 */

	cProcedimento = 'Gerar Documento Automatico [Processar Exclusao] - NFSe';
	RAISE DEBUG '% ## %',cProcedimentoSeparador,cProcedimento;
	
	 FOR tTabelaNfse IN
		SELECT
			manutencao.gerardocumentoautomatico_notafiscalservico.*
		FROM manutencao.gerardocumentoautomatico_notafiscalservico
			
		WHERE
			 sequencia = pnSequencia
	LOOP
		-- Campos para cláusula do Where
		cWhere = '{"sequencia" : '|| tTabelaNfse.sequencia ||'
					 ,"grupo" : '|| tTabelaNfse.grupo ||'
					 ,"empresa" : '|| tTabelaNfse.empresa ||'
					 ,"filial" : '|| tTabelaNfse.filial ||'
					 ,"unidade" : '|| tTabelaNfse.unidade ||'
					 ,"diferenciadornumero" : '|| tTabelaNfse.diferenciadornumero ||'
					 ,"serie" : '|| tTabelaNfse.serie ||'
					 ,"numero" : '|| tTabelaNfse.numero ||'}';
		
		-- Chamar Função para Executar o Comando SQL
		SELECT
			retorno.erro
			,retorno.mensagem
		INTO
			rValidar
		FROM manutencao.fnc_gerardocumentoautomatico_notafiscalservico_iae('E'
				,pnUsuario
				,pnGrupo
				,pnEmpresa
				,pnFilial
				,pnUnidade
				,tTabelaNfse
				,NULL -- pcCampos
				,cWhere -- pcWhere
				,TRUE -- pbValidarIntegridade
				) AS retorno;
		
		IF rValidar.erro THEN 
			RAISE EXCEPTION '%',rValidar.mensagem;
		END IF;
	END LOOP;
	
	 /*
	 * manutencao.gerardocumentoautomatico_pef
	 */

	cProcedimento = 'Gerar Documento Automatico [Processar Exclusao] - PEF';
	RAISE DEBUG '% ## %',cProcedimentoSeparador,cProcedimento;
	
	 FOR tTabelaPef IN
		SELECT
			manutencao.gerardocumentoautomatico_pef.*
		FROM manutencao.gerardocumentoautomatico_pef
			
		WHERE
			 sequencia = pnSequencia
	LOOP
		-- Campos para cláusula do Where
		cWhere = '{"sequencia" : '|| tTabelaPef.sequencia ||'
					 ,"grupo" : '|| tTabelaPef.grupo ||'
					 ,"empresa" : '|| tTabelaPef.empresa ||'
					 ,"sequenciapef" : '|| tTabelaPef.sequenciapef ||'}';
		
		-- Chamar Função para Executar o Comando SQL
		SELECT
			retorno.erro
			,retorno.mensagem
		INTO
			rValidar
		FROM manutencao.fnc_gerardocumentoautomatico_pef_iae('E'
				,pnUsuario
				,pnGrupo
				,pnEmpresa
				,pnFilial
				,pnUnidade
				,tTabelaPef
				,NULL -- pcCampos
				,cWhere -- pcWhere
				,TRUE -- pbValidarIntegridade
				) AS retorno;
		
		IF rValidar.erro THEN 
			RAISE EXCEPTION '%',rValidar.mensagem;
		END IF;
	END LOOP;
	 
	 /*
	 * manutencao.gerardocumentoautomatico_pregerenciamentorisco
	 */

	cProcedimento = 'Gerar Documento Automatico [Processar Exclusao] - Pre-GR';
	RAISE DEBUG '% ## %',cProcedimentoSeparador,cProcedimento;
	
	 FOR tTabelaPreGR IN
		SELECT
			manutencao.gerardocumentoautomatico_pregerenciamentorisco.*
		FROM manutencao.gerardocumentoautomatico_pregerenciamentorisco
			
		WHERE
			 sequenciaautomatico = pnSequencia
	LOOP
		-- Campos para cláusula do Where
		cWhere = '{"id" : '|| tTabelaPreGR.id ||'}';
		
		-- Chamar Função para Executar o Comando SQL
		SELECT
			retorno.erro
			,retorno.mensagem
		INTO
			rValidar
		FROM manutencao.fnc_gerardocumentoautomatico_pregerenciamentorisco_iae('E'
				,pnUsuario
				,pnGrupo
				,pnEmpresa
				,pnFilial
				,pnUnidade
				,tTabelaPreGR
				,NULL -- pcCampos
				,cWhere -- pcWhere
				,TRUE -- pbValidarIntegridade
				) AS retorno;
		
		IF rValidar.erro THEN 
			RAISE EXCEPTION '%',rValidar.mensagem;
		END IF;
	END LOOP;
	 
	 /*
	 * manutencao.gerardocumentoautomatico_programacaoembarque
	 */

	 cProcedimento = 'Gerar Documento Automatico [Processar Exclusao] - Programacao Embarque';
	RAISE DEBUG '% ## %',cProcedimentoSeparador,cProcedimento;
	
	 FOR tTabelaPE IN
		SELECT
			manutencao.gerardocumentoautomatico_programacaoembarque.*
		FROM manutencao.gerardocumentoautomatico_programacaoembarque
			
		WHERE
			 sequencia = pnSequencia
	LOOP
		-- Campos para cláusula do Where
		cWhere = '{"sequencia" : '|| tTabelaPE.sequencia ||'
					 ,"grupo" : '|| tTabelaPE.grupo ||'
					 ,"empresa" : '|| tTabelaPE.empresa ||'
					 ,"diferenciadornumero" : '|| tTabelaPE.diferenciadornumero ||'
					 ,"numero" : '|| tTabelaPE.numero ||'}';
		
		-- Chamar Função para Executar o Comando SQL
		SELECT
			retorno.erro
			,retorno.mensagem
		INTO
			rValidar
		FROM manutencao.fnc_gerardocumentoautomatico_programacaoembarque_iae('E'
				,pnUsuario
				,pnGrupo
				,pnEmpresa
				,pnFilial
				,pnUnidade
				,tTabelaPE
				,NULL -- pcCampos
				,cWhere -- pcWhere
				,TRUE -- pbValidarIntegridade
				) AS retorno;
		
		IF rValidar.erro THEN 
			RAISE EXCEPTION '%',rValidar.mensagem;
		END IF;
	END LOOP;
	 
	 /*
	 * manutencao.gerardocumentoautomatico_programacaoembarquevazio
	 */

	 cProcedimento = 'Gerar Documento Automatico [Processar Exclusao] - Programacao Embarque Vazio';
	RAISE DEBUG '% ## %',cProcedimentoSeparador,cProcedimento;
	
	 FOR tTabelaPEVazio IN
		SELECT
			manutencao.gerardocumentoautomatico_programacaoembarquevazio.*
		FROM manutencao.gerardocumentoautomatico_programacaoembarquevazio
			
		WHERE
			 sequencia = pnSequencia
	LOOP
		-- Campos para cláusula do Where
		cWhere = '{"sequencia" : '|| tTabelaPEVazio.sequencia ||'
					 ,"grupo" : '|| tTabelaPEVazio.grupo ||'
					 ,"empresa" : '|| tTabelaPEVazio.empresa ||'
					 ,"diferenciadornumero" : '|| tTabelaPEVazio.diferenciadornumero ||'
					 ,"numero" : '|| tTabelaPEVazio.numero ||'}';
		
		-- Chamar Função para Executar o Comando SQL
		SELECT
			retorno.erro
			,retorno.mensagem
		INTO
			rValidar
		FROM manutencao.fnc_gerardocumentoautomatico_programacaoembarquevazio_iae('E'
				,pnUsuario
				,pnGrupo
				,pnEmpresa
				,pnFilial
				,pnUnidade
				,tTabelaPEVazio
				,NULL -- pcCampos
				,cWhere -- pcWhere
				,TRUE -- pbValidarIntegridade
				) AS retorno;
		
		IF rValidar.erro THEN 
			RAISE EXCEPTION '%',rValidar.mensagem;
		END IF;
	END LOOP;
	 
	 /*
	 * manutencao.gerardocumentoautomatico_recibo
	 */

	 cProcedimento = 'Gerar Documento Automatico [Processar Exclusao] - Recibo';
	RAISE DEBUG '% ## %',cProcedimentoSeparador,cProcedimento;
	
	 FOR tTabelaRecibo IN
		SELECT
			manutencao.gerardocumentoautomatico_recibo.*
		FROM manutencao.gerardocumentoautomatico_recibo
			
		WHERE
			 sequencia = pnSequencia
	LOOP
		-- Campos para cláusula do Where
		cWhere = '{"sequencia" : '|| tTabelaRecibo.sequencia ||'
					 ,"grupo" : '|| tTabelaRecibo.grupo ||'
					 ,"empresa" : '|| tTabelaRecibo.empresa ||'
					 ,"filial" : '|| tTabelaRecibo.filial ||'
					 ,"unidade" : '|| tTabelaRecibo.unidade ||'
					 ,"diferenciadornumero" : '|| tTabelaRecibo.diferenciadornumero ||'
					 ,"serie" : '|| tTabelaRecibo.serie ||'
					 ,"numero" : '|| tTabelaRecibo.numero ||'}';
		
		-- Chamar Função para Executar o Comando SQL
		SELECT
			retorno.erro
			,retorno.mensagem
		INTO
			rValidar
		FROM manutencao.fnc_gerardocumentoautomatico_recibo_iae('E'
				,pnUsuario
				,pnGrupo
				,pnEmpresa
				,pnFilial
				,pnUnidade
				,tTabelaRecibo
				,NULL -- pcCampos
				,cWhere -- pcWhere
				,TRUE -- pbValidarIntegridade
				) AS retorno;
		
		IF rValidar.erro THEN 
			RAISE EXCEPTION '%',rValidar.mensagem;
		END IF;
	END LOOP;
	 
	 /*
	 * manutencao.gerardocumentoautomatico_redespacho
	 */

	 cProcedimento = 'Gerar Documento Automatico [Processar Exclusao] - Redespacho';
	RAISE DEBUG '% ## %',cProcedimentoSeparador,cProcedimento;
	
	 FOR tTabelaRedespacho IN
		SELECT
			manutencao.gerardocumentoautomatico_redespacho.*
		FROM manutencao.gerardocumentoautomatico_redespacho
			
		WHERE
			 sequencia = pnSequencia
	LOOP
		-- Campos para cláusula do Where
		cWhere = '{"sequencia" : '|| tTabelaRedespacho.sequencia ||'
					 ,"grupo" : '|| tTabelaRedespacho.grupo ||'
					 ,"empresa" : '|| tTabelaRedespacho.empresa ||'
					 ,"cnpjcpfcodigoemissor" : '|| COALESCE(TO_JSON(TRIM(tTabelaRedespacho.cnpjcpfcodigoemissor)::TEXT),'null') ||'
					 ,"dtemissao" : '|| COALESCE(TO_JSON(tTabelaRedespacho.dtemissao)::TEXT,'null') ||'
					 ,"serie" : '|| tTabelaRedespacho.serie ||'
					 ,"numero" : '|| tTabelaRedespacho.numero ||'}';
		
		-- Chamar Função para Executar o Comando SQL
		SELECT
			retorno.erro
			,retorno.mensagem
		INTO
			rValidar
		FROM manutencao.fnc_gerardocumentoautomatico_redespacho_iae('E'
				,pnUsuario
				,pnGrupo
				,pnEmpresa
				,pnFilial
				,pnUnidade
				,tTabelaRedespacho
				,NULL -- pcCampos
				,cWhere -- pcWhere
				,TRUE -- pbValidarIntegridade
				) AS retorno;
		
		IF rValidar.erro THEN 
			RAISE EXCEPTION '%',rValidar.mensagem;
		END IF;
	END LOOP;
	 
	 /*
	 * manutencao.gerardocumentoautomatico_redespachocontratado
	 */

	 cProcedimento = 'Gerar Documento Automatico [Processar Exclusao] - Redespacho Contratado';
	RAISE DEBUG '% ## %',cProcedimentoSeparador,cProcedimento;
	
	FOR tTabelaRedContratado IN
		SELECT
			manutencao.gerardocumentoautomatico_redespachocontratado.*
		FROM manutencao.gerardocumentoautomatico_redespachocontratado
			
		WHERE
			 sequencia = pnSequencia
	LOOP
		-- Campos para cláusula do Where
		cWhere = '{"sequencia" : '|| tTabelaRedContratado.sequencia ||'
					 ,"grupo" : '|| tTabelaRedContratado.grupo ||'
					 ,"empresa" : '|| tTabelaRedContratado.empresa ||'
					 ,"filial" : '|| tTabelaRedContratado.filial ||'
					 ,"unidade" : '|| tTabelaRedContratado.unidade ||'
					 ,"diferenciadornumero" : '|| tTabelaRedContratado.diferenciadornumero ||'
					 ,"numero" : '|| tTabelaRedContratado.numero ||'}';
		
		-- Chamar Função para Executar o Comando SQL
		SELECT
			retorno.erro
			,retorno.mensagem
		INTO
			rValidar
		FROM manutencao.fnc_gerardocumentoautomatico_redespachocontratado_iae('E'
				,pnUsuario
				,pnGrupo
				,pnEmpresa
				,pnFilial
				,pnUnidade
				,tTabelaRedContratado
				,NULL -- pcCampos
				,cWhere -- pcWhere
				,TRUE -- pbValidarIntegridade
				) AS retorno;
		
		IF rValidar.erro THEN 
			RAISE EXCEPTION '%',rValidar.mensagem;
		END IF;
	END LOOP;
	
	/*
	 * manutencao.gerardocumentoautomatico_transporte
	 */

	 cProcedimento = 'Gerar Documento Automatico [Processar Exclusao] - Transporte';
	RAISE DEBUG '% ## %',cProcedimentoSeparador,cProcedimento;

	
	FOR tTabelaTransporte IN
		SELECT
			manutencao.gerardocumentoautomatico_transporte.*
		FROM manutencao.gerardocumentoautomatico_transporte
			
		WHERE
			 sequencia = pnSequencia
	LOOP
		-- Campos para cláusula do Where
		cWhere = '{"sequencia" : '|| tTabelaTransporte.sequencia ||'
					 ,"grupo" : '|| tTabelaTransporte.grupo ||'
					 ,"empresa" : '|| tTabelaTransporte.empresa ||'
					 ,"diferenciadornumero" : '|| tTabelaTransporte.diferenciadornumero ||'
					 ,"numero" : '|| tTabelaTransporte.numero ||'}';
		
		-- Chamar Função para Executar o Comando SQL
		SELECT
			retorno.erro
			,retorno.mensagem
		INTO
			rValidar
		FROM manutencao.fnc_gerardocumentoautomatico_transporte_iae('E'
				,pnUsuario
				,pnGrupo
				,pnEmpresa
				,pnFilial
				,pnUnidade
				,tTabelaTransporte
				,NULL -- pcCampos
				,cWhere -- pcWhere
				,TRUE -- pbValidarIntegridade
				) AS retorno;
		
		IF rValidar.erro THEN 
			RAISE EXCEPTION '%',rValidar.mensagem;
		END IF;
	END LOOP;
	
	/*
	 * manutencao.gerardocumentoautomatico_valepedagio
	 */

	 cProcedimento = 'Gerar Documento Automatico [Processar Exclusao] - Vale Pedagio';
	RAISE DEBUG '% ## %',cProcedimentoSeparador,cProcedimento;
	
	FOR tTabelaValePedagio IN
		SELECT
			manutencao.gerardocumentoautomatico_valepedagio.*
		FROM manutencao.gerardocumentoautomatico_valepedagio
			
		WHERE
			 sequencia = pnSequencia
	LOOP
		-- Campos para cláusula do Where
		cWhere = '{"sequencia" : '|| tTabelaValePedagio.sequencia ||'
					 ,"grupo" : '|| tTabelaValePedagio.grupo ||'
					 ,"empresa" : '|| tTabelaValePedagio.empresa ||'
					 ,"filial" : '|| tTabelaValePedagio.filial ||'
					 ,"unidade" : '|| tTabelaValePedagio.unidade ||'
					 ,"diferenciadorsequencia" : '|| tTabelaValePedagio.diferenciadorsequencia ||'
					 ,"sequenciadocumento" : '|| tTabelaValePedagio.sequenciadocumento ||'}';
		
		-- Chamar Função para Executar o Comando SQL
		SELECT
			retorno.erro
			,retorno.mensagem
		INTO
			rValidar
		FROM manutencao.fnc_gerardocumentoautomatico_valepedagio_iae('E'
				,pnUsuario
				,pnGrupo
				,pnEmpresa
				,pnFilial
				,pnUnidade
				,tTabelaValePedagio
				,NULL -- pcCampos
				,cWhere -- pcWhere
				,TRUE -- pbValidarIntegridade
				) AS retorno;
		
		IF rValidar.erro THEN 
			RAISE EXCEPTION '%',rValidar.mensagem;
		END IF;
	END LOOP;
	
	/* ******************************************
	 * Exclui registro pai
	 ****************************************** */ 
	cProcedimento = 'Gerar Documento Automatico [Processar Exclusao] - Gerar Documento Automatico';
	RAISE DEBUG '% ## %',cProcedimentoSeparador,cProcedimento;
	
	SELECT
		manutencao.gerardocumentoautomatico.*
	INTO
		tTabela
	FROM manutencao.gerardocumentoautomatico
	
	WHERE
		 sequencia = pnSequencia;
	
	-- Campos para cláusula do Where
	cWhere = '{"sequencia" : '|| pnSequencia ||'}';
	
	-- Chamar Função para Executar o Comando SQL
	SELECT
		*
	INTO
		rValidar
	FROM manutencao.fnc_gerardocumentoautomatico_iae('E'
	        ,pnUsuario
		     ,pnGrupo
		     ,pnEmpresa
		     ,pnFilial
		     ,pnUnidade
	        ,tTabela
	        ,NULL -- pcCampos
	        ,cWhere -- pcWhere
			  ,TRUE -- pbValidarIntegridade
			);
	
	IF rValidar.erro THEN 
		RAISE EXCEPTION '%',rValidar.mensagem;
	END IF;	

	--Fim exclusões
	
RETURN tRetorno;

	EXCEPTION 
		WHEN OTHERS THEN
			GET STACKED DIAGNOSTICS cExceptionDetail = PG_EXCEPTION_DETAIL
									,cExceptionContext = PG_EXCEPTION_CONTEXT;
			tRetorno.erro = TRUE;
			tRetorno.mensagem = CONCAT(cProcedimento,CHR(13),'Erro: ',CHR(13),SQLERRM);
			RETURN tRetorno;

END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION manutencao.fnc_gerardocumentoautomatico_processar_exclusao(integer, integer, integer, integer, integer, bigint, integer)
  OWNER TO postgres;
