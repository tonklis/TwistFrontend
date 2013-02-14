var SERVICIO_LOGIN = 0;
var SERVICIO_USUARIO = 1;
var SERVICIO_JUEGOS_USUARIO = 2;
var SERVICIO_TIPO_CARTAS = 3;
var SERVICIO_CARTAS = 4;
var SERVICIO_AMIGOS_JUGANDO = 5;
var SERVICIO_CREAR_JUEGO = 6;
var SERVICIO_ACEPTAR_JUEGO = 7;

/**
 * Función que invoca los servicios del servidor.
 * @param tipo tipo de servicio que se invocará.
 * @param params parámetros que se enviarán junto con la petición.
 * @param funcionSuccess función que se invocará cuando se haya realizado una petición
 *   satisfactoria con los parámetros function(response, textStatus, jqXHR);
 * @param funcionError función que se invocará cuando se haya realizado una petición
 *   insatisfactoria con los parámetros function(jqXHR, textStatus, errorThrown);
 **/
function invocarServicio(tipo, params, funcionSuccess, funcionError) {
	var url = "http://still-eyrie-7957.herokuapp.com/";
	var paramsCompletos = false;
	switch (tipo) {
		case SERVICIO_LOGIN:
			if (params.facebook_id && params.first_name && params.last_name && params.email) {
				url += "login.json";
				paramsCompletos = true;
			}
			break;
		case SERVICIO_USUARIO:
			if (params.id) {
				url += "users/" + params.id + ".json";
				params = {};
				paramsCompletos = true;
			}
			break;
		case SERVICIO_JUEGOS_USUARIO:
			if (params.id) {
				url += "games_by_user/" + params.id + ".json";
				params = {};
				paramsCompletos = true;
			}
			break;
		case SERVICIO_TIPO_CARTAS:
			url += "templates.json";
			paramsCompletos = true;
			break;
		case SERVICIO_CARTAS:
			if (params.id) {
				url += "cards_by_type/" + params.id + ".json";
				params = {};
				paramsCompletos = true;
			}
			break;
		case SERVICIO_AMIGOS_JUGANDO:
			if (params.facebook_ids) {
				url += "users/registered.json";
				paramsCompletos = true;
			}
			break;
		case SERVICIO_CREAR_JUEGO:
			if (params.user_id && params.detail_xml && params.card_id && params.opponent_id && params.opponent_name) {
				url += "games/start.json";
				paramsCompletos = true;
			}
			break;
		case SERVICIO_ACEPTAR_JUEGO:
			if (params.id && params.card_id && params.card_type && params.card_facebook_id && params.card_name) {
				url += "games/accept/" + params.id + ".json";
				delete params.id;
				paramsCompletos = true;
			}
			break;
		default:
			break;
	}
	
	// navigator.notification.alert('url: ' + url + ', params: ' + JSON.stringify(params), null, 'AdivinaMe');
	if (paramsCompletos) {
		var request = $.ajax({
			url: url,
			type: "post",
			data: params
		});
		
		if (funcionSuccess === undefined) {
			funcionSuccess = function(response, textStatus, jqXHR) {
				console.log('success ' + tipo + ': ' + response);
			}
		}
		if (funcionError === undefined) {
			funcionError = function(jqXHR, textStatus, errorThrown) {
				console.log('error ' + tipo + ' - ' + textStatus + ': ' + errorThrown);
			}
		}
		
		request.done(function (response, textStatus, jqXHR) {
			funcionSuccess(response, textStatus, jqXHR);
		});
		
		request.fail(function (jqXHR, textStatus, errorThrown) {
			funcionError(jqXHR, textStatus, errorThrown);
		});
	} else {
		console.log('Parámetros insuficientes para invocar el servicio.');
		funcionError();
	}
}

/**
 * Función que realiza el login (registro u obtención del usuario) de la aplicación.
 * @param params es un objeto que debe tener las siguientes propiedades:
 *   facebook_id: id de facebook
 *   first_name: nombre del usuario
 *   last_name: apellido del usuario
 *   email: correo del usuario
 * @param funcionSuccess función que se invocará cuando se haya realizado una petición
 *   satisfactoria con los parámetros function(response, textStatus, jqXHR);
 * @param funcionError función que se invocará cuando se haya realizado una petición
 *   insatisfactoria con los parámetros function(jqXHR, textStatus, errorThrown);
 **/
function invocarLogin(params, funcionSuccess, funcionError) {
	invocarServicio(SERVICIO_LOGIN, params, funcionSuccess, funcionError);
}

/**
 * Función que actualiza el usuario en la cache con la información actual del servidor.
 **/
