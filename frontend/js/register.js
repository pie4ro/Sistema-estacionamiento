const registerForm = document.getElementById("registerForm");

if (registerForm) {
    const registerRole = document.getElementById("registerRole");
    const plateBox = document.getElementById("plateBox");
    const dniBox = document.getElementById("dniBox");
    const phoneBox = document.getElementById("phoneBox");
    const plateInput = document.getElementById("plate");
    const carColorBox = document.getElementById("carColorBox");
    const carColorInput = document.getElementById("carColor");
    const dniInput = document.getElementById("dni");
    const phoneInput = document.getElementById("phone");
    const adminCodeBox = document.getElementById("adminCodeBox");
const adminCodeInput = document.getElementById("adminCode");

  if (registerRole && plateBox && dniBox && phoneBox && plateInput && dniInput && phoneInput) {
    registerRole.addEventListener("change", function () {
      if (registerRole.value === "administrador") {
        dniBox.style.display = "none";
        phoneBox.style.display = "none";
        plateBox.style.display = "none";
        carColorBox.style.display = "none";
        adminCodeBox.style.display = "block";

        dniInput.value = "";
        phoneInput.value = "";
        plateInput.value = "";
        carColorInput.value = "";
      } else {
        dniBox.style.display = "block";
        phoneBox.style.display = "block";
        plateBox.style.display = "block";
        carColorBox.style.display = "block";
        adminCodeBox.style.display = "none";

        adminCodeInput.value = "";
      }
  });
}

  registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const role = document.getElementById("registerRole").value;
    const fullName = document.getElementById("fullName").value.trim();
    const dni = document.getElementById("dni").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const plate = document.getElementById("plate").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const carColor = document.getElementById("carColor")
    ? document.getElementById("carColor").value.trim()
    : "";
    const adminCode = document.getElementById("adminCode")
  ? document.getElementById("adminCode").value.trim()
  : "";

    if (!fullName || !email || !password) {
      alert("Completa nombre, correo y contraseña");
      return;
    }

    if (role === "cliente") {
      if (!dni || !phone || !plate || !carColor) {
        alert("Para cliente debes completar DNI, teléfono, placa y color del vehículo");
        return;
      }

      if (dni.length !== 8 || isNaN(dni)) {
        alert("El DNI debe tener 8 dígitos numéricos");
        return;
      }

      if (phone.length !== 9 || isNaN(phone)) {
        alert("El teléfono debe tener 9 dígitos numéricos");
        return;
      }
    }

    if (role === "administrador") {
      if (!adminCode) {
        alert("Ingresa la clave de administrador");
        return;
      }

      if (adminCode.length !== 6 || isNaN(adminCode)) {
        alert("La clave de administrador debe tener 6 dígitos numéricos");
        return;
      }

      const { data: claveValida, error: claveError } = await supabaseClient
        .rpc("verificar_clave_admin", {
          codigo_input: adminCode
        });

      if (claveError) {
        alert("Error al verificar la clave de administrador");
        console.log(claveError.message);
        return;
      }

      if (!claveValida) {
        alert("Clave de administrador incorrecta");
        return;
      }
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          nombre_completo: fullName,
          dni: dni || null,
          telefono: phone || null,
          placa: role === "cliente" ? plate : null,
          color_vehiculo: role === "cliente" ? carColor : null,
          rol: role
        }
      }
    });

    if (error) {
      alert("Error al crear cuenta: " + error.message);
      return;
    }

    const userId = data.user.id;

    const { error: clienteError } = await supabaseClient
      .from("clientes")
      .insert([
        {
          id: userId,
          nombre_completo: fullName,
          dni: dni || null,
          telefono: phone || null,
          correo: email,
          placa: role === "cliente" ? plate : null,
          color_vehiculo: role === "cliente" ? carColor : null,
          rol: role
        }
      ]);

    if (clienteError) {
      alert("Usuario creado, pero error al guardar datos: " + clienteError.message);
      return;
    }

    if (role === "administrador") {
      alert("Cuenta de administrador creada correctamente. Ahora inicia sesión.");
    } else {
      alert("Cuenta de cliente creada correctamente. Ahora inicia sesión.");
    }

    window.location.href = "index.html";
  });
}