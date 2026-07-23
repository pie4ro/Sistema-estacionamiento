document.addEventListener("DOMContentLoaded", function () {

    const role = document.getElementById("registerRole");

    if (role) {

        role.addEventListener("change", () => {

            if (role.value === "administrador") {

                document
                    .getElementById("adminRulesModal")
                    .classList.add("active");

            }

        });

    }

    const btnAceptar = document.getElementById("btnAceptarReglas");

    if (btnAceptar) {

        btnAceptar.addEventListener("click", () => {

            if (!document.getElementById("acceptRules").checked) {

                alert("Debes aceptar las reglas.");
                return;

            }

            document
                .getElementById("adminRulesModal")
                .classList.remove("active");

        });

    }

});