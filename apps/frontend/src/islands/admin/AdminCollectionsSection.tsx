import { CollectionsCrudIsland } from "../crud/CollectionsCrudIsland.tsx";

export function AdminCollectionsSection() {
	return (
		<section>
			<div className="admin-section-header">
				<h1>Gestion de Colecciones</h1>
				<p>Curación editorial de colecciones, portada pública y asociación de recursos existentes.</p>
			</div>
			<CollectionsCrudIsland />
		</section>
	);
}