function actualizaUsuario() {
	var usuario = getCache('usuario');
	var params = {
		id : usuario.id
	};
	invocarServicio(SERVICIO_USUARIO, params,
	function (response, textStatus, jqXHR) {
		alert('Actualizando usuario con: ' + JSON.stringify(response));
		setCache('usuario', response);
	});
}

/**
 * Función que obtiene los juegos actuales del usuario.
 * @param params es un objeto que debe tener las siguientes propiedades:
 *   id: id de usuario
 * @param funcionSuccess función que se invocará cuando se haya realizado una petición
 *   satisfactoria con los parámetros function(response, textStatus, jqXHR);
 * @param funcionError función que se invocará cuando se haya realizado una petición
 *   insatisfactoria con los parámetros function(jqXHR, textStatus, errorThrown);
 **/
function obtenerJuegosPorUsuario(params, funcionSuccess, funcionError) {
	invocarServicio(SERVICIO_JUEGOS_USUARIO, params, funcionSuccess, funcionError);
}

/**
 * Función obtiene la lista de tipos de cartas que existen en el servidor.
 * @param funcionSuccess función que se invocará cuando se haya realizado una petición
 *   satisfactoria con los parámetros function(response, textStatus, jqXHR);
 * @param funcionError función que se invocará cuando se haya realizado una petición
 *   insatisfactoria con los parámetros function(jqXHR, textStatus, errorThrown);
 **/
function obtenerTiposCartas(funcionSuccess, funcionError) {
	invocarServicio(SERVICIO_TIPO_CARTAS, {}, funcionSuccess, funcionError);
}

/**
 * Función obtiene la lista de cartas correspondiente a un tipo de template.
 * @param params es un objeto que debe tener las siguientes propiedades:
 *   id: id del tipo de carta
 * @param funcionSuccess función que se invocará cuando se haya realizado una petición
 *   satisfactoria con los parámetros function(response, textStatus, jqXHR);
 * @param funcionError función que se invocará cuando se haya realizado una petición
 *   insatisfactoria con los parámetros function(jqXHR, textStatus, errorThrown);
 **/
function obtenerCartasPorId(params, funcionSuccess, funcionError) {
	invocarServicio(SERVICIO_CARTAS, params, funcionSuccess, funcionError);
}

/**
 * Función filtra una lista de ids de facebook y regresa los usuarios que estén
 * registrados en el servidor.
 * @param params es un objeto que debe tener las siguientes propiedades:
 *   facebook_ids: ids separados por coma. Ej: "1234,1235,1236"
 * @param funcionSuccess función que se invocará cuando se haya realizado una petición
 *   satisfactoria con los parámetros function(response, textStatus, jqXHR);
 * @param funcionError función que se invocará cuando se haya realizado una petición
 *   insatisfactoria con los parámetros function(jqXHR, textStatus, errorThrown);
 **/
function obtenerAmigosJugando(params, funcionSuccess, funcionError) {
	invocarServicio(SERVICIO_AMIGOS_JUGANDO, params, funcionSuccess, funcionError);
}

/**
 * Función que crea un nuevo juego en la base de datos.
 * @param params es un objeto que debe tener las siguientes propiedades:
 *   user_id: El id del usuario creando el juego
 *   detail_xml: El xml del tablero
 *   card_id: El id de la tarjeta seleccionada
 *   opponent_id: El facebook_id del oponente
 *   opponent_name: El first name del oponente
 * @param funcionSuccess función que se invocará cuando se haya realizado una petición
 *   satisfactoria con los parámetros function(response, textStatus, jqXHR);
 * @param funcionError función que se invocará cuando se haya realizado una petición
 *   insatisfactoria con los parámetros function(jqXHR, textStatus, errorThrown);
 **/
function crearJuego(params, funcionSuccess, funcionError) {
	invocarServicio(SERVICIO_CREAR_JUEGO, params, funcionSuccess, funcionError);
}

/**
 * Función que acepta un nuevo juego y empieza el juego.
 * @param params es un objeto que debe tener las siguientes propiedades:
 *   id: El id del juego
 *   card_id: El id de la tarjeta seleccionada
 *   card_type: El tipo de la tarjeta seleccionada
 *   card_facebook_id: El id de facebook de la tarjeta seleccionada
 *   card_name: El nombre de la tarjeta seleccionada
 * @param funcionSuccess función que se invocará cuando se haya realizado una petición
 *   satisfactoria con los parámetros function(response, textStatus, jqXHR);
 * @param funcionError función que se invocará cuando se haya realizado una petición
 *   insatisfactoria con los parámetros function(jqXHR, textStatus, errorThrown);
 **/
function aceptarJuego(params, funcionSuccess, funcionError) {
	invocarServicio(SERVICIO_ACEPTAR_JUEGO, params, funcionSuccess, funcionError);
}