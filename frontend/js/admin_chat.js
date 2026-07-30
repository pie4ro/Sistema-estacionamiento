let adminActual = null;
let clienteSeleccionado = null;
let todosLosClientes = [];

document.addEventListener("DOMContentLoaded", () => {
    iniciarAdminChat();
});

async function iniciarAdminChat() {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data.user) {
        window.location.href = "../index.html";
        return;
    }

    adminActual = data.user;

    await actualizarUltimaConexionAdmin();
    setInterval(actualizarUltimaConexionAdmin, 60000);

    await cargarClientesAdmin();
    suscripcionRealtimeMensajesAdmin();

    // Configurar buscador en tiempo real
    const inputBuscar = document.getElementById("buscarClienteChat");
    if (inputBuscar) {
        inputBuscar.addEventListener("input", (e) => {
            const texto = e.target.value.toLowerCase();
            const clientesFiltrados = todosLosClientes.filter(c => 
                (c.nombre_completo && c.nombre_completo.toLowerCase().includes(texto)) ||
                (c.correo && c.correo.toLowerCase().includes(texto))
            );
            renderizarListaClientes(clientesFiltrados);
        });
    }

    const btnEnviar = document.getElementById("btnEnviarAdmin");
    if (btnEnviar) {
        btnEnviar.addEventListener("click", enviarMensajeAdmin);
    }

    const txtMensaje = document.getElementById("txtMensajeAdmin");
    if (txtMensaje) {
        txtMensaje.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                enviarMensajeAdmin();
            }
        });
    }

    // Verificar si viene un cliente seleccionado por URL desde el panel de clientes
    const urlParams = new URLSearchParams(window.location.search);
    const clienteIdUrl = urlParams.get('cliente_id');

    if (clienteIdUrl && todosLosClientes.length > 0) {
        const clienteEncontrado = todosLosClientes.find(c => c.id === clienteIdUrl);
        if (clienteEncontrado) {
            abrirChatAdmin(clienteEncontrado);
            
            // Resaltar visualmente al cliente en la lista lateral
            setTimeout(() => {
                const items = document.querySelectorAll(".chat-user");
                items.forEach(item => {
                    if (item.innerHTML.includes(clienteEncontrado.nombre_completo)) {
                        item.classList.add("active");
                    }
                });
            }, 100);
        }
    }
}

async function actualizarUltimaConexionAdmin() {
    if (!adminActual) return;
    await supabaseClient
        .from("clientes")
        .update({ ultima_conexion: new Date() })
        .eq("id", adminActual.id);
}

async function cargarClientesAdmin() {
    const { data: usuarios, error } = await supabaseClient
        .from("clientes")
        .select("id, nombre_completo, foto_url, rol, ultima_conexion, correo")
        .neq("id", adminActual.id)
        .order("nombre_completo", { ascending: true });

    if (error) {
        console.error("Error al cargar clientes:", error);
        return;
    }

    todosLosClientes = usuarios || [];
    renderizarListaClientes(todosLosClientes);
}

