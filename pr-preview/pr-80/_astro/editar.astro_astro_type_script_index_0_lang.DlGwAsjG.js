const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/elpx-preview-service.S9iu4YZX.js","_astro/preload-helper.o3oPMKfi.js"])))=>i.map(i=>d[i]);
import{_ as O}from"./preload-helper.o3oPMKfi.js";import{getApiClient as B}from"./get-api-client.SOz_vcaW.js";import{url as y}from"./paths.DRIzIpVf.js";const P=document.getElementById("edit-loading"),H=document.getElementById("edit-auth"),R=document.getElementById("edit-notfound"),D=document.getElementById("edit-content"),G=document.getElementById("login-link");G&&(G.href=y("login"));const k={draft:{label:"Borrador",cssClass:"edit-badge-draft"},review:{label:"En revisión",cssClass:"edit-badge-review"},published:{label:"Publicado",cssClass:"edit-badge-published"},archived:{label:"Archivado",cssClass:"edit-badge-archived"}},J={draft:[{to:"review",label:"Enviar a revisión",icon:"rate_review",cssClass:"edit-wf-btn-gold",minRole:"author"}],review:[{to:"draft",label:"Devolver a borrador",icon:"undo",cssClass:"edit-wf-btn-outline",minRole:"curator"},{to:"published",label:"Publicar",icon:"check_circle",cssClass:"edit-wf-btn-green",minRole:"curator"}],published:[{to:"archived",label:"Archivar",icon:"archive",cssClass:"edit-wf-btn-outline",minRole:"curator"}],archived:[{to:"draft",label:"Restaurar a borrador",icon:"restore",cssClass:"edit-wf-btn-outline",minRole:"curator"}]},M={reader:0,author:1,curator:2,admin:3};function c(e){const i=document.createElement("div");return i.textContent=e,i.innerHTML}function Z(e){return e<1024?`${e} B`:e<1024*1024?`${(e/1024).toFixed(1)} KB`:`${(e/(1024*1024)).toFixed(1)} MB`}function ee(e){return e?new Date(e).toLocaleDateString("es-ES",{year:"numeric",month:"long",day:"numeric"}):""}async function te(){const i=new URLSearchParams(window.location.search).get("id");if(!i){P.style.display="none",R.style.display="flex";return}try{const a=await B(),[o,s]=await Promise.all([a.getSession().catch(()=>null),a.getResourceById(i).catch(()=>null)]);if(P.style.display="none",!o?.user){H.style.display="flex";return}if(!s){R.style.display="flex";return}const n=o.user.role??"reader";if((M[n]??0)<1){H.style.display="flex";return}const v=await a.getElpxProject(i).catch(()=>null);v?.hasPreview&&v.previewUrl&&(s.elpxPreview={hash:v.hash,previewUrl:v.previewUrl}),ae(s,n,v),D.style.display="block"}catch{P.style.display="none",R.style.display="flex"}}function ae(e,i,a){const o=k[e.editorialStatus]??k.draft,s=ee(e.updatedAt||e.createdAt),n=e.elpxPreview?.previewUrl??"",I=M[i]??0,V=(J[e.editorialStatus]??[]).filter(t=>I>=(M[t.minRole]??99)).map(t=>`<button type="button" class="edit-wf-btn ${t.cssClass}" data-status="${t.to}"><span class="material-symbols-outlined">${t.icon}</span>${c(t.label)}</button>`).join("");D.innerHTML=`
      <!-- Header -->
      <div class="edit-header">
        <div class="edit-header-top">
          <span class="edit-badge ${o.cssClass}">${c(o.label)}</span>
          ${s?`<span class="edit-date"><span class="material-symbols-outlined">calendar_today</span>${c(s)}</span>`:""}
        </div>
        <a href="${y(`recurso?slug=${e.slug}`)}" class="edit-view-link">
          <span class="material-symbols-outlined">visibility</span>
          Ver ficha pública
        </a>
      </div>

      <div id="edit-error" class="edit-msg edit-msg-error" role="alert" style="display:none;"></div>
      <div id="edit-success" class="edit-msg edit-msg-success" role="status" style="display:none;"></div>

      <!-- Form as detail-style layout -->
      <form id="edit-form" class="edit-grid" novalidate>
        <!-- Left column -->
        <div class="edit-main">
          <div class="edit-field edit-field-title">
            <label for="ed-title">Título</label>
            <input type="text" id="ed-title" value="${c(e.title)}" required placeholder="Título del recurso" />
            <span id="ed-title-error" class="edit-field-error"></span>
          </div>

          ${n?`
          <div class="edit-preview-section">
            <div class="edit-preview-header">
              <h3>Previsualización</h3>
              <button type="button" class="edit-exe-btn" id="open-exe-editor">
                <span class="material-symbols-outlined">edit_note</span>
                Editar en eXeLearning
              </button>
            </div>
            <div class="edit-preview-wrapper">
              <iframe src="${n}" class="edit-preview-iframe" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" loading="lazy" title="Vista previa"></iframe>
            </div>
          </div>`:""}

          <!-- Upload .elpx section -->
          <div class="edit-upload-section">
            <h3>${n?"Actualizar archivo .elpx":"Subir archivo .elpx"}</h3>
            <div id="edit-dropzone" class="edit-dropzone" tabindex="0">
              <label class="edit-file-label">
                <span class="material-symbols-outlined">upload_file</span>
                <span>Seleccionar archivo .elpx</span>
                <input type="file" id="edit-file-input" accept=".elpx,.elp" />
              </label>
              <p class="edit-drop-hint">o arrastra aquí</p>
            </div>
            <div id="edit-upload-status" class="edit-upload-status" style="display:none;"></div>
          </div>

          <!-- Attached files -->
          ${e.mediaItems?.length?`
          <div class="edit-files-section">
            <h3>Archivos adjuntos</h3>
            <div class="edit-files-list">
              ${e.mediaItems.map(t=>`
                <div class="edit-file-item">
                  <span class="material-symbols-outlined">description</span>
                  <span class="edit-file-name">${c(String(t.filename||"Archivo"))}</span>
                  ${t.fileSize?`<span class="edit-file-size">${Z(t.fileSize)}</span>`:""}
                </div>
              `).join("")}
            </div>
          </div>`:""}

          <div class="edit-field">
            <label for="ed-description">Descripción</label>
            <textarea id="ed-description" rows="6" required placeholder="Describe el contenido, objetivos y destinatarios...">${c(e.description)}</textarea>
            <span id="ed-description-error" class="edit-field-error"></span>
          </div>

          <div class="edit-field">
            <label for="ed-author">Autor</label>
            <input type="text" id="ed-author" value="${c(e.author??"")}" placeholder="Nombre del autor" />
          </div>

          <div class="edit-field">
            <label for="ed-keywords">Palabras clave (separadas por comas)</label>
            <input type="text" id="ed-keywords" value="${c(e.keywords??"")}" placeholder="matemáticas, fracciones, visual" />
          </div>
        </div>

        <!-- Right sidebar -->
        <aside class="edit-sidebar">
          <!-- Actions card -->
          <div class="edit-sidebar-card">
            <h3 class="edit-sidebar-title">Acciones</h3>
            <button type="submit" class="edit-save-btn">
              <span class="material-symbols-outlined">save</span>
              Guardar cambios
            </button>
            ${V?`<div class="edit-wf-actions">${V}</div>`:""}
            ${a?.metadata&&(a.metadata.title||a.metadata.description)?`
            <button type="button" id="apply-elpx-meta" class="edit-wf-btn edit-wf-btn-outline">
              <span class="material-symbols-outlined">auto_awesome</span>
              Aplicar metadatos del .elpx
            </button>`:""}
          </div>

          <!-- Metadata card -->
          <div class="edit-sidebar-card">
            <h3 class="edit-sidebar-title">Metadatos</h3>

            <div class="edit-field">
              <label for="ed-language">Idioma</label>
              <select id="ed-language">
                <option value="es" ${e.language==="es"?"selected":""}>Español</option>
                <option value="en" ${e.language==="en"?"selected":""}>Inglés</option>
                <option value="ca" ${e.language==="ca"?"selected":""}>Catalán</option>
                <option value="eu" ${e.language==="eu"?"selected":""}>Euskera</option>
                <option value="gl" ${e.language==="gl"?"selected":""}>Gallego</option>
              </select>
            </div>

            <div class="edit-field">
              <label for="ed-license">Licencia</label>
              <select id="ed-license">
                <option value="cc-by" ${e.license==="cc-by"?"selected":""}>CC BY</option>
                <option value="cc-by-sa" ${e.license==="cc-by-sa"?"selected":""}>CC BY-SA</option>
                <option value="cc-by-nc" ${e.license==="cc-by-nc"?"selected":""}>CC BY-NC</option>
                <option value="cc-by-nc-sa" ${e.license==="cc-by-nc-sa"?"selected":""}>CC BY-NC-SA</option>
                <option value="cc0" ${e.license==="cc0"?"selected":""}>CC0</option>
              </select>
            </div>

            <div class="edit-field">
              <label for="ed-resourceType">Tipo de recurso</label>
              <select id="ed-resourceType">
                <option value="documento" ${e.resourceType==="documento"?"selected":""}>Documento</option>
                <option value="presentacion" ${e.resourceType==="presentacion"?"selected":""}>Presentación</option>
                <option value="video" ${e.resourceType==="video"?"selected":""}>Vídeo</option>
                <option value="audio" ${e.resourceType==="audio"?"selected":""}>Audio</option>
                <option value="imagen" ${e.resourceType==="imagen"?"selected":""}>Imagen</option>
                <option value="actividad-interactiva" ${e.resourceType==="actividad-interactiva"?"selected":""}>Actividad interactiva</option>
                <option value="secuencia-didactica" ${e.resourceType==="secuencia-didactica"?"selected":""}>Secuencia didáctica</option>
                <option value="ejercicio" ${e.resourceType==="ejercicio"?"selected":""}>Ejercicio</option>
                <option value="evaluacion" ${e.resourceType==="evaluacion"?"selected":""}>Evaluación</option>
                <option value="proyecto" ${e.resourceType==="proyecto"?"selected":""}>Proyecto</option>
              </select>
            </div>
          </div>
        </aside>
      </form>
    `;const j=document.getElementById("edit-form"),r=document.getElementById("edit-error"),p=document.getElementById("edit-success");j.addEventListener("submit",async t=>{t.preventDefault(),r.style.display="none",p.style.display="none";const l=j.querySelector(".edit-save-btn");l.disabled=!0,l.innerHTML='<span class="material-symbols-outlined">hourglass_empty</span>Guardando...';try{const C=await(await B()).updateResource(e.id,{title:document.getElementById("ed-title").value,description:document.getElementById("ed-description").value,language:document.getElementById("ed-language").value,license:document.getElementById("ed-license").value,resourceType:document.getElementById("ed-resourceType").value,author:document.getElementById("ed-author").value||void 0,keywords:document.getElementById("ed-keywords").value||void 0});C.ok?(p.textContent="Cambios guardados correctamente",p.style.display="block",setTimeout(()=>{p.style.display="none"},3e3)):(C.details&&C.details.forEach(A=>{const q=document.getElementById(`ed-${A.field}-error`);q&&(q.textContent=A.message);const z=document.getElementById(`ed-${A.field}`);z&&z.setAttribute("aria-invalid","true")}),r.textContent=C.error??"Error al guardar",r.style.display="block")}catch{r.textContent="Error de conexión",r.style.display="block"}finally{l.disabled=!1,l.innerHTML='<span class="material-symbols-outlined">save</span>Guardar cambios'}}),D.querySelectorAll(".edit-wf-btn").forEach(t=>{t.addEventListener("click",async()=>{const l=t.dataset.status;r.style.display="none",p.style.display="none";try{await(await B()).updateResourceStatus(e.id,l),p.textContent=`Estado actualizado a "${k[l]?.label??l}"`,p.style.display="block",setTimeout(()=>window.location.reload(),800)}catch{r.textContent="Error al cambiar el estado",r.style.display="block"}})});const $=document.getElementById("apply-elpx-meta");$&&a?.metadata&&$.addEventListener("click",()=>{const t=a.metadata;if(t.title&&(document.getElementById("ed-title").value=t.title),t.description&&(document.getElementById("ed-description").value=t.description),t.author&&(document.getElementById("ed-author").value=t.author),t.language){const l=document.getElementById("ed-language");l.querySelector(`option[value="${t.language}"]`)&&(l.value=t.language)}if(t.license){const l=document.getElementById("ed-license");l.querySelector(`option[value="${t.license}"]`)&&(l.value=t.license)}$.innerHTML='<span class="material-symbols-outlined">check</span>Metadatos aplicados',$.disabled=!0});const b=document.getElementById("open-exe-editor");b&&(async()=>{try{const l=await(await B()).getElpxProject(e.id);l?b.addEventListener("click",()=>{se(e.id,l.hash,l.elpxFileUrl,l.originalFilename)}):(b.setAttribute("disabled","true"),b.title="No hay archivo .elpx asociado")}catch{b.setAttribute("disabled","true")}})();const m=document.getElementById("edit-dropzone"),T=document.getElementById("edit-file-input"),L=document.getElementById("edit-upload-status");m&&T&&L&&(T.addEventListener("change",()=>{const t=T.files?.[0];t&&W(t,e.id,L)}),m.addEventListener("dragover",t=>{t.preventDefault(),m.classList.add("is-dragover")}),m.addEventListener("dragleave",()=>{m.classList.remove("is-dragover")}),m.addEventListener("drop",t=>{t.preventDefault(),m.classList.remove("is-dragover");const l=t.dataTransfer?.files[0];l&&W(l,e.id,L)}))}async function W(e,i,a){a.textContent="Subiendo archivo...",a.className="edit-upload-status edit-upload-loading",a.style.display="block";try{if(window.__PREVIEW_MODE__){const{saveElpxInPreview:s}=await O(async()=>{const{saveElpxInPreview:n}=await import("./elpx-preview-service.S9iu4YZX.js");return{saveElpxInPreview:n}},__vite__mapDeps([0,1]));await s({resourceId:i,blob:e,filename:e.name})}else{const s=new FormData;s.append("file",e);const n=await fetch(y(`api/admin/elpx/upload/${i}`),{method:"POST",credentials:"include",body:s});if(!n.ok){const I=await n.json().catch(()=>({}));throw new Error(I.error||"Error al subir")}}a.textContent=`Archivo "${e.name}" subido correctamente. Recargando...`,a.className="edit-upload-status edit-upload-success",setTimeout(()=>window.location.reload(),1e3)}catch(o){a.textContent=`Error: ${o.message||"No se pudo subir el archivo"}`,a.className="edit-upload-status edit-upload-error"}}let U=!1,f=!1,x=!1,g=null,Y=null,Q=null,N=null,ie=0;const F=document.getElementById("exe-editor-modal"),w=document.getElementById("exe-iframe"),d=document.getElementById("exe-status"),u=document.getElementById("exe-save-btn"),le=document.getElementById("exe-close-btn"),E=document.getElementById("exe-saving-overlay"),S=!!window.__PREVIEW_MODE__;function _(e){return`${e}-${Date.now()}-${++ie}`}function h(e,i){w.contentWindow?.postMessage(e,"*",i??[])}function se(e,i,a,o){if(N=e,g=i,Y=a,Q=o,U=!1,f=!1,x=!1,u.disabled=!0,d.textContent="Cargando editor...",F.style.display="flex",document.body.style.overflow="hidden",S)w.src=y("exelearning-editor-loader.html")+`?resourceId=${e}`;else{const s=y("api/v1/exelearning-editor/index.html"),n=a?encodeURIComponent(a):"";w.src=`${s}?elpxUrl=${n}&resourceId=${e}`}}function X(e=!1){x&&!e&&!confirm("Hay cambios sin guardar. ¿Cerrar?")||(F.style.display="none",w.src="about:blank",document.body.style.overflow="")}async function ne(e){f=!0,u.disabled=!0,d.textContent="Guardando...",E.style.display="flex";try{const i=new Blob([e.bytes],{type:e.mimeType||"application/zip"});if(S){const{saveElpxInPreview:a}=await O(async()=>{const{saveElpxInPreview:s}=await import("./elpx-preview-service.S9iu4YZX.js");return{saveElpxInPreview:s}},__vite__mapDeps([0,1]));g=(await a({resourceId:N,blob:i,filename:e.filename||"project.elpx",existingHash:g||void 0})).hash,h({type:"WP_SAVE_CONFIRMED",requestId:_("confirmed")})}else{const a=new FormData;if(a.append("file",i,e.filename||"project.elpx"),!(await fetch(y(`api/admin/elpx/save/${N}`),{method:"POST",credentials:"include",body:a})).ok)throw new Error("Error al guardar");h({type:"WP_SAVE_CONFIRMED",requestId:_("confirmed")})}x=!1,d.textContent="Guardado",E.style.display="none",setTimeout(()=>{X(!0),window.location.reload()},800)}catch(i){d.textContent=`Error: ${i.message}`,u.disabled=!1,E.style.display="none"}finally{f=!1}}async function oe(){if(!S)return;const{loadElpxBlob:e}=await O(async()=>{const{loadElpxBlob:a}=await import("./elpx-preview-service.S9iu4YZX.js");return{loadElpxBlob:a}},__vite__mapDeps([0,1])),i=g?await e(g,Y):null;if(i){const a=await i.arrayBuffer();h({type:"OPEN_FILE",data:{bytes:a,filename:Q||"project.elpx"}},[a])}}window.addEventListener("message",e=>{if(!(!e.data?.type||e.source!==w.contentWindow))switch(e.data.type){case"EXELEARNING_READY":U=!0,d.textContent="Editor listo",h({type:"CONFIGURE",requestId:_("cfg"),data:{hideUI:{fileMenu:!0,saveButton:!0,userMenu:!0}}}),S&&oe();break;case"DOCUMENT_LOADED":d.textContent="Documento cargado",u.disabled=!1;break;case"DOCUMENT_CHANGED":x=!0,d.textContent="Cambios sin guardar",u.disabled=!1;break;case"WP_SAVE_FILE":e.data.bytes&&ne(e.data);break;case"WP_REQUEST_SAVE_ERROR":d.textContent=`Error: ${e.data.error}`,u.disabled=!1,f=!1,E.style.display="none";break}});u.addEventListener("click",()=>{f||!U||(f=!0,u.disabled=!0,d.textContent="Exportando...",E.style.display="flex",h({type:"WP_REQUEST_SAVE",requestId:_("export")}))});le.addEventListener("click",()=>X());window.addEventListener("beforeunload",e=>{x&&F.style.display!=="none"&&e.preventDefault()});te();
