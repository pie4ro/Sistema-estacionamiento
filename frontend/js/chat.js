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
    await cargarUsuarios();
}

async function cargarUsuarios() {
    const lista = document.getElementById("listaUsuarios");
    if (!lista) return;

    // Consultamos los clientes excluyendo al usuario logueado actual
    const { data: usuarios, error } = await supabaseClient
        .from("clientes")
        .select("id, nombre_completo, foto_url, rol")
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
        // Cambiado a "chat-user" para que coincida perfectamente con el chat.css
        div.className = "chat-user";

        div.innerHTML = `
            <img src="${usuario.foto_url || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}" alt="Avatar">
            <div style="overflow: hidden;">
                <span style="font-weight: 600; display: block; font-size: 14px; color: #111827; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${usuario.nombre_completo || "Sin nombre"}</span>
                <small style="color: #6b7280; font-size: 12px; text-transform: capitalize;">${usuario.rol || 'cliente'}</small>
            </div>
        `;

        div.onclick = () => {
            // Remover la clase active de todos y ponérsela al seleccionado
            document.querySelectorAll(".chat-user").forEach(el => el.classList.remove("active"));
            div.classList.add("active");
            abrirChat(usuario);
        };

        lista.appendChild(div);
    });
}

async function abrirChat(usuario) {
    usuarioSeleccionado = usuario;

    const chatNombre = document.getElementById("chatNombre");
    const chatEstado = document.getElementById("chatEstado");
    const chatFoto = document.getElementById("chatFoto");

    if (chatNombre) chatNombre.textContent = usuario.nombre_completo;
    if (chatEstado) chatEstado.textContent = "En línea";
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
            // Coincide con las clases msg-right y msg-left de tu chat.css
            div.className = m.emisor === usuarioActual.id ? "msg-right" : "msg-left";
            div.textContent = m.mensaje;
            contenedor.appendChild(div);
        });
    }

    contenedor.scrollTop = contenedor.scrollHeight;
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
            mensaje: texto
        });

    if (error) {
        console.error("Error al enviar mensaje:", error);
        return;
    }

    input.value = "";
    cargarMensajes();
}