async function renderizarListaClientes(usuarios) {
    const lista = document.getElementById("listaClientesChat");
    if (!lista) return;

    lista.innerHTML = "";

    if (!usuarios || usuarios.length === 0) {
        lista.innerHTML = `<p style="padding: 15px; color: #9ca3af; font-size: 13px; text-align: center;">No se encontraron clientes.</p>`;
        return;
    }

    // Obtener los mensajes no leídos dirigidos al administrador actual
    const { data: mensajesNoLeidos } = await supabaseClient
        .from("mensajes")
        .select("emisor")
        .eq("receptor", adminActual.id)
        .eq("leido", false);

    // Contar cuántos mensajes sin leer tiene cada cliente
    const conteoNoLeidos = {};
    if (mensajesNoLeidos) {
        mensajesNoLeidos.forEach(m => {
            conteoNoLeidos[m.emisor] = (conteoNoLeidos[m.emisor] || 0) + 1;
        });
    }

    usuarios.forEach(usuario => {
        const div = document.createElement("div");
        div.className = "chat-user";

        const ultimaConexion = usuario.ultima_conexion ? new Date(usuario.ultima_conexion) : null;
        const ahora = new Date();
        const estaEnLinea = ultimaConexion && (ahora - ultimaConexion < 120000);

        // Ver si este usuario tiene mensajes pendientes
        const tieneNuevos = conteoNoLeidos[usuario.id] > 0;

        div.innerHTML = `
            <div style="position: relative; display: flex; align-items: center;">
                <img src="${usuario.foto_url || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}" alt="Avatar" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover; flex-shrink: 0;">
                <span style="position: absolute; bottom: 0; right: 0; width: 10px; height: 10px; background-color: ${estaEnLinea ? '#10b981' : '#9ca3af'}; border: 2px solid white; border-radius: 50%;"></span>
                
                ${tieneNuevos ? `<span style="position: absolute; top: -2px; right: -2px; width: 12px; height: 12px; background-color: #3b82f6; border: 2px solid white; border-radius: 50%;"></span>` : ''}
            </div>
            <div style="overflow: hidden; flex: 1; margin-left: 10px;">
                <span style="font-weight: 600; display: block; font-size: 14px; color: #111827; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${usuario.nombre_completo || "Sin nombre"}</span>
                <small style="color: ${estaEnLinea ? '#059669' : '#6b7280'}; font-size: 11px;">
                    ${estaEnLinea ? 'En línea' : 'Desconectado'}
                </small>
            </div>
        `;

        div.onclick = () => {
            document.querySelectorAll(".chat-user").forEach(el => el.classList.remove("active"));
            div.classList.add("active");
            abrirChatAdmin(usuario);
        };

        lista.appendChild(div);
    });
}

function suscripcionRealtimeMensajesAdmin() {
    supabaseClient
        .channel('public:mensajes_admin')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes' }, payload => {
            if (clienteSeleccionado && (payload.new.emisor === clienteSeleccionado.id || payload.new.receptor === clienteSeleccionado.id)) {
                cargarMensajesAdmin();
            }
        })
        .subscribe();
}

async function abrirChatAdmin(usuario) {
    clienteSeleccionado = usuario;

    const chatHeader = document.getElementById("chatHeader");
    if (chatHeader) {
        const ultimaConexion = usuario.ultima_conexion ? new Date(usuario.ultima_conexion) : null;
        const ahora = new Date();
        const estaEnLinea = ultimaConexion && (ahora - ultimaConexion < 120000);

        chatHeader.innerHTML = `
            <img src="${usuario.foto_url || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}" alt="Foto" style="width: 52px; height: 52px; border-radius: 50%; object-fit: cover;">
            <div>
                <h2 style="font-size: 18px; color: #111827; margin: 0;">${usuario.nombre_completo}</h2>
                <small style="color: ${estaEnLinea ? '#059669' : '#6b7280'}; font-size: 13px;">${estaEnLinea ? 'En línea' : 'Desconectado'}</small>
            </div>
        `;
    }

    cargarMensajesAdmin();
}

async function cargarMensajesAdmin() {
    if (!clienteSeleccionado || !adminActual) return;

    const { data, error } = await supabaseClient
        .from("mensajes")
        .select("*")
        .or(
            `and(emisor.eq.${adminActual.id},receptor.eq.${clienteSeleccionado.id}),and(emisor.eq.${clienteSeleccionado.id},receptor.eq.${adminActual.id})`
        )
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error al cargar mensajes del admin:", error);
        return;
    }

    const contenedor = document.getElementById("mensajesAdmin");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (data) {
        data.forEach(m => {
            const div = document.createElement("div");
            div.className = m.emisor === adminActual.id ? "msg-right" : "msg-left";
            div.textContent = m.mensaje;
            contenedor.appendChild(div);
        });
    }

    contenedor.scrollTop = contenedor.scrollHeight;

    await supabaseClient
        .from("mensajes")
        .update({ leido: true })
        .eq("emisor", clienteSeleccionado.id)
        .eq("receptor", adminActual.id)
        .eq("leido", false);
}

async function enviarMensajeAdmin() {
    if (!clienteSeleccionado || !adminActual) return;

    const input = document.getElementById("txtMensajeAdmin");
    if (!input) return;

    const texto = input.value.trim();
    if (texto === "") return;

    const { error } = await supabaseClient
        .from("mensajes")
        .insert({
            emisor: adminActual.id,
            receptor: clienteSeleccionado.id,
            mensaje: texto
        });

    if (error) {
        console.error("Error al enviar mensaje:", error);
        return;
    }

    input.value = "";
    cargarMensajesAdmin();
}