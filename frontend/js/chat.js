const SUPABASE_URL = "https://wmguxwalpztndjlsyvoz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZ3V4d2FscHp0bmRqbHN5dm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2NjIwMDUsImV4cCI6MjA5NzIzODAwNX0.46qtK6XRESj0I5DX_eVrUaDOQEOA9lT-mQrEheqgcbY";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

let usuarioActual = null;
let usuarioSeleccionado = null;

document.addEventListener("DOMContentLoaded", () => {

    iniciarChat();

});

async function iniciarChat(){

    const {data} = await supabaseClient.auth.getUser();

    if(!data.user){

        window.location.href="../index.html";
        return;

    }

    usuarioActual=data.user;

    cargarUsuarios();

}

async function iniciarChat(){

    const {data} = await supabaseClient.auth.getUser();

    if(!data.user){

        window.location.href="../index.html";
        return;

    }

    usuarioActual=data.user;

    cargarUsuarios();

}

async function cargarUsuarios(){

    const lista=document.getElementById("listaUsuarios");

    if(!lista) return;

    const {data:usuarios,error}=await supabaseClient

    .from("clientes")

    .select("id,nombre_completo,foto_url")

    .eq("rol","cliente")

    .neq("id",usuarioActual.id)

    .order("nombre_completo");

    if(error){

        console.log(error);

        return;

    }

    lista.innerHTML="";

    usuarios.forEach(usuario=>{

        const div=document.createElement("div");

        div.className="usuario-chat";

        div.innerHTML=`

        <img src="${usuario.foto_url || 'https://cdn-icons-png.flaticon.com/512/847/847969.png'}">

        <span>${usuario.nombre_completo}</span>

        `;

        div.onclick=()=>abrirChat(usuario);

        lista.appendChild(div);

    });

}

async function abrirChat(usuario){

    usuarioSeleccionado=usuario;

    document.getElementById("chatHeader").innerHTML=

    `<h2>${usuario.nombre_completo}</h2>`;

    cargarMensajes();

}

async function cargarMensajes(){

    if(!usuarioSeleccionado) return;

    const {data}=await supabaseClient

    .from("mensajes")

    .select("*")

    .or(

`and(emisor.eq.${usuarioActual.id},receptor.eq.${usuarioSeleccionado.id}),
and(emisor.eq.${usuarioSeleccionado.id},receptor.eq.${usuarioActual.id})`

)

.order("created_at");

const contenedor=document.getElementById("mensajes");

contenedor.innerHTML="";

data.forEach(m=>{

const div=document.createElement("div");

div.className=

m.emisor===usuarioActual.id

?

"mensaje-propio"

:

"mensaje-ajeno";

div.innerHTML=`

${m.mensaje}

`;

contenedor.appendChild(div);

});

contenedor.scrollTop=contenedor.scrollHeight;

}

document

.getElementById("btnEnviar")

.addEventListener("click",enviarMensaje);

async function enviarMensaje(){

if(!usuarioSeleccionado) return;

const input=document.getElementById("txtMensaje");

const texto=input.value.trim();

if(texto=="") return;

await supabaseClient

.from("mensajes")

.insert({

emisor:usuarioActual.id,

receptor:usuarioSeleccionado.id,

mensaje:texto

});

input.value="";

}

document

.getElementById("btnEnviar")

.addEventListener("click",enviarMensaje);

async function enviarMensaje(){

if(!usuarioSeleccionado) return;

const input=document.getElementById("txtMensaje");

const texto=input.value.trim();

if(texto=="") return;

await supabaseClient

.from("mensajes")

.insert({

emisor:usuarioActual.id,

receptor:usuarioSeleccionado.id,

mensaje:texto

});

input.value="";

}



