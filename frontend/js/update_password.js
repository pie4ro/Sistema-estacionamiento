const updatePasswordForm = document.getElementById("updatePasswordForm");

if (updatePasswordForm) {
  updatePasswordForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const newPassword = document.getElementById("new-password").value.trim();

    if (!newPassword || newPassword.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    // Supabase detecta automáticamente la sesión activa mediante el token que viene en la URL del correo
    const { data, error } = await supabaseClient.auth.updateUser({
      password: newPassword
    });

    if (error) {
      alert("Error al actualizar la contraseña: " + error.message);
      return;
    }

    alert("¡Contraseña actualizada con éxito! Ahora puedes iniciar sesión.");
    window.location.href = "index.html";
  });
}