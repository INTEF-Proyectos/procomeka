const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/resource-uploader.B5_pG6p1.js","_astro/preload-helper.BKXYl-sz.js","_astro/resource-display.DPOOk5ro.js","_astro/elpx-preview-service.BnsKTYrq.js"])))=>i.map(i=>d[i]);
import{_ as A}from"./preload-helper.BKXYl-sz.js";import{getApiClient as S}from"./get-api-client.D9qSlP0M.js";import{url as g}from"./paths.B9MzslvF.js";const q=document.getElementById("edit-loading"),Q=document.getElementById("edit-auth"),N=document.getElementById("edit-notfound"),V=document.getElementById("edit-content"),J=document.getElementById("login-link");J&&(J.href=g("login"));const z={draft:{label:"Borrador",cssClass:"edit-badge-draft"},review:{label:"En revisión",cssClass:"edit-badge-review"},published:{label:"Publicado",cssClass:"edit-badge-published"},archived:{label:"Archivado",cssClass:"edit-badge-archived"}},ae={draft:[{to:"review",label:"Enviar a revisión",icon:"rate_review",cssClass:"edit-wf-btn-gold",minRole:"author"}],review:[{to:"draft",label:"Devolver a borrador",icon:"undo",cssClass:"edit-wf-btn-outline",minRole:"curator"},{to:"published",label:"Publicar",icon:"check_circle",cssClass:"edit-wf-btn-green",minRole:"curator"}],published:[{to:"archived",label:"Archivar",icon:"archive",cssClass:"edit-wf-btn-outline",minRole:"curator"}],archived:[{to:"draft",label:"Restaurar a borrador",icon:"restore",cssClass:"edit-wf-btn-outline",minRole:"curator"}]},j={reader:0,author:1,curator:2,admin:3};function b(e){const i=document.createElement("div");return i.textContent=e,i.innerHTML}function ie(e){return e?new Date(e).toLocaleDateString("es-ES",{year:"numeric",month:"long",day:"numeric"}):""}async function oe(){const e=new URLSearchParams(window.location.search),i=e.get("id"),t=e.get("new")==="1";if(!i){q.style.display="none",N.style.display="flex";return}try{const l=await S(),[n,s]=await Promise.all([l.getSession().catch(()=>null),l.getResourceById(i).catch(()=>null)]);if(q.style.display="none",!n?.user){Q.style.display="flex";return}if(!s){N.style.display="flex";return}const c=n.user.role??"reader";if((j[c]??0)<1){Q.style.display="flex";return}const u=await l.getElpxProject(i).catch(()=>null);u?.hasPreview&&u.previewUrl&&(s.elpxPreview={hash:u.hash,previewUrl:u.previewUrl}),le(s,c,u,t),V.style.display="block";const _=document.getElementById("edit-multiupload-panel");if(_){const{initResourceUploader:D}=await A(async()=>{const{initResourceUploader:m}=await import("./resource-uploader.B5_pG6p1.js");return{initResourceUploader:m}},__vite__mapDeps([0,1,2]));await D({resourceId:s.id,root:_,api:l,onUploadComplete:t?void 0:async m=>{const d=document.getElementById("elpx-auto-status");if(d){d.textContent="Generando paquete .elpx...",d.className="edit-upload-status edit-upload-loading",d.style.display="block";try{await l.generateElpx(s.id),d.textContent=m>0?`${m} archivo${m!==1?"s":""} subido${m!==1?"s":""}. Paquete .elpx actualizado.`:"Paquete .elpx actualizado.",d.className="edit-upload-status edit-upload-success",setTimeout(()=>{d.style.display="none"},5e3)}catch(B){d.textContent=`Error al generar .elpx: ${B.message||"Error desconocido"}`,d.className="edit-upload-status edit-upload-error"}}}})}}catch{q.style.display="none",N.style.display="flex"}}function le(e,i,t,l=!1){const n=z[e.editorialStatus]??z.draft,s=ie(e.updatedAt||e.createdAt),c=e.elpxPreview?.previewUrl??"",W=j[i]??0,u=t?.originalFilename==="recurso-generado.elpx",_=l||!t||u,D=!l&&t!==null&&!u,d=(ae[e.editorialStatus]??[]).filter(a=>W>=(j[a.minRole]??99)).map(a=>`<button type="button" class="edit-wf-btn ${a.cssClass}" data-status="${a.to}"><span class="material-symbols-outlined">${a.icon}</span>${b(a.label)}</button>`).join("");V.innerHTML=`
      <!-- Header -->
      <div class="edit-header">
        <div class="edit-header-top">
          <span class="edit-badge ${n.cssClass}">${b(n.label)}</span>
          ${s?`<span class="edit-date"><span class="material-symbols-outlined">calendar_today</span>${b(s)}</span>`:""}
        </div>
        <a href="${g(`recurso?slug=${e.slug}`)}" class="edit-view-link">
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
            <input type="text" id="ed-title" value="${l?"":b(e.title)}" required placeholder="Título del recurso" />
            <span id="ed-title-error" class="edit-field-error"></span>
          </div>

          ${c?`
          <div class="edit-preview-section">
            <div class="edit-preview-header">
              <h3>Previsualización</h3>
              <button type="button" class="edit-exe-btn" id="open-exe-editor">
                <span class="material-symbols-outlined">edit_note</span>
                Editar en eXeLearning
              </button>
            </div>
            <div class="edit-preview-wrapper">
              <iframe src="${c}" class="edit-preview-iframe" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" loading="lazy" title="Vista previa"></iframe>
            </div>
          </div>`:""}

          <!-- Multi-file uploader (all formats) — only for auto-generated .elpx -->
          ${_?`<div id="edit-multiupload-panel" class="edit-files-section">
            <h3>Archivos adjuntos</h3>
            <div data-upload-dropzone class="edit-dropzone" tabindex="0">
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
            <h3>${c?"Actualizar archivo .elpx":"Subir archivo .elpx directamente"}</h3>
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
            <textarea id="ed-description" rows="6" required placeholder="Describe el contenido, objetivos y destinatarios...">${l?"":b(e.description)}</textarea>
            <span id="ed-description-error" class="edit-field-error"></span>
          </div>

          ${l?`
          <div class="edit-form-row">
            <div class="edit-field">
              <label for="ed-language">Idioma</label>
              <select id="ed-language">
                <option value="es" selected>Español</option>
                <option value="en">Inglés</option>
                <option value="ca">Catalán</option>
                <option value="eu">Euskera</option>
                <option value="gl">Gallego</option>
              </select>
            </div>
            <div class="edit-field">
              <label for="ed-license">Licencia</label>
              <select id="ed-license">
                <option value="cc-by" selected>CC BY</option>
                <option value="cc-by-sa">CC BY-SA</option>
                <option value="cc-by-nc">CC BY-NC</option>
                <option value="cc-by-nc-sa">CC BY-NC-SA</option>
                <option value="cc0">CC0</option>
              </select>
            </div>
          </div>
          <div class="edit-field">
            <label for="ed-resourceType">Tipo de recurso</label>
            <select id="ed-resourceType">
              <option value="documento">Documento</option>
              <option value="presentacion">Presentación</option>
              <option value="video">Vídeo</option>
              <option value="audio">Audio</option>
              <option value="imagen">Imagen</option>
              <option value="actividad-interactiva" selected>Actividad interactiva</option>
              <option value="secuencia-didactica">Secuencia didáctica</option>
              <option value="ejercicio">Ejercicio</option>
              <option value="evaluacion">Evaluación</option>
              <option value="proyecto">Proyecto</option>
            </select>
          </div>`:""}

          <div class="edit-field">
            <label for="ed-author">Autor</label>
            <input type="text" id="ed-author" value="${b(e.author??"")}" placeholder="Nombre del autor" />
          </div>

          <div class="edit-field">
            <label for="ed-keywords">Palabras clave (separadas por comas)</label>
            <input type="text" id="ed-keywords" value="${b(e.keywords??"")}" placeholder="matemáticas, fracciones, visual" />
          </div>
        </div>

        <!-- Right sidebar -->
        <aside class="edit-sidebar">
          <!-- Actions card -->
          <div class="edit-sidebar-card">
            <h3 class="edit-sidebar-title">Acciones</h3>
            <button type="submit" class="edit-save-btn">
              <span class="material-symbols-outlined">save</span>
              ${l?"Crear recurso":"Guardar cambios"}
            </button>
            ${d?`<div class="edit-wf-actions">${d}</div>`:""}
            ${t?.metadata&&(t.metadata.title||t.metadata.description)?`
            <button type="button" id="apply-elpx-meta" class="edit-wf-btn edit-wf-btn-outline">
              <span class="material-symbols-outlined">auto_awesome</span>
              Aplicar metadatos del .elpx
            </button>`:""}
          </div>

          <!-- Metadata card — hidden in creation mode (fields are in main column) -->
          ${l?"":`<div class="edit-sidebar-card">
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
          </div>`}
        </aside>
      </form>
    `;const B=document.getElementById("edit-form"),p=document.getElementById("edit-error"),y=document.getElementById("edit-success");B.addEventListener("submit",async a=>{a.preventDefault(),p.style.display="none",y.style.display="none";const o=B.querySelector(".edit-save-btn");o.disabled=!0,o.innerHTML='<span class="material-symbols-outlined">hourglass_empty</span>Guardando...';try{const U=await S(),L=await U.updateResource(e.id,{title:document.getElementById("ed-title").value,description:document.getElementById("ed-description").value,language:document.getElementById("ed-language").value,license:document.getElementById("ed-license").value,resourceType:document.getElementById("ed-resourceType").value,author:document.getElementById("ed-author")?.value||void 0,keywords:document.getElementById("ed-keywords")?.value||void 0});if(!L.ok){L.details&&L.details.forEach(O=>{const Y=document.getElementById(`ed-${O.field}-error`);Y&&(Y.textContent=O.message);const X=document.getElementById(`ed-${O.field}`);X&&X.setAttribute("aria-invalid","true")}),p.textContent=L.error??"Error al guardar",p.style.display="block";return}if(l){o.innerHTML='<span class="material-symbols-outlined">hourglass_empty</span>Generando .elpx...',await U.generateElpx(e.id),window.location.href=g(`editar?id=${e.id}`);return}y.textContent="Cambios guardados correctamente",y.style.display="block",setTimeout(()=>{y.style.display="none"},3e3)}catch{p.textContent="Error de conexión",p.style.display="block"}finally{o.disabled=!1,o.innerHTML=`<span class="material-symbols-outlined">save</span>${l?"Crear recurso":"Guardar cambios"}`}}),V.querySelectorAll(".edit-wf-btn").forEach(a=>{a.addEventListener("click",async()=>{const o=a.dataset.status;p.style.display="none",y.style.display="none";try{await(await S()).updateResourceStatus(e.id,o),y.textContent=`Estado actualizado a "${z[o]?.label??o}"`,y.style.display="block",setTimeout(()=>window.location.reload(),800)}catch{p.textContent="Error al cambiar el estado",p.style.display="block"}})});const T=document.getElementById("apply-elpx-meta");T&&t?.metadata&&T.addEventListener("click",()=>{const a=t.metadata;if(a.title&&(document.getElementById("ed-title").value=a.title),a.description&&(document.getElementById("ed-description").value=a.description),a.author&&(document.getElementById("ed-author").value=a.author),a.language){const o=document.getElementById("ed-language");o.querySelector(`option[value="${a.language}"]`)&&(o.value=a.language)}if(a.license){const o=document.getElementById("ed-license");o.querySelector(`option[value="${a.license}"]`)&&(o.value=a.license)}T.innerHTML='<span class="material-symbols-outlined">check</span>Metadatos aplicados',T.disabled=!0});const h=document.getElementById("open-exe-editor");h&&(async()=>{try{const o=await(await S()).getElpxProject(e.id);o?h.addEventListener("click",()=>{de(e.id,o.hash,o.elpxFileUrl,o.originalFilename)}):(h.setAttribute("disabled","true"),h.title="No hay archivo .elpx asociado")}catch{h.setAttribute("disabled","true")}})();const f=document.getElementById("edit-dropzone"),k=document.getElementById("edit-file-input"),M=document.getElementById("edit-upload-status");f&&k&&M&&(k.addEventListener("change",()=>{const a=k.files?.[0];a&&K(a,e.id,M)}),f.addEventListener("dragover",a=>{a.preventDefault(),f.classList.add("is-dragover")}),f.addEventListener("dragleave",()=>{f.classList.remove("is-dragover")}),f.addEventListener("drop",a=>{a.preventDefault(),f.classList.remove("is-dragover");const o=a.dataTransfer?.files[0];o&&K(o,e.id,M)}))}async function K(e,i,t){t.textContent="Subiendo archivo...",t.className="edit-upload-status edit-upload-loading",t.style.display="block";try{if(window.__PREVIEW_MODE__){const{saveElpxInPreview:n}=await A(async()=>{const{saveElpxInPreview:s}=await import("./elpx-preview-service.BnsKTYrq.js");return{saveElpxInPreview:s}},__vite__mapDeps([3,1]));await n({resourceId:i,blob:e,filename:e.name})}else{const n=new FormData;n.append("file",e);const s=await fetch(g(`api/admin/elpx/upload/${i}`),{method:"POST",credentials:"include",body:n});if(!s.ok){const c=await s.json().catch(()=>({}));throw new Error(c.error||"Error al subir")}}t.textContent=`Archivo "${e.name}" subido correctamente. Recargando...`,t.className="edit-upload-status edit-upload-success",setTimeout(()=>window.location.reload(),1e3)}catch(l){t.textContent=`Error: ${l.message||"No se pudo subir el archivo"}`,t.className="edit-upload-status edit-upload-error"}}let G=!1,E=!1,$=!1,w=null,Z=null,ee=null,F=null,se=0;const H=document.getElementById("exe-editor-modal"),C=document.getElementById("exe-iframe"),r=document.getElementById("exe-status"),v=document.getElementById("exe-save-btn"),ne=document.getElementById("exe-close-btn"),x=document.getElementById("exe-saving-overlay"),R=!!window.__PREVIEW_MODE__;function P(e){return`${e}-${Date.now()}-${++se}`}function I(e,i){C.contentWindow?.postMessage(e,"*",i??[])}function de(e,i,t,l){if(F=e,w=i,Z=t,ee=l,G=!1,E=!1,$=!1,v.disabled=!0,r.textContent="Cargando editor...",H.style.display="flex",document.body.style.overflow="hidden",R)C.src=g("exelearning-editor-loader.html")+`?resourceId=${e}`;else{const n=g("api/v1/exelearning-editor/index.html"),s=t?encodeURIComponent(t):"";C.src=`${n}?elpxUrl=${s}&resourceId=${e}`}}function te(e=!1){$&&!e&&!confirm("Hay cambios sin guardar. ¿Cerrar?")||(H.style.display="none",C.src="about:blank",document.body.style.overflow="")}async function re(e){E=!0,v.disabled=!0,r.textContent="Guardando...",x.style.display="flex";try{const i=new Blob([e.bytes],{type:e.mimeType||"application/zip"});if(R){const{saveElpxInPreview:t}=await A(async()=>{const{saveElpxInPreview:n}=await import("./elpx-preview-service.BnsKTYrq.js");return{saveElpxInPreview:n}},__vite__mapDeps([3,1]));w=(await t({resourceId:F,blob:i,filename:e.filename||"project.elpx",existingHash:w||void 0})).hash,I({type:"WP_SAVE_CONFIRMED",requestId:P("confirmed")})}else{const t=new FormData;if(t.append("file",i,e.filename||"project.elpx"),!(await fetch(g(`api/admin/elpx/save/${F}`),{method:"POST",credentials:"include",body:t})).ok)throw new Error("Error al guardar");I({type:"WP_SAVE_CONFIRMED",requestId:P("confirmed")})}$=!1,r.textContent="Guardado",x.style.display="none",setTimeout(()=>{te(!0),window.location.reload()},800)}catch(i){r.textContent=`Error: ${i.message}`,v.disabled=!1,x.style.display="none"}finally{E=!1}}async function ce(){if(!R)return;const{loadElpxBlob:e}=await A(async()=>{const{loadElpxBlob:t}=await import("./elpx-preview-service.BnsKTYrq.js");return{loadElpxBlob:t}},__vite__mapDeps([3,1])),i=w?await e(w,Z):null;if(i){const t=await i.arrayBuffer();I({type:"OPEN_FILE",data:{bytes:t,filename:ee||"project.elpx"}},[t])}}window.addEventListener("message",e=>{if(!(!e.data?.type||e.source!==C.contentWindow))switch(e.data.type){case"EXELEARNING_READY":G=!0,r.textContent="Editor listo",I({type:"CONFIGURE",requestId:P("cfg"),data:{hideUI:{fileMenu:!0,saveButton:!0,userMenu:!0}}}),R&&ce();break;case"DOCUMENT_LOADED":r.textContent="Documento cargado",v.disabled=!1;break;case"DOCUMENT_CHANGED":$=!0,r.textContent="Cambios sin guardar",v.disabled=!1;break;case"WP_SAVE_FILE":e.data.bytes&&re(e.data);break;case"WP_REQUEST_SAVE_ERROR":r.textContent=`Error: ${e.data.error}`,v.disabled=!1,E=!1,x.style.display="none";break}});v.addEventListener("click",()=>{E||!G||(E=!0,v.disabled=!0,r.textContent="Exportando...",x.style.display="flex",I({type:"WP_REQUEST_SAVE",requestId:P("export")}))});ne.addEventListener("click",()=>te());window.addEventListener("beforeunload",e=>{$&&H.style.display!=="none"&&e.preventDefault()});oe();
