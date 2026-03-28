import{g as u}from"./get-api-client.C10olWbB.js";import{u as s}from"./paths.DDXL0-p6.js";import"./preload-helper.Bm1e3cF6.js";const p={draft:"Borrador",review:"En revisión",published:"Publicado",archived:"Archivado"},t=document.getElementById("resource-detail"),h=new URLSearchParams(window.location.search),o=h.get("slug");async function $(){if(!o){t.innerHTML=`<p>No se especificó un recurso.</p><a href='${s("")}'>Volver al inicio</a>`;return}try{const n=await u(),e=await n.getResourceBySlug(o);if(!e){t.innerHTML=`<p>Recurso no encontrado.</p><a href='${s("")}'>Volver al inicio</a>`;return}let i="";try{const a=await n.getSession();if(a?.user){const d=a.user.role??"reader";["reader","author","curator","admin"].indexOf(d)>=1&&(i=`<a href="${s(`admin/recursos/editar?id=${e.id}`)}" class="btn-edit" aria-label="Editar recurso">Editar</a>`)}}catch{}const r=e.editorialStatus??"draft",c=p[r]??r,l=e.mediaItems?.length?`
					<section class="attachments">
						<h2>Archivos</h2>
						<ul class="attachment-list">
							${e.mediaItems.map(a=>`
								<li class="attachment-item">
									<a href="${a.url}" class="attachment-link" download>
										${a.filename??"Archivo adjunto"}
									</a>
									${a.fileSize?`<span class="attachment-meta">${new Intl.NumberFormat("es-ES").format(a.fileSize)} bytes</span>`:""}
								</li>
							`).join("")}
						</ul>
					</section>
				`:"";t.innerHTML=`
				<nav class="breadcrumb"><a href="${s("")}">Recursos</a> / ${e.title}</nav>
				<div class="title-row">
					<h1>${e.title}</h1>
					${i}
				</div>
				<div class="meta">
					<span class="badge">${e.resourceType}</span>
					<span class="badge badge-${r}">${c}</span>
					<span>${e.language}</span>
					<span>${e.license}</span>
				</div>
				<p class="description">${e.description}</p>
				${e.createdByName?`<p class="field"><strong>Autor:</strong> ${e.createdByName}</p>`:e.author?`<p class="field"><strong>Autor:</strong> ${e.author}</p>`:""}
				${e.publisher?`<p class="field"><strong>Editor:</strong> ${e.publisher}</p>`:""}
				${e.keywords?`<p class="field"><strong>Palabras clave:</strong> ${e.keywords}</p>`:""}
				${e.subjects?.length?`<p class="field"><strong>Materias:</strong> ${e.subjects.join(", ")}</p>`:""}
				${e.levels?.length?`<p class="field"><strong>Niveles:</strong> ${e.levels.join(", ")}</p>`:""}
				${l}
			`}catch{t.innerHTML="<p>Error al cargar el recurso.</p>"}}$();
