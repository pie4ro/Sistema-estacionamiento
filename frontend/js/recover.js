const recoverForm = document.getElementById("recoverForm");

if (recoverForm) {
  recoverForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("recover-email").value.trim();

    if (!email) {
      alert("Por favor ingresa tu correo electrónico.");
      return;
    }

    // Usando el método de Supabase Auth para restablecer contraseña
    const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/update_password.html", // Página a donde llegará el usuario tras hacer clic en el correo
    });

    if (error) {
      alert("Error al enviar el correo de recuperación: " + error.message);
      return;
    }

    alert("Se han enviado las instrucciones a tu correo electrónico.");
    window.location.href = "index.html";
  });
}