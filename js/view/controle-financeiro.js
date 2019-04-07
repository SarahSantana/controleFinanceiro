
$(function(){

	//inicializa localStorage trazendo dados armazenados
	var transacoes = localStorage.getItem("transacoes");

	//transforma string criada anteriormente em um objeto
	transacoes = JSON.parse(transacoes);

	//verifica se nao ha alguma transacao armazenada
	if( transacoes == null ){

		//caso nao exista transacoes inicializa com array vazio
		transacoes = [];

		//desabilita extrato e esconde tabela de extrato de transacoes
		$('table#tb-extrato').addClass('disabled');

		//adiciona mensagem de aviso
		$('section#extrato').append('<p class="tb-msg">Não há transações para exibir. Insira um novo registro.</p>');

	//se nao for vazio exibe extrato
	} else {

		extratoTransacoes( transacoes );

	}

	//adiciona mascara para inputs com valor em dinheiro 
	//mask input Money
	$('.money').maskMoney();

	//abre menu mobile
	$('#open-menu-mobile').bind('click', function(){

		//habilita visualizacao do menu
		$('#menu .content').addClass('active');

	});

	//fecha menu mobile
	$('#close-menu-mobile').bind('click', function(){

		//desabilita visualizacao do menu
		$('#menu .content').removeClass('active');

	});

	//salvar nova transacao
	$('form #addTransacao').bind('click', function(){

		//inicializa contador para verificar se algum campo nao foi preenchido
		naoPreenchidos = 0;

		//verifica se todos os campos do formulario foram preenchidos
		$('form#new-transacao input, form#new-transacao select').each(function(){

			//verifica se campo e required e se esta vazio
			if( $(this).attr('required', 'required') && ( $(this).val() == "" || $(this).val() == " " ) ){

				//adiciona classe de erro
				$(this).addClass('error');

				//acrescenta ao contador de campos nao preenchidos
				naoPreenchidos++;

			} else {

				//retira classe de error de input caso tenha
				$(this).removeClass('error');
			}

		});

		//se nenhum campo requerido esta vazio
		if( naoPreenchidos == 0 ){

			//recupera dados enviados via formulario
			var tipoTransacao  = $('form select[name="tipo_transacao"]').val();
			var nomeMercadoria = $('form input[name="nome_mercadoria"]').val();
			var valor          = $('form input[name="valor"]').val();

			//formata valor enviado
			//retira simbolo de sifrao
			valor = valor.replace('R$ ', '');
			//retira . de numeros maiores que mil
			valor = valor.replace('.', '');
			//troca virgula por ponto nas casas decimais
			valor = valor.replace(',', '.');

			//limpa todos os campos do formulario
			$('form#new-transacao')[0].reset();

			//adiciona efeito de carregamento
			$(this).html('Enviando...');

			//envia dados para funcao que salvara os dados
			newTransacao( transacoes, tipoTransacao, nomeMercadoria, valor );

			//retira efeito de carregamento
			setTimeout(function(){

				$('form #addTransacao').html('Adicionar transação');

				//executa funcao que lista e exibe os dados das transacoes
				extratoTransacoes( transacoes );

			},500);

		}

	});

});

/* Adicionar nova transacao */
function newTransacao( transacoes, tipoTransacao, nomeMercadoria, valor ){

	console.log(tipoTransacao);
	console.log(nomeMercadoria);
	console.log(valor);

	//formata objeto em uma string JSON
	var transacao = JSON.stringify({

		TipoTransacao  : tipoTransacao,
		NomeMercadoria : nomeMercadoria,
		Valor          : valor

	});

	//adiciona novo item transacao ao array de transacoes
	transacoes.push( transacao );

	//atualiza localStorange com o novo array acrescido com o novo registro de transacao
	localStorage.setItem('transacoes', JSON.stringify(transacoes));

}

/* lista transacoes listando na tabela */
function extratoTransacoes( transacoes ){

	//inicializa variavel para calcular o total
	var totalExtrato = 0;
	//inicializa variavel para somar valor total de vendas
	var totalVenda   = 0;
	//inicializa variavel para somar valor total de compras
	var totalCompra  = 0;
	//inicializa variavel de lista dos valores do extrato
	var dadosTabela  = "";

	//formata dados das transacoes para exibir na tabela
	for( var i in transacoes ){

		//transforma string criada anteriormente em um objeto
		var transacao = JSON.parse(transacoes[i]);

		//verifica se foi venda(+) ou compra(-)
		if ( transacao.TipoTransacao == "Venda" ){

			//define qual icone deve ser exibido na tabela
			var icone = '+';

			//se for venda soma valor da venda no total do extrato
			totalExtrato = (parseFloat(totalExtrato) + parseFloat(transacao.Valor)).toFixed(2);

			//soma valor de todas as vendas
			totalVenda = (parseFloat(totalVenda) + parseFloat(transacao.Valor)).toFixed(2);

		} else if ( transacao.TipoTransacao == "Compra" ){

			//define qual icone deve ser exibido na tabela
			var icone = '-';

			//se for compra subtrai valor da compra no total do extrato
			totalExtrato = (parseFloat(totalExtrato) - parseFloat(transacao.Valor)).toFixed(2);

			//soma valor de todas as compras
			totalCompra = (parseFloat(totalCompra) + parseFloat(transacao.Valor)).toFixed(2);

		}

		//formata valor da compra ou venda para exibir
		var valor = parseFloat(transacao.Valor);
		var valor = valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

		//cria lista dos valores do extrato
		dadosTabela += '<tr>'
						   +'<td class="tb-desc">'
							   +'<i class="icone">'+icone+'</i>'
							   +'<span>'+transacao.NomeMercadoria+'</span>'
						   +'</td>'
						   +'<td class="tb-price">R$ '+valor+'</td>'
					  +'</tr>';

	}

	//remove mensagem de tabela vazia se existir
	$('section#extrato p.tb-msg').remove();

	//remove classe de desabilitada se a tabela estava vazia
	$('table#tb-extrato').removeClass('disabled');

	//limpa dados da tabela atual
	$('table#tb-extrato tbody').html(dadosTabela);

	//formata valor total para exibir
	var totalExtrato = parseFloat(totalExtrato);
	var totalExtrato = totalExtrato.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

	//exibe valor total na tabela
	$('table#tb-extrato tfoot #price-total').html('R$ '+totalExtrato);

	//verifica se valor de venda foi maior do que valor de compra
	if( parseFloat(totalVenda) >= parseFloat(totalCompra) ){

		$('table#tb-extrato tfoot .tipo_retorno').text("Lucro");

	//verifica se valor de compra foi maior do que valor de venda
	} else if ( parseFloat(totalCompra) > parseFloat(totalVenda) ){

		$('table#tb-extrato tfoot .tipo_retorno').text("Prejuízo");

	}
	

}