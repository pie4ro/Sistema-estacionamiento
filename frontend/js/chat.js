let usuarioActual = null;
let usuarioSeleccionado = null;

document.addEventListener("DOMContentLoaded", () => {
    iniciarChat();
});

async function iniciarChat() {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data.user) {
        window.location.href = "../index.html";
        return;
    }

    usuarioActual = data.user;

    // Actualizar estado "en línea" al entrar al chat
    await actualizarUltimaConexion();

    // Actualizar cada 60 segundos para mantener el estado activo
    setInterval(actualizarUltimaConexion, 60000);

    await cargarUsuarios();
    suscripcionRealtimeMensajes();
}

async function actualizarUltimaConexion() {
    if (!usuarioActual) return;
    await supabaseClient
        .from("clientes")
        .update({ ultima_conexion: new Date() })
        .eq("id", usuarioActual.id);
}

async function cargarUsuarios() {
    const lista = document.getElementById("listaUsuarios");
    if (!lista) return;

    const { data: usuarios, error } = await supabaseClient
        .from("clientes")
        .select("id, nombre_completo, foto_url, rol, ultima_conexion")
        .neq("id", usuarioActual.id)
        .order("nombre_completo", { ascending: true });

    if (error) {
        console.error("Error al cargar usuarios:", error);
        return;
    }

    lista.innerHTML = "";

    if (!usuarios || usuarios.length === 0) {
        lista.innerHTML = `<p style="padding: 10px; color: #6b7280; font-size: 14px;">No hay otros clientes registrados.</p>`;
        return;
    }

    usuarios.forEach(usuario => {
        const div = document.createElement("div");
        div.className = "chat-user";

        const ultimaConexion = usuario.ultima_conexion ? new Date(usuario.ultima_conexion) : null;
        const ahora = new Date();
        const estaEnLinea = ultimaConexion && (ahora - ultimaConexion < 120000); // 2 minutos

        div.innerHTML = `
            <div style="position: relative;">
                <img src="${usuario.foto_url || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}" alt="Avatar">
                <span style="position: absolute; bottom: 0; right: 0; width: 12px; height: 12px; background-color: ${estaEnLinea ? '#10b981' : '#9ca3af'}; border: 2px solid white; border-radius: 50%;"></span>
            </div>
            <div style="overflow: hidden; flex: 1;">
                <span style="font-weight: 600; display: block; font-size: 14px; color: #111827; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${usuario.nombre_completo || "Sin nombre"}</span>
                <small style="color: ${estaEnLinea ? '#059669' : '#6b7280'}; font-size: 11px;">
                    ${estaEnLinea ? 'En línea' : 'Desconectado'}
                </small>
            </div>
        `;

        div.onclick = () => {
            document.querySelectorAll(".chat-user").forEach(el => el.classList.remove("active"));
            div.classList.add("active");
            abrirChat(usuario);
        };

        lista.appendChild(div);
    });
}

function suscripcionRealtimeMensajes() {
    supabaseClient
        .channel('public:mensajes')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes' }, payload => {
            if (usuarioSeleccionado && (payload.new.emisor === usuarioSeleccionado.id || payload.new.receptor === usuarioSeleccionado.id)) {
                cargarMensajes();
            }
        })
        .subscribe();
}

async function abrirChat(usuario) {
    usuarioSeleccionado = usuario;

    const chatNombre = document.getElementById("chatNombre");
    const chatEstado = document.getElementById("chatEstado");
    const chatFoto = document.getElementById("chatFoto");

    if (chatNombre) chatNombre.textContent = usuario.nombre_completo;
    
    const ultimaConexion = usuario.ultima_conexion ? new Date(usuario.ultima_conexion) : null;
    const ahora = new Date();
    const estaEnLinea = ultimaConexion && (ahora - ultimaConexion < 120000);

    if (chatEstado) {
        chatEstado.textContent = estaEnLinea ? "En línea" : "Desconectado";
        chatEstado.style.color = estaEnLinea ? "#059669" : "#6b7280";
    }
    if (chatFoto && usuario.foto_url) chatFoto.src = usuario.foto_url;

    cargarMensajes();
}

async function cargarMensajes() {
    if (!usuarioSeleccionado || !usuarioActual) return;

    const { data, error } = await supabaseClient
        .from("mensajes")
        .select("*")
        .or(
            `and(emisor.eq.${usuarioActual.id},receptor.eq.${usuarioSeleccionado.id}),and(emisor.eq.${usuarioSeleccionado.id},receptor.eq.${usuarioActual.id})`
        )
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error al cargar mensajes:", error);
        return;
    }

    const contenedor = document.getElementById("mensajes");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (data) {
        data.forEach(m => {
            const div = document.createElement("div");
            div.className = m.emisor === usuarioActual.id ? "msg-right" : "msg-left";
            div.textContent = m.mensaje;
            contenedor.appendChild(div);
        });
    }

    contenedor.scrollTop = contenedor.scrollHeight;

    // Marcar como leídos los mensajes que este usuario recibió de la persona seleccionada
    await supabaseClient
        .from("mensajes")
        .update({ leido: true })
        .eq("emisor", usuarioSeleccionado.id)
        .eq("receptor", usuarioActual.id)
        .eq("leido", false);
}

const btnEnviar = document.getElementById("btnEnviar");
if (btnEnviar) {
    btnEnviar.addEventListener("click", enviarMensaje);
}

const txtMensaje = document.getElementById("txtMensaje");
if (txtMensaje) {
    txtMensaje.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            enviarMensaje();
        }
    });
}

async function enviarMensaje() {
    if (!usuarioSeleccionado || !usuarioActual) return;

    const input = document.getElementById("txtMensaje");
    if (!input) return;

    const texto = input.value.trim();
    if (texto === "") return;

    const { error } = await supabaseClient
        .from("mensajes")
        .insert({
            emisor: usuarioActual.id,
            receptor: usuarioSeleccionado.id,
            mensaje: texto,
            leido: false
        });

    if (error) {
        console.error("Error al enviar mensaje:", error);
        return;
    }

    input.value = "";
    cargarMensajes();
}