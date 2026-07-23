const SUPABASE_URL = "https://wmguxwalpztndjlsyvoz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZ3V4d2FscHp0bmRqbHN5dm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2NjIwMDUsImV4cCI6MjA5NzIzODAwNX0.46qtK6XRESj0I5DX_eVrUaDOQEOA9lT-mQrEheqgcbY";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", function () {

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

async function cargarDatosUsuario() {
  const { data, error } = await supabaseClient.auth.getUser();

  if (error || !data.user) {
    return;
  }

const user = data.user;

const { data: clienteData, error: clienteError } = await supabaseClient
  .from("clientes")
  .select("*")
  .eq("id", user.id)
  .single();

if (clienteError) {
  console.log(clienteError);
  return;
}

const nombre = clienteData.nombre_completo || "Cliente";
const dni = clienteData.dni || "No registrado";
const telefono = clienteData.telefono || "No registrado";
const placa = clienteData.placa || "No registrada";
const correo = clienteData.correo || user.email;

  const profilePreview = document.getElementById("profilePreview");

  if (profilePreview) {
    const defaultProfilePhoto = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  if (clienteData && clienteData.foto_url) {
    profilePreview.onerror = async function () {
      profilePreview.onerror = null;
      profilePreview.src = defaultProfilePhoto;

      await supabaseClient
        .from("clientes")
        .update({
          foto_url: null
        })
        .eq("id", user.id);
    };

    profilePreview.src = clienteData.foto_url + "?t=" + new Date().getTime();
  } else {
    profilePreview.onerror = null;
    profilePreview.src = defaultProfilePhoto;
  }
  }

  // DASHBOARD
  const clientName = document.getElementById("clientName");
  const dashboardPlate = document.getElementById("dashboardPlate");
  const dashboardStatus = document.getElementById("dashboardStatus");
  const dashboardAvailableSpaces = document.getElementById("dashboardAvailableSpaces");
  const dashboardLastAccess = document.getElementById("dashboardLastAccess");

  if (clientName) {
    clientName.textContent = nombre;
  }

  if (dashboardPlate) {
    dashboardPlate.textContent = placa;
  }

  if (dashboardStatus) {
    if (clienteData && clienteData.estado_vehiculo === "No autorizado") {
      dashboardStatus.textContent = "No autorizado";
      dashboardStatus.style.color = "#dc2626";
    } else {
      dashboardStatus.textContent = "Autorizado";
      dashboardStatus.style.color = "#16a34a";
    }
  }
  
  if (dashboardAvailableSpaces) {
  const { count: espaciosOcupados, error: espaciosError } = await supabaseClient
    .from("reservas_espacios")
    .select("*", { count: "exact", head: true });

  if (espaciosError) {
    dashboardAvailableSpaces.textContent = "Error";
  } else {
    const totalEspacios = 12;
    const disponibles = totalEspacios - espaciosOcupados;
    dashboardAvailableSpaces.textContent = `${disponibles} libres`;
  }
}

if (dashboardLastAccess) {
  const { data: ultimoHistorial, error: historialError } = await supabaseClient
    .from("historial_accesos")
    .select("hora_ingreso")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (historialError) {
    dashboardLastAccess.textContent = "Error";
  } else if (!ultimoHistorial) {
    dashboardLastAccess.textContent = "Sin registros";
  } else {
    const fecha = new Date(ultimoHistorial.hora_ingreso);

    dashboardLastAccess.textContent = fecha.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }
}

  // PERFIL
  const profileName = document.getElementById("profileName");
  const profileDni = document.getElementById("profileDni");
  const profileEmail = document.getElementById("profileEmail");
  const profilePhone = document.getElementById("profilePhone");
  const profilePlate = document.getElementById("profilePlate");

  if (profileName) {
    profileName.textContent = nombre;
  }

  if (profileDni) {
    profileDni.textContent = dni;
  }

  if (profileEmail) {
    profileEmail.textContent = correo;
  }

  if (profilePhone) {
    profilePhone.textContent = telefono;
  }

  if (profilePlate) {
    profilePlate.textContent = placa;
  }

// VEHÍCULO
const vehiclePlate = document.getElementById("vehiclePlate");
const vehicleType = document.getElementById("vehicleType");
const vehicleColor = document.getElementById("vehicleColor");
const vehicleStatus = document.getElementById("vehicleStatus");
const vehicleZone = document.getElementById("vehicleZone");
const vehicleLastAccess = document.getElementById("vehicleLastAccess");
const vehicleValidation = document.getElementById("vehicleValidation");

if (vehiclePlate) {
  vehiclePlate.textContent = clienteData?.placa || placa || "No registrada";
}

if (vehicleType) {
  vehicleType.textContent = clienteData?.tipo_vehiculo || "Automóvil";
}

if (vehicleColor) {
  vehicleColor.textContent = clienteData?.color_vehiculo || "No registrado";
}

if (vehicleStatus) {
  if (clienteData?.estado_vehiculo === "No autorizado") {
    vehicleStatus.textContent = "No autorizado";
    vehicleStatus.style.color = "#dc2626";
  } else {
    vehicleStatus.textContent = "Autorizado";
    vehicleStatus.style.color = "#16a34a";
  }
}

if (vehicleZone) {
  const { data: reservaActiva, error: reservaActivaError } = await supabaseClient
    .from("reservas_espacios")
    .select("espacio")
    .eq("user_id", user.id)
    .maybeSingle();

  if (reservaActivaError) {
    vehicleZone.textContent = "Error";
  } else if (reservaActiva) {
    vehicleZone.textContent = reservaActiva.espacio;
  } else {
    vehicleZone.textContent = "Sin espacio activo";
  }
}

if (vehicleValidation) {
  vehicleValidation.textContent = clienteData?.validacion_vehiculo || "Verificado";
}

if (vehicleLastAccess) {
  const { data: ultimoHistorial, error: historialError } = await supabaseClient
    .from("historial_accesos")
    .select("hora_ingreso")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (historialError) {
    vehicleLastAccess.textContent = "Error";
  } else if (!ultimoHistorial) {
    vehicleLastAccess.textContent = "Sin registros";
  } else {
    const fecha = new Date(ultimoHistorial.hora_ingreso);

    vehicleLastAccess.textContent = fecha.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }
}
}

