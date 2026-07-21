const SUPABASE_URL = "https://wmguxwalpztndjlsyvoz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZ3V4d2FscHp0bmRqbHN5dm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2NjIwMDUsImV4cCI6MjA5NzIzODAwNX0.46qtK6XRESj0I5DX_eVrUaDOQEOA9lT-mQrEheqgcbY";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

let adminActual = null;
let clienteSeleccionado = null;

document.addEventListener("DOMContentLoaded", () => {
    iniciarChatAdmin();
});

async function iniciarChatAdmin() {

    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data.user) {
        window.location.href = "../index.html";
        return;
    }

    adminActual = data.user;

    verificarAdministrador();

}

async function verificarAdministrador() {

    const { data, error } = await supabaseClient
        .from("clientes")
        .select("rol")
        .eq("id", adminActual.id)
        .single();

    if (error || data.rol !== "administrador") {
        alert("Acceso denegado");
        window.location.href = "../index.html";
        return;
    }

    cargarClientes();

}

async function cargarClientes() {

    const lista = document.getElementById("listaClientesChat");

    const { data, error } = await supabaseClient
        .from("clientes")
        .select("id,nombre_completo,foto_url")
        .eq("rol", "cliente")
        .order("nombre_completo");

    if (error) {
        console.log(error);
        return;
    }

    lista.innerHTML = "";

    data.forEach(cliente => {

        const foto = cliente.foto_url
            ? cliente.foto_url
            : "https://cdn-icons-png.flaticon.com/512/847/847969.png";

        const div = document.createElement("div");

        div.className = "usuario-chat";

        div.innerHTML = `
            <img src="${foto}" class="chat-avatar">
            <span>${cliente.nombre_completo}</span>
        `;

        div.onclick = () => abrirChat(cliente);

        lista.appendChild(div);

    });

}

async function abrirChat(cliente) {

    clienteSeleccionado = cliente;

    document.getElementById("chatNombre").textContent =
        cliente.nombre_completo;

    document.getElementById("chatFoto").src =
        cliente.foto_url ||
        "https://cdn-icons-png.flaticon.com/512/847/847969.png";

    cargarMensajes();

}

async function cargarMensajes() {

    if (!clienteSeleccionado) return;

    const { data, error } = await supabaseClient
        .from("mensajes")
        .select("*")
        .or(
            `and(emisor.eq.${adminActual.id},receptor.eq.${clienteSeleccionado.id}),and(emisor.eq.${clienteSeleccionado.id},receptor.eq.${adminActual.id})`
        )
        .order("created_at");

    if (error) {
        console.log(error);
        return;
    }

    const contenedor = document.getElementById("mensajes");

    contenedor.innerHTML = "";

    data.forEach(mensaje => {

        const div = document.createElement("div");

        div.className =
            mensaje.emisor === adminActual.id
                ? "mensaje-propio"
                : "mensaje-ajeno";

        div.innerHTML = `
            <p>${mensaje.mensaje}</p>
            <small>${new Date(mensaje.created_at).toLocaleTimeString()}</small>
        `;

        contenedor.appendChild(div);

    });

    contenedor.scrollTop = contenedor.scrollHeight;

}

async function enviarMensaje() {

    if (!clienteSeleccionado) {
        alert("Selecciona un cliente.");
        return;
    }

    const input = document.getElementById("txtMensaje");

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
        console.log(error);
        return;
    }

    input.value = "";

}

document
    .getElementById("btnEnviar")
    ?.addEventListener("click", enviarMensaje);

document
    .getElementById("txtMensaje")
    ?.addEventListener("keypress", function (e) {

        if (e.key === "Enter") {
            enviarMensaje();
        }

    });

supabaseClient
    .channel("chat-admin")
    .on(
        "postgres_changes",
        {
            event: "INSERT",
            schema: "public",
            table: "mensajes"
        },
        () => {

            if (clienteSeleccionado) {
                cargarMensajes();
            }

        }
    )
    .subscribe();

