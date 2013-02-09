/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

/** Variables para Javascript **/
var paginaIndex = "index.html";
var paginaPrincipal = "default.html";
var paginaSinConexion = "sinConexion.html";
var templateDashboard = "dashboard.html";
var templateTablero = "juegoNuevoTablero.html";

var appId = "336541486458847";
var sistemaOperativo = "iOS"; //iOS
// var sistemaOperativo = "iOS"; //Android
var agente = navigator.userAgent;

/** Inicializa listeners para eventos **/
document.addEventListener("offline", redirigirSinConexion, false);
document.addEventListener("deviceready", init, false);

/** Función que mustra la página sin conexión. **/
function redirigirSinConexion() {
	redirigir(paginaSinConexion);
}

/** Funciones para FB **/
function init() {
	var networkState = navigator.network.connection.type;
	if (networkState == Connection.NONE || networkState == Connection.UNKNOWN) {
		mostrarSinConexion();
	} else {
		FB.init({ appId: appId, nativeInterface: CDV.FB, useCachedDialogs: false });
		FB.getLoginStatus(
			function (response) {
				if (response.status == 'connected') {
					if (!isCache('idUsuario')) {
						FB.api('/me', function (me) {
							if (me.id) {
								setCache('usuario', me);
							}
							checkPermissions();
						});
					} else {
						checkPermissions();
					}
				} else {
					mostrarConectar();
				}
			});
	}
}

function checkPermissions() {
	FB.api('/me/permissions',
		function (response) {
			var error = false;
			var perms = false;
			if (response.error) {
				error = true;
			} else {
				perms = response.data[0];
			}
			if (!(perms && perms.read_stream && perms.publish_stream)) {
				error = true;
			}
			
			if (error) {
				mostrarConectar();
			} else {
				iniciarProceso();
			}
		});
}

function iniciarProceso() {
	// Sobreescribir con las acciones a seguir una vez cargada la página.
}

function mostrarConectar() {
	// Sobreescribir con las acciones a seguir cuando se desee mostrar el botón de 'conectar con FB'.
	redirigir(paginaIndex);
}

function login() {
	FB.login(
		function (response) {
			if (response.authResponse) {
				removeCache('usuario');
				redirigir(paginaPrincipal);
			} else {
				alert("Tienes que conectar la aplicación a Facebook para poder continuar.");
			}
		},
		{ scope: "read_stream,publish_stream"}
	);
}

/** Funciones generales **/
function inicio() {
	abrirTemplate(templateDashboard);
}

function refrescar() {
	document.location.reload(true); //iOS
	
	// pagina = window.location.href.substring(window.location.href.lastIndexOf('/')); //Android
	// navigator.app.loadUrl("file:///android_asset/www" + pagina); //Android
}

function redirigir(pagina) {
	var paginaQS = '';
	if (pagina.indexOf('?') > 0) {
		paginaQS = pagina.substring(pagina.indexOf('?'));
		pagina = pagina.substring(0, pagina.indexOf('?'));
	} else {
		paginaQS = '?';
	}
	setCache('qs', paginaQS);
	
	window.location = pagina; //iOS
	// navigator.app.loadUrl("file:///android_asset/www/" + pagina); //Android
}

function obtenerParametro(name) {
	if (isCache('qs')) {
		qs = getCache('qs');
	} else {
		setCache('qs', '?');
		qs = '?';
	}
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(qs);
	if (results === null) {
		return "";
	} else {
		return decodeURIComponent(results[1].replace(/\+/g, " "));
	}
}

function limitaTexto(cadena, longitud) {
	var resultado = cadena;
	if (cadena.length > longitud) {
		resultado = cadena.substring(0, longitud) + '...';
	}
	return resultado;
}

function abrirTemplate(template) {
	$('#content_load').load(template).hide().fadeIn('slow');
}

/** Funciones para cache **/
function setCache(key, value) {
	window.localStorage.setItem(key, JSON.stringify(value));
}

function getCache(key) {
	return JSON.parse(window.localStorage.getItem(key));
}

function isCache(key) {
	return window.localStorage.getItem(key) !== null;
}

function removeCache(key) {
	window.localStorage.removeItem(key);
}

function clearCache() {
	if (!isCache('aj_notificacion')) {
		setCache('aj_notificacion', true);
	}
	if (!isCache('aj_post')) {
		setCache('aj_post', true);
	}
	if (!isCache('aj_sonido')) {
		setCache('aj_sonido', true);
	}

	removeCache('usuario');
	removeCache('amigos');
	removeCache('partidas');
	
	removeCache('nuevo_oponente');
}

/** Funciones para Nueva Partida **/
function updateArrayAmigos(amigosFB) {
    amigos = new Array();
                          
    for (var i=0; i <amigosFB.length; i++) {
        amigos.push({"id":amigosFB[i].uid, "nombre":amigosFB[i].name, "ruta": "http://graph.facebook.com/" + amigosFB[i].uid + "/picture?width=250&height=250"});
    }
    
    return amigos;
}