cargarDatosUsuario();

const profilePhoto = document.getElementById("profilePhoto");
const profilePreview = document.getElementById("profilePreview");
const savePhotoBtn = document.getElementById("savePhotoBtn");

let selectedProfileFile = null;

if (profilePhoto && profilePreview && savePhotoBtn) {
  profilePhoto.addEventListener("change", function () {
    const file = profilePhoto.files[0];

    if (file) {
      selectedProfileFile = file;

      const reader = new FileReader();

      reader.onload = function (event) {
        profilePreview.src = event.target.result;
      };

      reader.readAsDataURL(file);

      savePhotoBtn.hidden = false;
    }
  });

  savePhotoBtn.addEventListener("click", async function () {
    if (!selectedProfileFile) {
      alert("Selecciona una foto primero");
      return;
    }

    const { data: userData, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
      alert("Debes iniciar sesión");
      return;
    }

    const userId = userData.user.id;
    const fileExt = selectedProfileFile.name.split(".").pop();
    const fileName = `${userId}/perfil-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabaseClient.storage
      .from("fotos-perfil")
      .upload(fileName, selectedProfileFile, {
        upsert: true
      });

    if (uploadError) {
      alert("Error al subir foto: " + uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabaseClient.storage
      .from("fotos-perfil")
      .getPublicUrl(fileName);

    const fotoUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabaseClient
      .from("clientes")
      .update({
        foto_url: fotoUrl
      })
      .eq("id", userId);

    if (updateError) {
      alert("La foto subió, pero no se guardó en la base de datos: " + updateError.message);
      return;
    }

    profilePreview.src = fotoUrl;
    savePhotoBtn.hidden = true;
    selectedProfileFile = null;

    alert("Foto guardada correctamente");
  });
}

const vehiclePhoto = document.getElementById("vehiclePhoto");
const vehiclePreview = document.getElementById("vehiclePreview");

if (vehiclePhoto && vehiclePreview) {
  vehiclePhoto.addEventListener("change", function () {
    const file = vehiclePhoto.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function (event) {
        vehiclePreview.src = event.target.result;
      };

      reader.readAsDataURL(file);
    }
  });
}

// EDITAR Y GUARDAR VEHÍCULO
const editVehicleBtn = document.getElementById("editVehicleBtn");
const saveVehicleBtn = document.getElementById("saveVehicleBtn");

if (editVehicleBtn && saveVehicleBtn) {
  editVehicleBtn.addEventListener("click", function () {
    const vehicleType = document.getElementById("vehicleType");
    const vehicleColor = document.getElementById("vehicleColor");

    if (vehicleType) {
      vehicleType.contentEditable = "true";
      vehicleType.classList.add("editing");
    }

    if (vehicleColor) {
      vehicleColor.contentEditable = "true";
      vehicleColor.classList.add("editing");
    }

    editVehicleBtn.hidden = true;
    saveVehicleBtn.hidden = false;
  });

  saveVehicleBtn.addEventListener("click", async function () {
    const vehicleType = document.getElementById("vehicleType");
    const vehicleColor = document.getElementById("vehicleColor");

    const tipoVehiculo = vehicleType.textContent.trim();
    const colorVehiculo = vehicleColor.textContent.trim();

    if (!tipoVehiculo || !colorVehiculo) {
      alert("Completa el tipo de vehículo y el color");
      return;
    }

    const { data: userData, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
      alert("Debes iniciar sesión");
      return;
    }

    const userId = userData.user.id;

    const { error: updateError } = await supabaseClient
      .from("clientes")
      .update({
        tipo_vehiculo: tipoVehiculo,
        color_vehiculo: colorVehiculo
      })
      .eq("id", userId);

    if (updateError) {
      alert("Error al guardar vehículo: " + updateError.message);
      return;
    }

    vehicleType.contentEditable = "false";
    vehicleColor.contentEditable = "false";

    vehicleType.classList.remove("editing");
    vehicleColor.classList.remove("editing");

    editVehicleBtn.hidden = false;
    saveVehicleBtn.hidden = true;

    alert("Datos del vehículo guardados correctamente");

    cargarDatosUsuario();
  });
}

// ESTADO DE LOS ESPACIOS DEL ESTACIONAMIENTO CON SUPABASE
const parkingSpaces = document.querySelectorAll(".parking-space");
const selectedSpaceText = document.getElementById("selectedSpace");

function actualizarResumenEspacios() {
  const availableSpacesText = document.getElementById("availableSpacesText");
  const occupiedSpacesText = document.getElementById("occupiedSpacesText");
  const dashboardAvailableSpaces = document.getElementById("dashboardAvailableSpaces");

  const totalAvailable = document.querySelectorAll(".parking-space.available").length;
  const totalOccupied = document.querySelectorAll(".parking-space.occupied, .parking-space.selected").length;

  if (availableSpacesText) {
    availableSpacesText.textContent = `${totalAvailable} libres`;
  }

  if (occupiedSpacesText) {
    occupiedSpacesText.textContent = `${totalOccupied} ocupados`;
  }

  if (dashboardAvailableSpaces) {
    dashboardAvailableSpaces.textContent = `${totalAvailable} libres`;
  }
}

async function cargarReservasEspacios() {
  if (parkingSpaces.length === 0 || !selectedSpaceText) {
    return;
  }

  const { data: userData, error: userError } = await supabaseClient.auth.getUser();

  if (userError || !userData.user) {
    window.location.href = "index.html";
    return;
  }

  const userId = userData.user.id;

  const { data: reservas, error: reservasError } = await supabaseClient
    .from("reservas_espacios")
    .select("user_id, espacio");

  if (reservasError) {
    alert("Error al cargar espacios: " + reservasError.message);
    return;
  }

  parkingSpaces.forEach(function (space) {
    const htmlStatus = space.getAttribute("data-status");

    space.classList.remove("selected");

    if (htmlStatus === "occupied") {
      space.classList.remove("available");
      space.classList.add("occupied");
      space.querySelector("small").textContent = "Ocupado";
    } else {
      space.classList.remove("occupied");
      space.classList.add("available");
      space.querySelector("small").textContent = "Libre";
    }
  });

  selectedSpaceText.textContent = "Ninguno";

  reservas.forEach(function (reserva) {
    parkingSpaces.forEach(function (space) {
      const spaceName = space.querySelector("span").textContent;

      if (spaceName === reserva.espacio) {
        space.classList.remove("available");

        if (reserva.user_id === userId) {
          space.classList.remove("occupied");
          space.classList.add("selected");
          space.querySelector("small").textContent = "Tu espacio";
          selectedSpaceText.textContent = reserva.espacio;
        } else {
          space.classList.remove("selected");
          space.classList.add("occupied");
          space.querySelector("small").textContent = "Ocupado";
        }
      }
    });
  });

  actualizarResumenEspacios();
}

if (parkingSpaces.length > 0 && selectedSpaceText) {
  cargarReservasEspacios();

  parkingSpaces.forEach(function (space) {
    space.addEventListener("click", async function () {
      const { data: userData, error: userError } = await supabaseClient.auth.getUser();

      if (userError || !userData.user) {
        alert("Debes iniciar sesión");
        window.location.href = "index.html";
        return;
      }

      const userId = userData.user.id;
      const spaceName = space.querySelector("span").textContent;

        const { data: clienteEstado, error: clienteEstadoError } = await supabaseClient
          .from("clientes")
          .select("estado_vehiculo")
          .eq("id", userId)
          .single();

        if (clienteEstadoError) {
          alert("No se pudo verificar el estado de tu vehículo");
          return;
        }

        if (clienteEstado.estado_vehiculo === "No autorizado") {
          alert("Tu vehículo no está autorizado para reservar espacios. Comunícate con el administrador.");
          return;
    }

      if (space.classList.contains("occupied")) {
        alert("Este espacio ya está ocupado por otro cliente");
        return;
      }

    if (space.classList.contains("selected")) {
      const { error: deleteError } = await supabaseClient
        .from("reservas_espacios")
        .delete()
        .eq("user_id", userId)
        .eq("espacio", spaceName);

      if (deleteError) {
        alert("Error al liberar espacio: " + deleteError.message);
        return;
      }

      await supabaseClient
        .from("historial_accesos")
        .update({
          hora_salida: new Date().toISOString(),
          estado: "Finalizado"
        })
        .eq("user_id", userId)
        .eq("espacio", spaceName)
        .eq("estado", "Dentro");

      alert("Salida registrada correctamente");
      cargarReservasEspacios();
      return;
    }

      const { data: reservaExistente, error: reservaError } = await supabaseClient
        .from("reservas_espacios")
        .select("espacio")
        .eq("user_id", userId)
        .maybeSingle();

      if (reservaError) {
        alert("Error al verificar tu reserva");
        return;
      }

      if (reservaExistente) {
        alert("Ya tienes un espacio separado. Primero libera tu espacio actual.");
        return;
      }

      const { data: clienteReserva } = await supabaseClient
      .from("clientes")
      .select("nombre_completo, placa")
      .eq("id", userId)
      .single();

      const { error: insertError } = await supabaseClient
        .from("reservas_espacios")
        .insert([
          {
            user_id: userId,
            nombre_cliente: clienteReserva ? clienteReserva.nombre_completo : null,
            espacio: spaceName,
            estado: "ocupado"
          }
        ]);

      if (insertError) {
        alert("Este espacio ya fue ocupado por otro cliente");
        cargarReservasEspacios();
        return;
      }

      const { data: clienteActual } = await supabaseClient
        .from("clientes")
        .select("placa")
        .eq("id", userId)
        .single();

      await supabaseClient
        .from("historial_accesos")
        .insert([
          {
            user_id: userId,
            nombre_cliente: clienteReserva ? clienteReserva.nombre_completo : null,
            placa: clienteReserva ? clienteReserva.placa : null,
            espacio: spaceName,
            estado: "Dentro"
          }
        ]);

      alert("Espacio separado correctamente");
      cargarReservasEspacios();
    });
  });
}

// EDITAR Y GUARDAR PERFIL
const editProfileBtn = document.getElementById("editProfileBtn");
const saveProfileBtn = document.getElementById("saveProfileBtn");

const editableProfileFields = [
  "profileName",
  "profileDni",
  "profileEmail",
  "profilePhone",
  "profilePlate"
];

if (editProfileBtn && saveProfileBtn) {
  editProfileBtn.addEventListener("click", function () {
    editableProfileFields.forEach(function (id) {
      const field = document.getElementById(id);

      if (field) {
        field.contentEditable = "true";
        field.classList.add("editing");
      }
    });

    editProfileBtn.hidden = true;
    saveProfileBtn.hidden = false;
  });

saveProfileBtn.addEventListener("click", async function () {
  const nombre = document.getElementById("profileName").textContent.trim();
  const dni = document.getElementById("profileDni").textContent.trim();
  const email = document.getElementById("profileEmail").textContent.trim();
  const phone = document.getElementById("profilePhone").textContent.trim();
  const plate = document.getElementById("profilePlate").textContent.trim();

  if (!nombre || !dni || !email || !phone || !plate) {
    alert("Completa todos los campos");
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

  if (!email.includes("@") || !email.includes(".")) {
    alert("Ingresa un correo válido");
    return;
  }

  const { data: userData, error: userError } = await supabaseClient.auth.getUser();

  if (userError || !userData.user) {
    alert("Debes iniciar sesión");
    return;
  }

  const userId = userData.user.id;

  const { error: updateError } = await supabaseClient
    .from("clientes")
    .update({
      nombre_completo: nombre,
      dni: dni,
      telefono: phone,
      correo: email,
      placa: plate
    })
    .eq("id", userId);

  if (updateError) {
    alert("Error al guardar datos: " + updateError.message);
    return;
  }

  await supabaseClient.auth.updateUser({
    data: {
      nombre_completo: nombre,
      dni: dni,
      telefono: phone,
      placa: plate
    }
  });

  editableProfileFields.forEach(function (id) {
    const field = document.getElementById(id);

    if (field) {
      field.contentEditable = "false";
      field.classList.remove("editing");
    }
  });

  editProfileBtn.hidden = false;
  saveProfileBtn.hidden = true;

  alert("Datos guardados correctamente");

  cargarDatosUsuario();
});

}

async function cargarPanelAdmin() {
  const adminTotalClientes = document.getElementById("adminTotalClientes");
  const adminTotalVehiculos = document.getElementById("adminTotalVehiculos");
  const adminEspaciosDisponibles = document.getElementById("adminEspaciosDisponibles");

  if (!adminTotalClientes && !adminTotalVehiculos && !adminEspaciosDisponibles) {
    return;
  }

  const { data: userData, error: userError } = await supabaseClient.auth.getUser();

  if (userError || !userData.user) {
    window.location.href = "../index.html";
    return;
  }

  const userId = userData.user.id;

  const { data: adminData, error: adminError } = await supabaseClient
    .from("clientes")
    .select("rol")
    .eq("id", userId)
    .single();

  if (adminError || !adminData || adminData.rol !== "administrador") {
    alert("No tienes permiso para entrar al panel administrador");
    window.location.href = "../dashboard.html";
    return;
  }

  const { count: totalClientes, error: clientesError } = await supabaseClient
    .from("clientes")
    .select("*", { count: "exact", head: true })
    .eq("rol", "cliente");

  if (adminTotalClientes) {
    if (clientesError) {
      adminTotalClientes.textContent = "Error";
      console.log(clientesError.message);
    } else {
      adminTotalClientes.textContent = `${totalClientes} clientes`;
    }
  }

  const { count: totalVehiculos, error: vehiculosError } = await supabaseClient
    .from("clientes")
    .select("*", { count: "exact", head: true })
    .eq("rol", "cliente")
    .not("placa", "is", null);

  if (adminTotalVehiculos) {
    if (vehiculosError) {
      adminTotalVehiculos.textContent = "Error";
      console.log(vehiculosError.message);
    } else {
      adminTotalVehiculos.textContent = `${totalVehiculos} vehículos`;
    }
  }

  const { count: espaciosReservados, error: espaciosError } = await supabaseClient
    .from("reservas_espacios")
    .select("*", { count: "exact", head: true });

  if (adminEspaciosDisponibles) {
    if (espaciosError) {
      adminEspaciosDisponibles.textContent = "Error";
      console.log(espaciosError.message);
    } else {
      const totalEspacios = 12;
      const espaciosLibres = totalEspacios - espaciosReservados;

      adminEspaciosDisponibles.textContent = `${espaciosLibres} libres`;
    }
  }
}

cargarPanelAdmin();

async function cargarClientesAdmin() {
  const adminClientesResumen = document.getElementById("adminClientesResumen");
  const adminClientesList = document.getElementById("adminClientesList");
  const adminBuscarCliente = document.getElementById("adminBuscarCliente");

  if (!adminClientesResumen || !adminClientesList) {
    return;
  }

  adminClientesResumen.textContent = "Cargando...";
  adminClientesList.innerHTML = "";

  const { data: userData, error: userError } = await supabaseClient.auth.getUser();

  if (userError || !userData.user) {
    alert("Debes iniciar sesión");
    window.location.href = "../index.html";
    return;
  }

  const { data: adminData, error: adminError } = await supabaseClient
    .from("clientes")
    .select("rol")
    .eq("id", userData.user.id)
    .single();

  if (adminError || !adminData || adminData.rol !== "administrador") {
    alert("No tienes permiso para ver esta página");
    window.location.href = "../dashboard.html";
    return;
  }

  const { data: clientes, error: clientesError } = await supabaseClient
    .from("clientes")
    .select("id, nombre_completo, dni, correo, telefono, placa, estado_cliente")
    .eq("rol", "cliente")
    .order("nombre_completo", { ascending: true });

  if (clientesError) {
    adminClientesResumen.textContent = "Error al cargar";
    console.log(clientesError.message);
    return;
  }

  function pintarClientes(listaClientes) {
    adminClientesList.innerHTML = "";
    adminClientesResumen.textContent = `${listaClientes.length} clientes`;

    if (listaClientes.length === 0) {
      adminClientesList.innerHTML = `
        <div class="admin-table-empty">
          No se encontraron clientes.
        </div>
      `;
      return;
    }

    listaClientes.forEach(function (cliente) {
      const row = document.createElement("div");
      row.className = "admin-table-row";

      const estadoActual = cliente.estado_cliente || "Activo";

    row.innerHTML = `
        <span>${cliente.nombre_completo || "Sin nombre"}</span>
        <span>${cliente.dni || "Sin DNI"}</span>
        <span>${cliente.correo || "Sin correo"}</span>
        <span>${cliente.telefono || "Sin teléfono"}</span>
        <span>${cliente.placa || "Sin placa"}</span>

        <select class="client-status-select" data-id="${cliente.id}">
            <option value="Activo" ${estadoActual==="Activo"?"selected":""}>Activo</option>
            <option value="Inactivo" ${estadoActual==="Inactivo"?"selected":""}>Inactivo</option>
        </select>

        <div class="admin-actions">
            <button class="btn-chat" data-id="${cliente.id}">
                💬 Chat
            </button>
        </div>
    `;

      adminClientesList.appendChild(row);

      const estadoSelect = row.querySelector(".client-status-select");
      const btnChat = row.querySelector(".btn-chat");

      btnChat.addEventListener("click", function () {
          localStorage.setItem("chatCliente", cliente.id);
          window.location.href = "admin_chat.html";
      });

      estadoSelect.addEventListener("change", async function () {
        const clienteId = estadoSelect.getAttribute("data-id");
        const nuevoEstado = estadoSelect.value;

        const { error: updateError } = await supabaseClient
          .from("clientes")
          .update({
            estado_cliente: nuevoEstado
          })
          .eq("id", clienteId);

        if (updateError) {
          alert("Error al actualizar estado del cliente: " + updateError.message);
          return;
        }

        alert("Estado del cliente actualizado");
      });
    });
  }

  pintarClientes(clientes);

  if (adminBuscarCliente) {
    adminBuscarCliente.addEventListener("input", function () {
      const texto = adminBuscarCliente.value.toLowerCase().trim();

      const clientesFiltrados = clientes.filter(function (cliente) {
        return (
          (cliente.nombre_completo || "").toLowerCase().includes(texto) ||
          (cliente.dni || "").toLowerCase().includes(texto) ||
          (cliente.correo || "").toLowerCase().includes(texto) ||
          (cliente.placa || "").toLowerCase().includes(texto)
        );
      });

      pintarClientes(clientesFiltrados);
    });
  }
}

cargarClientesAdmin();

async function cargarVehiculosAdmin() {
  const adminVehiculosResumen = document.getElementById("adminVehiculosResumen");
  const adminVehiculosList = document.getElementById("adminVehiculosList");

  if (!adminVehiculosResumen || !adminVehiculosList) {
    return;
  }

  adminVehiculosResumen.textContent = "Cargando...";
  adminVehiculosList.innerHTML = "";

  const { data: userData, error: userError } = await supabaseClient.auth.getUser();

  if (userError || !userData.user) {
    alert("Debes iniciar sesión");
    window.location.href = "index.html";
    return;
  }

  const { data: adminData, error: adminError } = await supabaseClient
    .from("clientes")
    .select("rol")
    .eq("id", userData.user.id)
    .single();

  if (adminError || !adminData || adminData.rol !== "administrador") {
    alert("No tienes permiso para ver esta página");
    window.location.href = "dashboard.html";
    return;
  }

  const { data: vehiculos, error: vehiculosError } = await supabaseClient
    .from("clientes")
    .select("id, nombre_completo, correo, telefono, placa, estado_vehiculo")
    .eq("rol", "cliente")
    .not("placa", "is", null)
    .order("nombre_completo", { ascending: true });

  if (vehiculosError) {
    adminVehiculosResumen.textContent = "Error al cargar";
    console.log(vehiculosError.message);
    return;
  }

  adminVehiculosResumen.textContent = `${vehiculos.length} vehículos`;

  if (vehiculos.length === 0) {
    adminVehiculosList.innerHTML = `
      <div class="admin-table-empty">
        No hay vehículos registrados.
      </div>
    `;
    return;
  }

  vehiculos.forEach(function (vehiculo) {
    const row = document.createElement("div");
    row.className = "admin-table-row";

const estadoActual = vehiculo.estado_vehiculo || "Autorizado";

  row.innerHTML = `
    <span>${vehiculo.placa || "Sin placa"}</span>
    <span>${vehiculo.nombre_completo || "Sin propietario"}</span>
    <span>${vehiculo.correo || "Sin correo"}</span>
    <span>${vehiculo.telefono || "Sin teléfono"}</span>

    <select class="vehicle-status-select" data-id="${vehiculo.id}">
      <option value="Autorizado" ${estadoActual === "Autorizado" ? "selected" : ""}>
        Autorizado
      </option>
      <option value="No autorizado" ${estadoActual === "No autorizado" ? "selected" : ""}>
        No autorizado
      </option>
    </select>
  `;

    adminVehiculosList.appendChild(row);

    const estadoSelect = row.querySelector(".vehicle-status-select");

    estadoSelect.addEventListener("change", async function () {
      const clienteId = estadoSelect.getAttribute("data-id");
      const nuevoEstado = estadoSelect.value;

      const { error: updateError } = await supabaseClient
        .from("clientes")
        .update({
          estado_vehiculo: nuevoEstado
        })
        .eq("id", clienteId);

      if (updateError) {
        alert("Error al actualizar estado: " + updateError.message);
        return;
      }

      alert("Estado del vehículo actualizado");
    });
  });
}

cargarVehiculosAdmin();

async function cargarHistorialCliente() {
  const historyList = document.getElementById("historyList");
  const historyTotal = document.getElementById("historyTotal");
  const historyLast = document.getElementById("historyLast");
  const historyCurrentStatus = document.getElementById("historyCurrentStatus");

  if (!historyList || !historyTotal || !historyLast) {
    return;
  }

  const { data: userData, error: userError } = await supabaseClient.auth.getUser();

  if (userError || !userData.user) {
    window.location.href = "index.html";
    return;
  }

  const userId = userData.user.id;

  const { data: historial, error: historialError } = await supabaseClient
    .from("historial_accesos")
    .select("fecha, hora_ingreso, hora_salida, placa, espacio, estado")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (historialError) {
    historyList.innerHTML = `
      <div class="history-row">
        <span>Error</span>
        <span>No se pudo cargar</span>
        <span>--</span>
        <span>--</span>
        <strong class="status-finished">Error</strong>
      </div>
    `;
    return;
  }

  historyTotal.textContent = `${historial.length} registros`;

  const registroActivo = historial.find(function (item) {
  return item.estado === "Dentro";
});

if (historyCurrentStatus) {
  if (registroActivo) {
    historyCurrentStatus.textContent = `Dentro - ${registroActivo.espacio}`;
    historyCurrentStatus.className = "status-active";
  } else {
    historyCurrentStatus.textContent = "Fuera";
    historyCurrentStatus.className = "status-finished";
  }
}

  if (historial.length === 0) {
    historyLast.textContent = "Sin ingresos";

    historyList.innerHTML = `
      <div class="history-row">
        <span>--</span>
        <span>--</span>
        <span>--</span>
        <span>Sin placa</span>
        <strong class="status-finished">Sin historial</strong>
      </div>
    `;
    return;
  }

  const ultimo = historial[0];
  historyLast.textContent = formatearHora(ultimo.hora_ingreso);

  historyList.innerHTML = "";

  historial.forEach(function (item) {
    const row = document.createElement("div");
    row.className = "history-row";

    const estadoClase = item.estado === "Dentro" ? "status-active" : "status-finished";

    row.innerHTML = `
      <span>${formatearFecha(item.fecha)}</span>
      <span>${formatearHora(item.hora_ingreso)}</span>
      <span>${item.hora_salida ? formatearHora(item.hora_salida) : "--"}</span>
      <span>${item.placa || "Sin placa"}</span>
      <span>${item.espacio || "--"}</span>
      <strong class="${estadoClase}">${item.estado || "Dentro"}</strong>
    `;

    historyList.appendChild(row);
  });
}

function formatearFecha(fecha) {
  if (!fecha) {
    return "--";
  }

  const partes = fecha.split("-");
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatearHora(fechaHora) {
  if (!fechaHora) {
    return "--";
  }

  const fecha = new Date(fechaHora);

  return fecha.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

cargarHistorialCliente();

async function cargarEspaciosAdmin() {
  const adminEspaciosLibres = document.getElementById("adminEspaciosLibres");
  const adminEspaciosOcupados = document.getElementById("adminEspaciosOcupados");
  const adminEspaciosList = document.getElementById("adminEspaciosList");

  if (!adminEspaciosLibres || !adminEspaciosOcupados || !adminEspaciosList) {
    return;
  }

  adminEspaciosLibres.textContent = "Cargando...";
  adminEspaciosOcupados.textContent = "Cargando...";
  adminEspaciosList.innerHTML = "";

  const { data: userData, error: userError } = await supabaseClient.auth.getUser();

  if (userError || !userData.user) {
    alert("Debes iniciar sesión");
    window.location.href = "../index.html";
    return;
  }

  const { data: adminData, error: adminError } = await supabaseClient
    .from("clientes")
    .select("rol")
    .eq("id", userData.user.id)
    .single();

  if (adminError || !adminData || adminData.rol !== "administrador") {
    alert("No tienes permiso para ver esta página");
    window.location.href = "../dashboard.html";
    return;
  }

  const espaciosBase = [
    { codigo: "A1", estadoBase: "Libre" },
    { codigo: "A2", estadoBase: "Libre" },
    { codigo: "A3", estadoBase: "Libre" },
    { codigo: "A4", estadoBase: "Libre" },

    { codigo: "B1", estadoBase: "Libre" },
    { codigo: "B2", estadoBase: "Libre" },
    { codigo: "B3", estadoBase: "Libre" },
    { codigo: "B4", estadoBase: "Libre" },

    { codigo: "C1", estadoBase: "Libre" },
    { codigo: "C2", estadoBase: "Libre" },
    { codigo: "C3", estadoBase: "Libre" },
    { codigo: "C4", estadoBase: "Libre" }
  ];

  const { data: reservas, error: reservasError } = await supabaseClient
    .from("reservas_espacios")
    .select("user_id, nombre_cliente, espacio, estado");

  if (reservasError) {
    adminEspaciosLibres.textContent = "Error";
    adminEspaciosOcupados.textContent = "Error";
    console.log(reservasError.message);
    return;
  }

  let totalLibres = 0;
  let totalOcupados = 0;

  espaciosBase.forEach(function (espacioBase) {
    const reserva = reservas.find(function (item) {
      return item.espacio === espacioBase.codigo;
    });

    let estadoFinal = espacioBase.estadoBase;
    let cliente = "--";
    let tipo = "Libre";
    let puedeLiberar = false;
    let userIdReserva = null;

    if (espacioBase.estadoBase === "Ocupado") {
      estadoFinal = "Ocupado";
      tipo = "Ocupado fijo";
    }

    if (reserva) {
      estadoFinal = "Ocupado";
      cliente = reserva.nombre_cliente || "Cliente sin nombre";
      tipo = "Reservado";
      puedeLiberar = true;
      userIdReserva = reserva.user_id;
    }

    if (estadoFinal === "Libre") {
      totalLibres++;
    } else {
      totalOcupados++;
    }

    const row = document.createElement("div");
    row.className = "admin-table-row";

    const estadoClase = estadoFinal === "Libre" ? "space-free-admin" : "space-occupied-admin";

    row.innerHTML = `
      <span>${espacioBase.codigo}</span>
      <span class="${estadoClase}">${estadoFinal}</span>
      <span>${cliente}</span>
      <span>${tipo}</span>
      <span>
        ${
          puedeLiberar
            ? `<button class="admin-release-space-btn" data-user="${userIdReserva}" data-space="${espacioBase.codigo}">
                Liberar
              </button>`
            : `--`
        }
      </span>
    `;

    adminEspaciosList.appendChild(row);
  });

  adminEspaciosLibres.textContent = `${totalLibres} libres`;
  adminEspaciosOcupados.textContent = `${totalOcupados} ocupados`;

  const liberarBotones = document.querySelectorAll(".admin-release-space-btn");

  liberarBotones.forEach(function (button) {
    button.addEventListener("click", async function () {
      const userIdReserva = button.getAttribute("data-user");
      const espacio = button.getAttribute("data-space");

      const confirmar = confirm(`¿Deseas liberar el espacio ${espacio}?`);

      if (!confirmar) {
        return;
      }

    const { error: deleteError } = await supabaseClient
      .from("reservas_espacios")
      .delete()
      .eq("user_id", userIdReserva)
      .eq("espacio", espacio);

    if (deleteError) {
      console.log(deleteError);
      alert("Error al liberar espacio: " + deleteError.message);
      return;
    }

    const { error: historialUpdateError } = await supabaseClient
      .from("historial_accesos")
      .update({
        hora_salida: new Date().toISOString(),
        estado: "Finalizado"
      })
      .eq("user_id", userIdReserva)
      .eq("espacio", espacio)
      .eq("estado", "Dentro");

    if (historialUpdateError) {
      console.log(historialUpdateError);
      alert("El espacio se liberó, pero no se actualizó el historial: " + historialUpdateError.message);
      return;
    }

    alert("Espacio liberado correctamente");
    cargarEspaciosAdmin();
    });
  });
}

cargarEspaciosAdmin();

async function cargarHistorialAdmin() {
  const adminHistorialTotal = document.getElementById("adminHistorialTotal");
  const adminHistorialDentro = document.getElementById("adminHistorialDentro");
  const adminHistorialFinalizados = document.getElementById("adminHistorialFinalizados");
  const adminHistorialList = document.getElementById("adminHistorialList");
  const adminBuscarHistorial = document.getElementById("adminBuscarHistorial");

  if (!adminHistorialTotal || !adminHistorialDentro || !adminHistorialFinalizados || !adminHistorialList) {
    return;
  }

  adminHistorialTotal.textContent = "Cargando...";
  adminHistorialDentro.textContent = "Cargando...";
  adminHistorialFinalizados.textContent = "Cargando...";
  adminHistorialList.innerHTML = "";

  const { data: userData, error: userError } = await supabaseClient.auth.getUser();

  if (userError || !userData.user) {
    alert("Debes iniciar sesión");
    window.location.href = "../index.html";
    return;
  }

  const { data: adminData, error: adminError } = await supabaseClient
    .from("clientes")
    .select("rol")
    .eq("id", userData.user.id)
    .single();

  if (adminError || !adminData || adminData.rol !== "administrador") {
    alert("No tienes permiso para ver esta página");
    window.location.href = "../dashboard.html";
    return;
  }

  const { data: historial, error: historialError } = await supabaseClient
    .from("historial_accesos")
    .select("nombre_cliente, placa, espacio, hora_ingreso, hora_salida, estado, created_at")
    .order("created_at", { ascending: false });

  if (historialError) {
    adminHistorialTotal.textContent = "Error";
    adminHistorialDentro.textContent = "Error";
    adminHistorialFinalizados.textContent = "Error";
    console.log(historialError.message);
    return;
  }

  function pintarHistorial(listaHistorial) {
    adminHistorialList.innerHTML = "";

    const total = listaHistorial.length;

    const dentro = listaHistorial.filter(function (item) {
      return item.estado === "Dentro";
    }).length;

    const finalizados = listaHistorial.filter(function (item) {
      return item.estado === "Finalizado";
    }).length;

    adminHistorialTotal.textContent = `${total} registros`;
    adminHistorialDentro.textContent = `${dentro} dentro`;
    adminHistorialFinalizados.textContent = `${finalizados} finalizados`;

    if (listaHistorial.length === 0) {
      adminHistorialList.innerHTML = `
        <div class="admin-table-empty">
          No se encontraron registros.
        </div>
      `;
      return;
    }

    listaHistorial.forEach(function (item) {
      const row = document.createElement("div");
      row.className = "admin-table-row";

      const estadoClase = item.estado === "Dentro"
        ? "space-free-admin"
        : "space-occupied-admin";

      row.innerHTML = `
        <span>${item.nombre_cliente || "Sin nombre"}</span>
        <span>${item.placa || "Sin placa"}</span>
        <span>${item.espacio || "--"}</span>
        <span>${formatearHora(item.hora_ingreso)}</span>
        <span>${item.hora_salida ? formatearHora(item.hora_salida) : "--"}</span>
        <span class="${estadoClase}">${item.estado || "Dentro"}</span>
      `;

      adminHistorialList.appendChild(row);
    });
  }

  pintarHistorial(historial);

  if (adminBuscarHistorial) {
    adminBuscarHistorial.addEventListener("input", function () {
      const texto = adminBuscarHistorial.value.toLowerCase().trim();

      const historialFiltrado = historial.filter(function (item) {
        return (
          (item.nombre_cliente || "").toLowerCase().includes(texto) ||
          (item.placa || "").toLowerCase().includes(texto) ||
          (item.espacio || "").toLowerCase().includes(texto) ||
          (item.estado || "").toLowerCase().includes(texto)
        );
      });

      pintarHistorial(historialFiltrado);
    });
  }
}
cargarHistorialAdmin();
});

const role = document.getElementById("registerRole");

role.addEventListener("change",()=>{

    if(role.value==="administrador"){

        document
        .getElementById("adminRulesModal")
        .classList.add("active");

    }

});

document
.getElementById("btnAceptarReglas")
.addEventListener("click",()=>{

    if(!document.getElementById("acceptRules").checked){

        alert("Debes aceptar las reglas.");

        return;

    }

    document
    .getElementById("adminRulesModal")
    .classList.remove("active");

});