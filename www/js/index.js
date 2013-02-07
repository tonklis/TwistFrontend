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
var templateDashboard = "dashboard.html"

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

function alert(texto) {
	navigator.notification.alert(texto, null, 'Calchupadora');
}

function abrirTemplate(template) {
	$('#content').load(template);
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
	removeCache('usuario');
	removeCache('partidas');
}