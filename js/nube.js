```javascript
import { supabase } from "./supabase.js";

const usuarioTexto = document.getElementById("usuario");
const cerrarSesion = document.getElementById("cerrarSesion");
const subirArchivo = document.getElementById("subirArchivo");
const archivoInput = document.getElementById("archivo");
const listaArchivos = document.getElementById("listaArchivos");
const mensaje = document.getElementById("mensaje");


async function comprobarUsuario() {

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {

        window.location.href = "index.html";

        return;
    }

    usuarioTexto.textContent =
        "Sesión iniciada como: " + data.user.email;

    cargarArchivos();
}


async function cargarArchivos() {

    const { data: usuarioData } =
        await supabase.auth.getUser();

    if (!usuarioData.user) {

        window.location.href = "index.html";

        return;
    }

    const usuarioId = usuarioData.user.id;


    const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("user_id", usuarioId)
        .order("created_at", {
            ascending: false
        });


    if (error) {

        listaArchivos.textContent =
            "Error al cargar los archivos.";

        return;
    }


    listaArchivos.innerHTML = "";


    if (data.length === 0) {

        listaArchivos.innerHTML =
            "<p>No tienes archivos todavía.</p>";

        return;
    }


    data.forEach(function(archivo) {

        const elemento = document.createElement("div");

        elemento.className = "archivo";


        elemento.innerHTML = `
            <div>
                <strong>${archivo.name}</strong>
                <p>${archivo.module || "Sin módulo"}</p>
            </div>

            <button class="descargar">
                Descargar
            </button>

            <button class="eliminar">
                Eliminar
            </button>
        `;


        elemento
            .querySelector(".descargar")
            .addEventListener("click", function() {

                descargarArchivo(archivo);

            });


        elemento
            .querySelector(".eliminar")
            .addEventListener("click", function() {

                eliminarArchivo(archivo);

            });


        listaArchivos.appendChild(elemento);

    });
}


async function subirNuevoArchivo() {

    const archivo = archivoInput.files[0];


    if (!archivo) {

        mensaje.textContent =
            "Selecciona un archivo.";

        return;
    }


    const { data: usuarioData } =
        await supabase.auth.getUser();


    if (!usuarioData.user) {

        window.location.href = "index.html";

        return;
    }


    const usuarioId = usuarioData.user.id;


    const ruta =
        usuarioId + "/" + archivo.name;


    mensaje.textContent =
        "Subiendo archivo...";


    const { error: errorStorage } =
        await supabase.storage
            .from("files")
            .upload(ruta, archivo, {
                upsert: false
            });


    if (errorStorage) {

        mensaje.textContent =
            "Error: " + errorStorage.message;

        return;
    }


    const { error: errorBD } =
        await supabase
            .from("files")
            .insert({

                user_id: usuarioId,

                name: archivo.name,

                path: ruta,

                size: archivo.size,

                module: "General"

            });


    if (errorBD) {

        await supabase.storage
            .from("files")
            .remove([ruta]);

        mensaje.textContent =
            "Error guardando la información.";

        return;
    }


    mensaje.textContent =
        "Archivo subido correctamente.";


    archivoInput.value = "";


    cargarArchivos();
}


async function descargarArchivo(archivo) {

    const { data, error } =
        await supabase.storage
            .from("files")
            .createSignedUrl(
                archivo.path,
                60
            );


    if (error) {

        alert("No se puede descargar el archivo.");

        return;
    }


    window.open(
        data.signedUrl,
        "_blank"
    );
}


async function eliminarArchivo(archivo) {

    const confirmar =
        confirm(
            "¿Quieres eliminar este archivo?"
        );


    if (!confirmar) {

        return;
    }


    const { error } =
        await supabase.storage
            .from("files")
            .remove([
                archivo.path
            ]);


    if (error) {

        alert(
            "No se ha podido eliminar el archivo."
        );

        return;
    }


    await supabase
        .from("files")
        .delete()
        .eq("id", archivo.id);


    cargarArchivos();
}


cerrarSesion.addEventListener(
    "click",
    async function() {

        await supabase.auth.signOut();

        window.location.href =
            "index.html";

    }
);


subirArchivo.addEventListener(
    "click",
    subirNuevoArchivo
);


comprobarUsuario();
```
