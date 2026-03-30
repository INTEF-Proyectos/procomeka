const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/resource-uploader.B4ag5END.js","_astro/preload-helper.AWcIMrlL.js","_astro/resource-display.DPOOk5ro.js","_astro/elpx-preview-service.l8ApSy9T.js"])))=>i.map(i=>d[i]);
import{_ as R}from"./preload-helper.AWcIMrlL.js";import{getApiClient as P}from"./get-api-client.D-t2NzYe.js";import{url as b}from"./paths.BoHSBNBt.js";const M=document.getElementById("edit-loading"),Y=document.getElementById("edit-auth"),O=document.getElementById("edit-notfound"),z=document.getElementById("edit-content"),X=document.getElementById("login-link");X&&(X.href=b("login"));const q={draft:{label:"Borrador",cssClass:"edit-badge-draft"},review:{label:"En revisión",cssClass:"edit-badge-review"},published:{label:"Publicado",cssClass:"edit-badge-published"},archived:{label:"Archivado",cssClass:"edit-badge-archived"}},te={draft:[{to:"review",label:"Enviar a revisión",icon:"rate_review",cssClass:"edit-wf-btn-gold",minRole:"author"}],review:[{to:"draft",label:"Devolver a borrador",icon:"undo",cssClass:"edit-wf-btn-outline",minRole:"curator"},{to:"published",label:"Publicar",icon:"check_circle",cssClass:"edit-wf-btn-green",minRole:"curator"}],published:[{to:"archived",label:"Archivar",icon:"archive",cssClass:"edit-wf-btn-outline",minRole:"curator"}],archived:[{to:"draft",label:"Restaurar a borrador",icon:"restore",cssClass:"edit-wf-btn-outline",minRole:"curator"}]},V={reader:0,author:1,curator:2,admin:3};function f(e){const i=document.createElement("div");return i.textContent=e,i.innerHTML}function ae(e){return e?new Date(e).toLocaleDateString("es-ES",{year:"numeric",month:"long",day:"numeric"}):""}async function ie(){const i=new URLSearchParams(window.location.search).get("id");if(!i){M.style.display="none",O.style.display="flex";return}try{const t=await P(),[n,s]=await Promise.all([t.getSession().catch(()=>null),t.getResourceById(i).catch(()=>null)]);if(M.style.display="none",!n?.user){Y.style.display="flex";return}if(!s){O.style.display="flex";return}const o=n.user.role??"reader";if((V[o]??0)<1){Y.style.display="flex";return}const c=await t.getElpxProject(i).catch(()=>null);c?.hasPreview&&c.previewUrl&&(s.elpxPreview={hash:c.hash,previewUrl:c.previewUrl}),le(s,o,c),z.style.display="block";const _=document.getElementById("edit-multiupload-panel");if(_){const{initResourceUploader:D}=await R(async()=>{const{initResourceUploader:m}=await import("./resource-uploader.B4ag5END.js");return{initResourceUploader:m}},__vite__mapDeps([0,1,2]));await D({resourceId:s.id,root:_,api:t,onUploadComplete:async m=>{const d=document.getElementById("elpx-auto-status");if(d){d.textContent="Generando paquete .elpx...",d.className="edit-upload-status edit-upload-loading",d.style.display="block";try{await t.generateElpx(s.id),d.textContent=m>0?`${m} archivo${m!==1?"s":""} subido${m!==1?"s":""}. Paquete .elpx actualizado.`:"Paquete .elpx actualizado.",d.className="edit-upload-status edit-upload-success",setTimeout(()=>{d.style.display="none"},5e3)}catch(B){d.textContent=`Error al generar .elpx: ${B.message||"Error desconocido"}`,d.className="edit-upload-status edit-upload-error"}}}})}}catch{M.style.display="none",O.style.display="flex"}}function le(e,i,t){const n=q[e.editorialStatus]??q.draft,s=ae(e.updatedAt||e.createdAt),o=e.elpxPreview?.previewUrl??"",C=V[i]??0,c=t?.originalFilename==="recurso-generado.elpx",_=!t||c,D=!t||!c,d=(te[e.editorialStatus]??[]).filter(a=>C>=(V[a.minRole]??99)).map(a=>`<button type="button" class="edit-wf-btn ${a.cssClass}" data-status="${a.to}"><span class="material-symbols-outlined">${a.icon}</span>${f(a.label)}</button>`).join("");z.innerHTML=`
      <!-- Header -->
      <div class="edit-header">
        <div class="edit-header-top">
          <span class="edit-badge ${n.cssClass}">${f(n.label)}</span>
          ${s?`<span class="edit-date"><span class="material-symbols-outlined">calendar_today</span>${f(s)}</span>`:""}
        </div>
        <a href="${b(`recurso?slug=${e.slug}`)}" class="edit-view-link">
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
            <input type="text" id="ed-title" value="${f(e.title)}" required placeholder="Título del recurso" />
            <span id="ed-title-error" class="edit-field-error"></span>
          </div>

          ${o?`
          <div class="edit-preview-section">
            <div class="edit-preview-header">
              <h3>Previsualización</h3>
              <button type="button" class="edit-exe-btn" id="open-exe-editor">
                <span class="material-symbols-outlined">edit_note</span>
                Editar en eXeLearning
              </button>
            </div>
            <div class="edit-preview-wrapper">
              <iframe src="${o}" class="edit-preview-iframe" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" loading="lazy" title="Vista previa"></iframe>
            </div>
          </div>`:""}

          <!-- Multi-file uploader (all formats) — only for auto-generated .elpx -->
          ${_?`<div id="edit-multiupload-panel" class="edit-files-section">
            <h3>Archivos adjuntos</h3>
            <div data-upload-dropzone class="edit-dropzone" id="edit-multi-dropzone" tabindex="0">
              <label class="edit-file-label">
                <span class="material-symbols-outlined">upload_file</span>
                <span>Seleccionar archivos</span>
                <input data-upload-input type="file" multiple />
              </label>
              <p class="edit-drop-hint">o arrastra aquí (PDF, DOCX, imágenes, vídeo…)</p>
            </div>
            <div data-upload-feedback class="edit-upload-status" aria-live="polite"></div>
            <div class="edit-upload-progress-row">
              <progress data-global-progress max="100" value="0" style="width:100%;"></progress>
              <span data-global-progress-label style="font-size:0.85rem;color:#555;">Sin subidas activas</span>
            </div>
            <ul data-upload-queue class="edit-upload-queue"><li style="color:#888;font-size:0.9rem;">No hay archivos en cola.</li></ul>
            <ul data-persisted-uploads style="display:none;"></ul>
            <div class="edit-files-list-header">
              <span>Archivos del recurso</span>
            </div>
            <ul data-media-list class="edit-media-list"><li style="color:#888;font-size:0.9rem;">No hay archivos adjuntos todavía.</li></ul>
            <div id="elpx-auto-status" class="edit-upload-status" style="display:none;" aria-live="polite"></div>
          </div>`:""}

          <!-- Upload .elpx section (direct single .elpx) — only for directly uploaded .elpx -->
          ${D?`<div class="edit-upload-section">
            <h3>${o?"Actualizar archivo .elpx":"Subir archivo .elpx directamente"}</h3>
            <div id="edit-dropzone" class="edit-dropzone" tabindex="0">
              <label class="edit-file-label">
                <span class="material-symbols-outlined">upload_file</span>
                <span>Seleccionar archivo .elpx</span>
                <input type="file" id="edit-file-input" accept=".elpx,.elp" />
              </label>
              <p class="edit-drop-hint">o arrastra aquí</p>
            </div>
            <div id="edit-upload-status" class="edit-upload-status" style="display:none;"></div>
          </div>`:""}

          <div class="edit-field">
            <label for="ed-description">Descripción</label>
            <textarea id="ed-description" rows="6" required placeholder="Describe el contenido, objetivos y destinatarios...">${f(e.description)}</textarea>
            <span id="ed-description-error" class="edit-field-error"></span>
          </div>

          <div class="edit-field">
            <label for="ed-author">Autor</label>
            <input type="text" id="ed-author" value="${f(e.author??"")}" placeholder="Nombre del autor" />
          </div>

          <div class="edit-field">
            <label for="ed-keywords">Palabras clave (separadas por comas)</label>
            <input type="text" id="ed-keywords" value="${f(e.keywords??"")}" placeholder="matemáticas, fracciones, visual" />
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
            ${d?`<div class="edit-wf-actions">${d}</div>`:""}
            ${t?.metadata&&(t.metadata.title||t.metadata.description)?`
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
    `;const B=document.getElementById("edit-form"),u=document.getElementById("edit-error"),y=document.getElementById("edit-success");B.addEventListener("submit",async a=>{a.preventDefault(),u.style.display="none",y.style.display="none";const l=B.querySelector(".edit-save-btn");l.disabled=!0,l.innerHTML='<span class="material-symbols-outlined">hourglass_empty</span>Guardando...';try{const L=await(await P()).updateResource(e.id,{title:document.getElementById("ed-title").value,description:document.getElementById("ed-description").value,language:document.getElementById("ed-language").value,license:document.getElementById("ed-license").value,resourceType:document.getElementById("ed-resourceType").value,author:document.getElementById("ed-author").value||void 0,keywords:document.getElementById("ed-keywords").value||void 0});L.ok?(y.textContent="Cambios guardados correctamente",y.style.display="block",setTimeout(()=>{y.style.display="none"},3e3)):(L.details&&L.details.forEach(U=>{const H=document.getElementById(`ed-${U.field}-error`);H&&(H.textContent=U.message);const W=document.getElementById(`ed-${U.field}`);W&&W.setAttribute("aria-invalid","true")}),u.textContent=L.error??"Error al guardar",u.style.display="block")}catch{u.textContent="Error de conexión",u.style.display="block"}finally{l.disabled=!1,l.innerHTML='<span class="material-symbols-outlined">save</span>Guardar cambios'}}),z.querySelectorAll(".edit-wf-btn").forEach(a=>{a.addEventListener("click",async()=>{const l=a.dataset.status;u.style.display="none",y.style.display="none";try{await(await P()).updateResourceStatus(e.id,l),y.textContent=`Estado actualizado a "${q[l]?.label??l}"`,y.style.display="block",setTimeout(()=>window.location.reload(),800)}catch{u.textContent="Error al cambiar el estado",u.style.display="block"}})});const T=document.getElementById("apply-elpx-meta");T&&t?.metadata&&T.addEventListener("click",()=>{const a=t.metadata;if(a.title&&(document.getElementById("ed-title").value=a.title),a.description&&(document.getElementById("ed-description").value=a.description),a.author&&(document.getElementById("ed-author").value=a.author),a.language){const l=document.getElementById("ed-language");l.querySelector(`option[value="${a.language}"]`)&&(l.value=a.language)}if(a.license){const l=document.getElementById("ed-license");l.querySelector(`option[value="${a.license}"]`)&&(l.value=a.license)}T.innerHTML='<span class="material-symbols-outlined">check</span>Metadatos aplicados',T.disabled=!0});const E=document.getElementById("open-exe-editor");E&&(async()=>{try{const l=await(await P()).getElpxProject(e.id);l?E.addEventListener("click",()=>{ne(e.id,l.hash,l.elpxFileUrl,l.originalFilename)}):(E.setAttribute("disabled","true"),E.title="No hay archivo .elpx asociado")}catch{E.setAttribute("disabled","true")}})();const v=document.getElementById("edit-dropzone"),k=document.getElementById("edit-file-input"),N=document.getElementById("edit-upload-status");v&&k&&N&&(k.addEventListener("change",()=>{const a=k.files?.[0];a&&Q(a,e.id,N)}),v.addEventListener("dragover",a=>{a.preventDefault(),v.classList.add("is-dragover")}),v.addEventListener("dragleave",()=>{v.classList.remove("is-dragover")}),v.addEventListener("drop",a=>{a.preventDefault(),v.classList.remove("is-dragover");const l=a.dataTransfer?.files[0];l&&Q(l,e.id,N)}))}async function Q(e,i,t){t.textContent="Subiendo archivo...",t.className="edit-upload-status edit-upload-loading",t.style.display="block";try{if(window.__PREVIEW_MODE__){const{saveElpxInPreview:s}=await R(async()=>{const{saveElpxInPreview:o}=await import("./elpx-preview-service.l8ApSy9T.js");return{saveElpxInPreview:o}},__vite__mapDeps([3,1]));await s({resourceId:i,blob:e,filename:e.name})}else{const s=new FormData;s.append("file",e);const o=await fetch(b(`api/admin/elpx/upload/${i}`),{method:"POST",credentials:"include",body:s});if(!o.ok){const C=await o.json().catch(()=>({}));throw new Error(C.error||"Error al subir")}}t.textContent=`Archivo "${e.name}" subido correctamente. Recargando...`,t.className="edit-upload-status edit-upload-success",setTimeout(()=>window.location.reload(),1e3)}catch(n){t.textContent=`Error: ${n.message||"No se pudo subir el archivo"}`,t.className="edit-upload-status edit-upload-error"}}let j=!1,g=!1,$=!1,x=null,J=null,K=null,F=null,se=0;const G=document.getElementById("exe-editor-modal"),w=document.getElementById("exe-iframe"),r=document.getElementById("exe-status"),p=document.getElementById("exe-save-btn"),oe=document.getElementById("exe-close-btn"),h=document.getElementById("exe-saving-overlay"),A=!!window.__PREVIEW_MODE__;function S(e){return`${e}-${Date.now()}-${++se}`}function I(e,i){w.contentWindow?.postMessage(e,"*",i??[])}function ne(e,i,t,n){if(F=e,x=i,J=t,K=n,j=!1,g=!1,$=!1,p.disabled=!0,r.textContent="Cargando editor...",G.style.display="flex",document.body.style.overflow="hidden",A)w.src=b("exelearning-editor-loader.html")+`?resourceId=${e}`;else{const s=b("api/v1/exelearning-editor/index.html"),o=t?encodeURIComponent(t):"";w.src=`${s}?elpxUrl=${o}&resourceId=${e}`}}function Z(e=!1){$&&!e&&!confirm("Hay cambios sin guardar. ¿Cerrar?")||(G.style.display="none",w.src="about:blank",document.body.style.overflow="")}async function de(e){g=!0,p.disabled=!0,r.textContent="Guardando...",h.style.display="flex";try{const i=new Blob([e.bytes],{type:e.mimeType||"application/zip"});if(A){const{saveElpxInPreview:t}=await R(async()=>{const{saveElpxInPreview:s}=await import("./elpx-preview-service.l8ApSy9T.js");return{saveElpxInPreview:s}},__vite__mapDeps([3,1]));x=(await t({resourceId:F,blob:i,filename:e.filename||"project.elpx",existingHash:x||void 0})).hash,I({type:"WP_SAVE_CONFIRMED",requestId:S("confirmed")})}else{const t=new FormData;if(t.append("file",i,e.filename||"project.elpx"),!(await fetch(b(`api/admin/elpx/save/${F}`),{method:"POST",credentials:"include",body:t})).ok)throw new Error("Error al guardar");I({type:"WP_SAVE_CONFIRMED",requestId:S("confirmed")})}$=!1,r.textContent="Guardado",h.style.display="none",setTimeout(()=>{Z(!0),window.location.reload()},800)}catch(i){r.textContent=`Error: ${i.message}`,p.disabled=!1,h.style.display="none"}finally{g=!1}}async function re(){if(!A)return;const{loadElpxBlob:e}=await R(async()=>{const{loadElpxBlob:t}=await import("./elpx-preview-service.l8ApSy9T.js");return{loadElpxBlob:t}},__vite__mapDeps([3,1])),i=x?await e(x,J):null;if(i){const t=await i.arrayBuffer();I({type:"OPEN_FILE",data:{bytes:t,filename:K||"project.elpx"}},[t])}}window.addEventListener("message",e=>{if(!(!e.data?.type||e.source!==w.contentWindow))switch(e.data.type){case"EXELEARNING_READY":j=!0,r.textContent="Editor listo",I({type:"CONFIGURE",requestId:S("cfg"),data:{hideUI:{fileMenu:!0,saveButton:!0,userMenu:!0}}}),A&&re();break;case"DOCUMENT_LOADED":r.textContent="Documento cargado",p.disabled=!1;break;case"DOCUMENT_CHANGED":$=!0,r.textContent="Cambios sin guardar",p.disabled=!1;break;case"WP_SAVE_FILE":e.data.bytes&&de(e.data);break;case"WP_REQUEST_SAVE_ERROR":r.textContent=`Error: ${e.data.error}`,p.disabled=!1,g=!1,h.style.display="none";break}});p.addEventListener("click",()=>{g||!j||(g=!0,p.disabled=!0,r.textContent="Exportando...",h.style.display="flex",I({type:"WP_REQUEST_SAVE",requestId:S("export")}))});oe.addEventListener("click",()=>Z());window.addEventListener("beforeunload",e=>{$&&G.style.display!=="none"&&e.preventDefault()});ie();
