document.addEventListener('DOMContentLoaded', function() {
    inicializarApp();
});

function inicializarApp() {
    cargarDatosGuardados();
    configurarBusqueda();
    configurarFiltros();
    configurarFormularios();
    configurarNavegacion();
}


// Búsqueda en tiempo Real 

function configurarBusqueda() {
    const inputBusqueda = document.getElementById('q');
    if (!inputBusqueda) return;
    
    inputBusqueda.addEventListener('input', function(e) {
        const termino = e.target.value.toLowerCase();
        const items = document.querySelectorAll('#expedientes .list .item');
        
        items.forEach(item => {
            const texto = item.textContent.toLowerCase();
            item.style.display = texto.includes(termino) ? 'flex' : 'none';
        });
    });
}

// Filtrado por Estado

function configurarFiltros() {
    const selectFiltro = document.getElementById('filtro');
    if (!selectFiltro) return;
    
    selectFiltro.addEventListener('change', function(e) {
        const filtro = e.target.value.toLowerCase();
        const items = document.querySelectorAll('#expedientes .list .item');
        
        items.forEach(item => {
            const tag = item.querySelector('.tag');
            if (!tag) return;
            const estado = tag.textContent.toLowerCase();
            
            if (filtro === 'todos' || estado.includes(filtro)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
}


// Control de Formularios y Sincronización

function configurarFormularios() {
    // Login
    const btnEntrar = document.getElementById('btnEntrar');
    if (btnEntrar) {
        btnEntrar.addEventListener('click', function(e) {
            const dni = document.getElementById('dni');
            const pin = document.getElementById('pin');
            
            if (!dni.value || !pin.value) {
                e.preventDefault();
                mostrarNotificacion('Por favor, completa todos los campos', 'warn');
            } else {
                guardarSesion(dni.value);
                mostrarNotificacion('¡Bienvenido a FacilGest!', 'ok');
            }
        });
    }
    
    // Validación Paso 1
    const btnContinuar1 = document.getElementById('btnContinuar1');
    if (btnContinuar1) {
        btnContinuar1.addEventListener('click', function(e) {
            const motivo = document.getElementById('motivo');
            if (!motivo.value) {
                e.preventDefault();
                mostrarNotificacion('El motivo del trámite es obligatorio', 'warn');
                motivo.style.borderColor = '#ff7a7a';
                setTimeout(() => motivo.style.borderColor = '', 2000);
            } else {
                const tipo = document.getElementById('tipo').value;
                document.getElementById('resumenTramite').textContent = tipo.split(' ')[2] || tipo;
            }
        });
    }

    // Interceptación de botones "Guardar borrador"
    document.getElementById('btnBorrador1')?.addEventListener('click', function(e) { e.preventDefault(); guardarBorradorActual(1); });
    document.getElementById('btnBorrador2')?.addEventListener('click', function(e) { e.preventDefault(); guardarBorradorActual(2); });

    // Enviar solicitud y limpieza de borrador
    document.getElementById('btnEnviar')?.addEventListener('click', function() {
        localStorage.removeItem('facilgest_borradores'); // Borrar borrador al enviar
        document.getElementById('fechaRegistro').textContent = new Date().toLocaleDateString('es-ES');
        mostrarNotificacion('¡Solicitud registrada formalmente!', 'ok');
    });
}

// Motor de Persistencia (Web Storage API)

function guardarSesion(usuario) {
    localStorage.setItem('facilgest_usuario', usuario);
    localStorage.setItem('facilgest_sesion', Date.now());
    
    const elementoUsuario = document.querySelector('.hello');
    if (elementoUsuario) elementoUsuario.textContent = `Hola, ${usuario}`;
}

function guardarBorradorActual(pasoActivo) {
    let datos = {};
    const idTramite = 'solicitud_activa';

    if (pasoActivo === 1) {
        const tipo = document.getElementById('tipo').value;
        const motivo = document.getElementById('motivo').value;
        datos = { tipo, motivo, paso: 1 };
    } else if (pasoActivo === 2) {
        const tipo = document.getElementById('tipo').value;
        const motivo = document.getElementById('motivo').value;
        const doc = document.getElementById('doc').value;
        const obs = document.getElementById('obs').value;
        datos = { tipo, motivo, documento: doc, observaciones: obs, paso: 2 };
    }

    const borradores = JSON.parse(localStorage.getItem('facilgest_borradores') || '{}');
    borradores[idTramite] = {
        ...datos,
        fecha: new Date().toLocaleDateString('es-ES')
    };
    
    localStorage.setItem('facilgest_borradores', JSON.stringify(borradores));
    mostrarNotificacion('Borrador guardado en localStorage ✓', 'ok');
    
    actualizarListaBorradoresUI(borradores);
    
    setTimeout(() => { window.location.hash = '#borradores'; }, 300);
}

function cargarDatosGuardados() {
    const usuario = localStorage.getItem('facilgest_usuario');
    if (usuario) {
        const elementoUsuario = document.querySelector('.hello');
        if (elementoUsuario) elementoUsuario.textContent = `Hola, ${usuario}`;
    }
    
    const borradores = JSON.parse(localStorage.getItem('facilgest_borradores') || '{}');
    actualizarListaBorradoresUI(borradores);
}

function actualizarListaBorradoresUI(borradores) {
    const contenedorLista = document.querySelector('#borradores .list');
    if (!contenedorLista) return;

    if (borradores['solicitud_activa']) {
        const b = borradores['solicitud_activa'];
        contenedorLista.innerHTML = `
            <a class="item" href="#tramite-${b.paso}" id="borradorActivo">
                <div>
                    <h3>${b.tipo || 'Certificado'} — Borrador Real</h3>
                    <p>Guardado: ${b.fecha} · Paso ${b.paso}</p>
                </div>
                <div class="right"><span class="tag ok">Continuar</span></div>
            </a>
        `;

        document.getElementById('borradorActivo').addEventListener('click', function() {
            setTimeout(() => {
                if (b.tipo) document.getElementById('tipo').value = b.tipo;
                if (b.motivo) document.getElementById('motivo').value = b.motivo;
                if (b.documento && document.getElementById('doc')) document.getElementById('doc').value = b.documento;
                if (b.observaciones && document.getElementById('obs')) document.getElementById('obs').value = b.observaciones;
                mostrarNotificacion('Datos recuperados correctamente ✓', 'ok');
            }, 150);
        });
    } else {
        contenedorLista.innerHTML = `
            <div class="item" role="article">
                <div>
                  <h3>No hay borradores guardados</h3>
                  <p>Usa "Guardar borrador" dentro del asistente técnico.</p>
                </div>
            </div>
        `;
    }
}

// Feedback Dinámico y Navegación
function mostrarNotificacion(mensaje, tipo = 'ok') {
    const antigua = document.querySelector('.notificacion');
    if (antigua) antigua.remove();

    const notif = document.createElement('div');
    notif.className = `notificacion ${tipo}`;
    notif.textContent = mensaje;
    
    notif.style.cssText = `
        position: fixed; top: 30px; left: 50%; transform: translateX(-50%);
        padding: 12px 20px; border-radius: 12px; font-size: 13px; font-weight: 600;
        z-index: 9999; box-shadow: 0 8px 20px rgba(0,0,0,0.4);
        background: ${tipo === 'ok' ? '#7ee2a8' : '#ffd27a'}; color: #071021;
    `;
    
    document.body.appendChild(notif);
    setTimeout(() => { notif.remove(); }, 2500);
}

function configurarNavegacion() {
    window.addEventListener('hashchange', function() {
        const screen = document.querySelector('.screen:target');
        if (screen) {
            screen.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
}