function obtenPrimerNombre(nombre) {
	if (nombre.indexOf(' ') > 0) {
		return nombre.substring(0, nombre.indexOf(' '));
	}
	return nombre;
}

function getGridOponentes() {
    var html = '';
    var amigos = getCache('amigos');
    
    var primeraLetra = '';
    for (var i = 0; i < amigos.length; i++) {
    	if (amigos[i].nombre.charAt(0).toUpperCase() != primeraLetra) {
    		primeraLetra = amigos[i].nombre.charAt(0).toUpperCase();
    		html += '<div id="letra_' + primeraLetra + '" class="carta cartaTablero cartaShortcut" onclick="mostrarShortcut(\'letra_' + primeraLetra + '\');"><span class="letra">' + primeraLetra + '</span></div>';
    	}
        // html += '<div id="' + amigos[i].id + '" class="carta cartaTablero cartaOponente" posicion="' + i + '" onclick="seleccionarOponente(' + i + ')"><img id="thumb_loading_' + i + '" class="thumb_loading" src="img/loading.gif" /><img id="thumb_' + i + '" id_loader="thumb_loading_' + i + '" class="thumb" src="' + amigos[i].ruta + '"/><span class="nombre">' + limitaTexto(obtenPrimerNombre(amigos[i].nombre), 10) + '</span></div>';
        html += obtieneCarta(amigos[i], i, 'seleccionarOponente(' + i + ')', 'cartaOponente');
    }
                          
    return html;
}

function obtieneCarta(elemento, posicion, onclick, clases) {
	if (onclick === undefined) {
		onclick = '';
	}
	if (clases === undefined) {
		clases = '';
	}
	return '<div id="' + elemento.id + '" class="carta cartaTablero ' + clases + '" posicion="' + posicion + '" onclick="' + onclick + '"><div class="front"><img id="thumb_loading_' + posicion + '" class="thumb_loading" src="img/loading.gif" /><img id="thumb_' + posicion + '" id_loader="thumb_loading_' + posicion + '" class="thumb" src="' + elemento.ruta + '"/><span class="nombre">' + limitaTexto(obtenPrimerNombre(elemento.nombre), 10) + '</span></div><div class="back"><img src="img/ju_carta_logo.png"/></div></div>';
}

var mostrandoSC = false;
function mostrarShortcut(idLetra) {
	mostrandoSC = !mostrandoSC;
	if (mostrandoSC) {
		$('.cartaOponente').hide();
		$('#' + idLetra).parent().scrollTop(0);
	} else {
		$('.cartaOponente').show();
		recorrerShortcut(idLetra);
	}
}

function recorrerShortcut(idLetra) {
	$('#' + idLetra).parent().scrollTop($('#' + idLetra).position().top);
}

function loaderCartas() {
	// Loader mientras cargan las cartas
	$('.thumb').load(function(event) {
		$('#' + $(event.target).attr('id_loader')).hide();
	});
}

function seleccionarTablero(tipoTablero) {
    if (!tipoTablero) {
        tipoTablero = 'personajes';
    }
    setCache('tipoTablero', tipoTablero);
	abrirTemplate(templateTablero);
}

function crearOponentes(contenedor) {
	FB.api('fql',
		{ q : "SELECT uid, name, pic_square FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = me()) ORDER BY name asc"},
		function(response) {
			if (response.data !== undefined) {
				amigos = updateArrayAmigos(response.data);
                setCache('amigos', amigos);
                contenedor.html(getGridOponentes());
                loaderCartas();
			} else {
				alert("No se pudo obtener la lista de tus amigos. Por favor intenta hacer un evento nuevamente.");
				inicio();
			}
		}
	);
}


/** ALERTAS **/
var funciones;

var ALERTA_OK = 'OK';
var ALERTA_SI_NO = 'SI_NO';
var ALERTA_NUEVO_JUEGO = 'NUEVO_JUEGO';
var ALERTA_INPUT = 'INPUT';

function alert(texto, tipo, acciones) {
	if (texto === undefined) {
		texto = '';
	}
	if (tipo === undefined) {
		tipo = ALERTA_OK;
	}
	if (acciones === undefined) {
		acciones = new Array();
	}
	
	$('.alerta[tipo="' + tipo + '"]').children('.alerta_mensaje').html(texto);
	funciones = acciones;
	
	$('.alerta[tipo="' + tipo + '"]').show();
	$('#alertas').fadeIn('fast');
	
	// navigator.notification.alert(texto, null, 'AdivinaMe'); // Alert original
}

function cerrarAlert() {
	$('#alertas').fadeOut('fast');
	$('.alerta').hide();
}

function ejecutaFuncion(nombre) {
	if (funciones[nombre]) {
		funciones[nombre]();
	}
	cerrarAlert();
}


/** Funciones de sonido **/
function createAudio(name) {
    var src;
    switch(name) {
        case 'card_flip':
            src = 'audio/card_flip.wav';
            break;
        default:
            break;         
    }
	      
    // Create Media object from src
    my_media = new Media(src, function(){}, function(){});
                          
    return my_media;        
}