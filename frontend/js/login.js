const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Completa tu correo y contraseña");
      return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      alert("Error al iniciar sesión: " + error.message);
      return;
    }
    
    const userId = data.user.id;

    const { data: clienteData, error: clienteError } = await supabaseClient
      .from("clientes")
      .select("rol, estado_cliente")
      .eq("id", userId)
      .single();

    if (clienteError) {
      alert("No se pudo verificar el tipo de usuario: " + clienteError.message);
      return;
    }

    if (clienteData.rol === "cliente" && clienteData.estado_cliente === "Inactivo") {
      await supabaseClient.auth.signOut();
      alert("Tu cuenta está inactiva. Comunícate con el administrador.");
      return;
    }

    alert("Inicio de sesión exitoso");

    if (clienteData.rol === "administrador") {
      window.location.href = "admin/admin_dashboard.html";
    } else {
      window.location.href = "cliente/dashboard.html";
    }
  });
}