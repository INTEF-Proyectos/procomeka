/**
 * Contenido educativo HTML para los 22 recursos demo.
 * Cada recurso tiene 2-3 páginas con texto coherente con su temática.
 */

export interface ElpxPageContent {
	title: string;
	html: string;
}

export const ELPX_CONTENT: Record<string, ElpxPageContent[]> = {
	"res-01": [
		{
			title: "Introducción a la IA y la ética",
			html: `<h2>Objetivos de aprendizaje</h2>
<p>Al finalizar esta secuencia didáctica, el alumnado será capaz de:</p>
<ul>
<li>Definir qué es la inteligencia artificial y sus principales aplicaciones actuales.</li>
<li>Identificar dilemas éticos asociados al uso de la IA en la sociedad.</li>
<li>Evaluar críticamente el impacto de los sistemas de IA en el ámbito educativo.</li>
</ul>
<h2>¿Qué es la Inteligencia Artificial?</h2>
<p>La inteligencia artificial (IA) es una rama de la informática que busca crear sistemas capaces de realizar tareas que normalmente requieren inteligencia humana: reconocimiento de imágenes, procesamiento del lenguaje natural, toma de decisiones y aprendizaje a partir de datos.</p>
<p>En el ámbito educativo, la IA se utiliza para personalizar el aprendizaje, automatizar la evaluación y ofrecer tutorización adaptativa.</p>`,
		},
		{
			title: "Dilemas éticos de la IA",
			html: `<h2>Casos de estudio</h2>
<p>Analiza los siguientes escenarios y debate con tu grupo:</p>
<h3>Caso 1: Sesgo algorítmico</h3>
<p>Un sistema de IA utilizado para seleccionar candidatos a un puesto de trabajo muestra preferencia por perfiles masculinos porque fue entrenado con datos históricos donde predominaban los hombres. ¿Quién es responsable de este sesgo? ¿Cómo podría corregirse?</p>
<h3>Caso 2: Privacidad en el aula</h3>
<p>Una plataforma educativa recopila datos sobre el comportamiento del alumnado para mejorar sus recomendaciones. ¿Hasta dónde es aceptable recopilar datos de menores? ¿Qué límites deben existir?</p>
<h3>Caso 3: Autoría y creatividad</h3>
<p>Un estudiante utiliza un generador de texto para escribir un ensayo. ¿Es plagio? ¿Qué diferencia hay entre usar la IA como herramienta y como sustituto del aprendizaje?</p>`,
		},
		{
			title: "Actividades y evaluación",
			html: `<h2>Actividad práctica: Auditoría ética de una IA</h2>
<p>En grupos de 4 personas, elegid una herramienta de IA que utilicéis habitualmente (asistente virtual, recomendador de contenidos, corrector ortográfico, etc.) y realizad una auditoría ética siguiendo esta guía:</p>
<ol>
<li><strong>Transparencia:</strong> ¿Sabéis cómo funciona internamente? ¿Explica sus decisiones?</li>
<li><strong>Datos:</strong> ¿Qué datos recopila? ¿Tenéis control sobre ellos?</li>
<li><strong>Sesgo:</strong> ¿Detectáis algún tipo de sesgo en sus respuestas o recomendaciones?</li>
<li><strong>Impacto:</strong> ¿Qué consecuencias tendría un error de esta IA?</li>
</ol>
<h2>Criterios de evaluación</h2>
<ul>
<li>Identifica al menos 3 implicaciones éticas del uso de IA (30%)</li>
<li>Argumenta con evidencias y ejemplos concretos (30%)</li>
<li>Propone soluciones o alternativas razonadas (20%)</li>
<li>Presenta de forma clara y estructurada (20%)</li>
</ul>`,
		},
	],

	"res-02": [
		{
			title: "IA en el aula: primeros pasos",
			html: `<h2>¿Por qué integrar la IA en tu práctica docente?</h2>
<p>Las herramientas de inteligencia artificial pueden ayudar al profesorado a:</p>
<ul>
<li>Personalizar la experiencia de aprendizaje de cada alumno.</li>
<li>Automatizar tareas repetitivas como la corrección de ejercicios.</li>
<li>Generar materiales didácticos adaptados al nivel del grupo.</li>
<li>Analizar el progreso del alumnado e identificar dificultades.</li>
</ul>
<p>Sin embargo, es fundamental utilizar estas herramientas de forma ética y crítica, entendiendo sus limitaciones y posibles sesgos.</p>`,
		},
		{
			title: "Herramientas prácticas",
			html: `<h2>Herramientas de IA para el aula</h2>
<h3>1. Generación de contenido</h3>
<p>Los modelos de lenguaje pueden ayudar a crear ejercicios, resúmenes, cuestionarios y rúbricas. Úsalos como punto de partida y revisa siempre el resultado.</p>
<h3>2. Corrección asistida</h3>
<p>Existen herramientas que analizan textos del alumnado ofreciendo retroalimentación sobre gramática, coherencia y estructura.</p>
<h3>3. Tutorización adaptativa</h3>
<p>Plataformas que ajustan la dificultad y el ritmo del contenido según el rendimiento individual.</p>
<h2>Buenas prácticas</h2>
<ul>
<li>Informa siempre al alumnado de cuándo se usa IA.</li>
<li>No delegues decisiones pedagógicas importantes exclusivamente en la IA.</li>
<li>Verifica la información generada antes de compartirla.</li>
<li>Protege los datos personales del alumnado.</li>
</ul>`,
		},
	],

	"res-03": [
		{
			title: "¿Qué es un bot?",
			html: `<h2>Descubriendo los bots</h2>
<p>Un bot es un programa informático diseñado para realizar tareas de forma automática. Los bots están en todas partes: desde los asistentes virtuales de los teléfonos hasta los robots industriales de las fábricas.</p>
<h2>Tipos de bots</h2>
<ul>
<li><strong>Chatbots:</strong> programas que mantienen conversaciones con personas.</li>
<li><strong>Robots físicos:</strong> máquinas que se mueven e interactúan con el entorno.</li>
<li><strong>Bots de software:</strong> programas que automatizan tareas en ordenadores.</li>
</ul>
<p>En este taller vamos a construir nuestro propio bot siguiendo instrucciones paso a paso.</p>`,
		},
		{
			title: "Taller: Construye tu bot",
			html: `<h2>Materiales necesarios</h2>
<ul>
<li>Placa de desarrollo (Arduino o similar)</li>
<li>Servomotores (2 unidades)</li>
<li>Sensor de distancia ultrasónico</li>
<li>Chasis básico (puede ser cartón reciclado)</li>
<li>Cables y pilas</li>
</ul>
<h2>Pasos del taller</h2>
<ol>
<li><strong>Montaje:</strong> Ensambla el chasis y fija los motores siguiendo el esquema.</li>
<li><strong>Conexiones:</strong> Conecta los motores y el sensor a la placa siguiendo el diagrama de pines.</li>
<li><strong>Programación:</strong> Carga el código base que hace que el bot avance y se detenga al detectar un obstáculo.</li>
<li><strong>Prueba:</strong> Coloca obstáculos y observa cómo reacciona tu bot.</li>
<li><strong>Mejora:</strong> Modifica el código para que el bot gire al detectar un obstáculo en lugar de detenerse.</li>
</ol>`,
		},
	],

	"res-04": [
		{
			title: "IA en la investigación",
			html: `<h2>La revolución de la IA en la investigación académica</h2>
<p>La inteligencia artificial está transformando la forma en que se realiza la investigación académica. Desde la búsqueda bibliográfica hasta el análisis de grandes volúmenes de datos, las herramientas de IA ofrecen nuevas posibilidades y plantean nuevos desafíos.</p>
<h2>Aplicaciones principales</h2>
<ul>
<li><strong>Revisión bibliográfica automatizada:</strong> herramientas que rastrean bases de datos académicas y sugieren artículos relevantes.</li>
<li><strong>Análisis de datos:</strong> modelos que identifican patrones en datasets complejos.</li>
<li><strong>Generación de hipótesis:</strong> sistemas que sugieren líneas de investigación basándose en la literatura existente.</li>
<li><strong>Escritura asistida:</strong> correctores avanzados y generadores de resúmenes.</li>
</ul>`,
		},
		{
			title: "Ética y buenas prácticas",
			html: `<h2>Consideraciones éticas en el uso de IA investigadora</h2>
<h3>Integridad académica</h3>
<p>El uso de IA generativa en la escritura académica plantea preguntas sobre autoría y originalidad. Las instituciones deben establecer políticas claras sobre qué usos son aceptables.</p>
<h3>Reproducibilidad</h3>
<p>Cuando se utiliza IA en el análisis de datos, es fundamental documentar los modelos, parámetros y versiones utilizados para garantizar que otros investigadores puedan reproducir los resultados.</p>
<h3>Sesgo en los datos</h3>
<p>Los modelos de IA pueden perpetuar o amplificar sesgos presentes en los datos de entrenamiento. Los investigadores deben ser conscientes de estas limitaciones y documentarlas.</p>`,
		},
	],

	"res-05": [
		{
			title: "Metodologías ágiles",
			html: `<h2>Introducción al desarrollo ágil</h2>
<p>Las metodologías ágiles son un conjunto de prácticas para el desarrollo de software que priorizan la entrega continua de valor, la colaboración con el cliente y la adaptación al cambio.</p>
<h2>Principios fundamentales</h2>
<ul>
<li>Individuos e interacciones sobre procesos y herramientas.</li>
<li>Software funcionando sobre documentación extensiva.</li>
<li>Colaboración con el cliente sobre negociación contractual.</li>
<li>Respuesta ante el cambio sobre seguir un plan.</li>
</ul>
<h2>Scrum en 5 minutos</h2>
<p>Scrum organiza el trabajo en sprints de 1-4 semanas. Cada sprint produce un incremento del producto. Los roles principales son: Product Owner, Scrum Master y equipo de desarrollo.</p>`,
		},
		{
			title: "Asistentes de código con IA",
			html: `<h2>Programación asistida por IA</h2>
<p>Los asistentes de código son herramientas de IA que ayudan a escribir, depurar y refactorizar código. No sustituyen al programador, sino que aumentan su productividad.</p>
<h2>Buenas prácticas</h2>
<ol>
<li>Revisa siempre el código generado antes de integrarlo.</li>
<li>Entiende lo que hace cada línea — no copies ciegamente.</li>
<li>Usa el asistente para tareas repetitivas, no para diseño arquitectónico.</li>
<li>Escribe tests antes de pedir código al asistente (TDD).</li>
</ol>`,
		},
	],

	"res-06": [
		{
			title: "Conocemos a los robots",
			html: `<h2>¡Hola, robots amigos!</h2>
<p>¿Sabéis qué es un robot? Un robot es una máquina que puede moverse y hacer cosas siguiendo las instrucciones que le damos. ¡Como si fuera un juguete muy listo!</p>
<h2>¿Dónde hay robots?</h2>
<ul>
<li>En las fábricas, ayudando a construir coches.</li>
<li>En los hospitales, ayudando a los médicos.</li>
<li>En nuestra casa: la aspiradora robot limpia el suelo sola.</li>
<li>¡Y en el espacio! Los robots exploran otros planetas.</li>
</ul>`,
		},
		{
			title: "Jugamos a ser robots",
			html: `<h2>Actividad: El robot y el programador</h2>
<p>Vamos a jugar por parejas. Uno será el <strong>robot</strong> y el otro será el <strong>programador</strong>.</p>
<h3>Instrucciones</h3>
<ol>
<li>El programador da instrucciones sencillas: "avanza", "gira a la derecha", "gira a la izquierda", "para".</li>
<li>El robot solo puede hacer lo que le dicen. ¡No puede pensar por su cuenta!</li>
<li>El objetivo es que el robot llegue desde un punto hasta otro esquivando los obstáculos.</li>
</ol>
<p>Después cambiad los roles. ¿Quién consigue dar las mejores instrucciones?</p>`,
		},
	],

	"res-07": [
		{
			title: "Algoritmos visuales",
			html: `<h2>¿Qué es un algoritmo?</h2>
<p>Un algoritmo es una serie de pasos ordenados para resolver un problema. ¡Los usamos todos los días sin darnos cuenta! Cuando seguimos una receta de cocina o las instrucciones de un juego, estamos siguiendo un algoritmo.</p>
<h2>Algoritmos con dibujos</h2>
<p>En esta actividad vamos a representar algoritmos de forma visual usando diagramas de colores. Cada color representa una operación:</p>
<ul>
<li><strong>Verde:</strong> sumar</li>
<li><strong>Rojo:</strong> restar</li>
<li><strong>Azul:</strong> comparar (¿cuál es mayor?)</li>
<li><strong>Amarillo:</strong> repetir</li>
</ul>`,
		},
		{
			title: "Actividades interactivas",
			html: `<h2>Actividad 1: Ordena los pasos</h2>
<p>Ordena las tarjetas de colores para que el algoritmo funcione correctamente y calcule la suma de los números del 1 al 10.</p>
<h2>Actividad 2: Encuentra el error</h2>
<p>El siguiente algoritmo visual tiene un error. ¿Puedes encontrarlo y corregirlo?</p>
<h2>Actividad 3: Crea tu algoritmo</h2>
<p>Diseña un algoritmo visual que calcule cuántos días faltan para tu cumpleaños. Usa las tarjetas de colores y compártelo con tu compañero/a.</p>`,
		},
	],

	"res-08": [
		{
			title: "Fracciones en la cocina",
			html: `<h2>Las matemáticas tienen sabor</h2>
<p>¿Sabíais que cada vez que cocinamos estamos usando fracciones? Cuando una receta dice "media taza de harina" o "un cuarto de litro de leche", estamos trabajando con fracciones.</p>
<h2>Conceptos básicos</h2>
<ul>
<li><strong>Fracción:</strong> parte de un todo. Si partimos una pizza en 4 trozos iguales y cogemos 1, tenemos 1/4.</li>
<li><strong>Numerador:</strong> el número de arriba — cuántas partes tomamos.</li>
<li><strong>Denominador:</strong> el número de abajo — en cuántas partes está dividido el todo.</li>
</ul>`,
		},
		{
			title: "Recetas matemáticas",
			html: `<h2>Receta: Bizcocho de limón para 4 personas</h2>
<ul>
<li>1/2 taza de azúcar</li>
<li>3/4 de taza de harina</li>
<li>1/4 de taza de aceite</li>
<li>2 huevos</li>
<li>El zumo de 1 limón</li>
</ul>
<h2>Reto matemático</h2>
<p>Si queremos hacer la receta para <strong>8 personas</strong> (el doble), ¿cuánta cantidad necesitamos de cada ingrediente? Escribe las fracciones:</p>
<ul>
<li>Azúcar: 1/2 × 2 = ___</li>
<li>Harina: 3/4 × 2 = ___</li>
<li>Aceite: 1/4 × 2 = ___</li>
</ul>
<p>Y si queremos hacer la receta para solo <strong>2 personas</strong> (la mitad), ¿cuánto necesitamos?</p>`,
		},
	],

	"res-09": [
		{
			title: "El cambio climático en datos",
			html: `<h2>Datos que hablan</h2>
<p>La temperatura media global ha aumentado aproximadamente 1,1 °C desde la era preindustrial. Este dato, aparentemente pequeño, tiene consecuencias enormes para los ecosistemas y la vida humana.</p>
<h2>Cifras clave</h2>
<ul>
<li>Concentración de CO₂: 421 ppm (partes por millón) — la más alta en 800.000 años.</li>
<li>Nivel del mar: ha subido 20 cm desde 1900 y se acelera.</li>
<li>Hielo ártico: pierde un 13% de su extensión por década.</li>
<li>Eventos extremos: las olas de calor son 5 veces más frecuentes que hace 50 años.</li>
</ul>`,
		},
		{
			title: "Análisis y acción",
			html: `<h2>Actividad: Lee los gráficos</h2>
<p>Observa las siguientes series temporales y responde:</p>
<ol>
<li>¿En qué década se aceleró más el aumento de temperatura?</li>
<li>¿Existe correlación entre las emisiones de CO₂ y la temperatura global?</li>
<li>¿Qué proyección es más probable si no se reducen las emisiones?</li>
</ol>
<h2>¿Qué podemos hacer?</h2>
<p>Aunque el cambio climático es un problema global, las acciones locales son fundamentales:</p>
<ul>
<li>Reducir el consumo energético en el hogar y el centro educativo.</li>
<li>Fomentar el transporte sostenible.</li>
<li>Participar en iniciativas de reforestación y reciclaje.</li>
<li>Exigir políticas climáticas ambiciosas a nuestros representantes.</li>
</ul>`,
		},
	],

	"res-10": [
		{
			title: "Conceptos de movimiento",
			html: `<h2>Física del movimiento</h2>
<p>El movimiento es uno de los fenómenos más fundamentales de la naturaleza. En esta unidad, vamos a explorar los conceptos básicos que nos permiten describir y predecir cómo se mueven los objetos.</p>
<h2>Magnitudes fundamentales</h2>
<ul>
<li><strong>Posición:</strong> dónde está un objeto en un momento dado.</li>
<li><strong>Velocidad:</strong> cuánto cambia la posición por unidad de tiempo (m/s).</li>
<li><strong>Aceleración:</strong> cuánto cambia la velocidad por unidad de tiempo (m/s²).</li>
<li><strong>Fuerza:</strong> lo que causa que un objeto cambie su movimiento (Newton).</li>
</ul>`,
		},
		{
			title: "Laboratorio virtual",
			html: `<h2>Experimento 1: Caída libre</h2>
<p>Suelta una pelota desde diferentes alturas y mide el tiempo que tarda en llegar al suelo. Comprueba que la aceleración es constante (g ≈ 9,8 m/s²).</p>
<h2>Experimento 2: Plano inclinado</h2>
<p>Modifica el ángulo del plano inclinado y observa cómo cambia la aceleración de la bola. ¿Qué relación hay entre el ángulo y la aceleración?</p>
<h2>Experimento 3: Fricción</h2>
<p>Cambia el material de la superficie y observa cómo afecta al movimiento. ¿Por qué los objetos se detienen en la vida real si la primera ley de Newton dice que deberían seguir moviéndose?</p>`,
		},
	],

	"res-11": [
		{
			title: "Geometría a nuestro alrededor",
			html: `<h2>La geometría está en todas partes</h2>
<p>Los edificios, puentes, parques y plazas de tu ciudad están llenos de formas geométricas. Los arquitectos utilizan la geometría para diseñar estructuras bellas, funcionales y seguras.</p>
<h2>Figuras en la arquitectura</h2>
<ul>
<li><strong>Arcos:</strong> semicírculos que distribuyen el peso (acueductos romanos, catedrales).</li>
<li><strong>Triángulos:</strong> la forma más estable — se usan en puentes y tejados.</li>
<li><strong>Cúpulas:</strong> hemisferios que cubren grandes espacios sin columnas.</li>
<li><strong>Espirales:</strong> escaleras de caracol, decoraciones Art Nouveau.</li>
</ul>`,
		},
		{
			title: "Proyecto: Paseo geométrico",
			html: `<h2>Tu misión</h2>
<p>Sal a pasear por tu barrio o ciudad con una cámara (el móvil vale) y fotografía al menos 10 ejemplos de geometría en la arquitectura.</p>
<h2>Ficha de cada fotografía</h2>
<ol>
<li>Nombre del edificio o estructura.</li>
<li>Figuras geométricas identificadas.</li>
<li>¿Por qué crees que el arquitecto eligió esa forma?</li>
<li>Calcula alguna medida (ángulo, proporción, simetría).</li>
</ol>
<h2>Presentación</h2>
<p>Crea un mural digital o físico con tus fotografías y fichas. Presentad los resultados en clase y votad la geometría más sorprendente.</p>`,
		},
	],

	"res-12": [
		{
			title: "Estadística cotidiana",
			html: `<h2>¿Por qué estadística?</h2>
<p>Vivimos rodeados de datos: encuestas electorales, estadísticas deportivas, informes sanitarios, rankings educativos. Saber interpretar estos datos es una competencia fundamental para la ciudadanía del siglo XXI.</p>
<h2>Conceptos esenciales</h2>
<ul>
<li><strong>Media, mediana y moda:</strong> tres formas de resumir un conjunto de datos.</li>
<li><strong>Desviación típica:</strong> cuánto se dispersan los datos respecto a la media.</li>
<li><strong>Correlación:</strong> ¿dos variables están relacionadas? Ojo: correlación no implica causalidad.</li>
<li><strong>Muestra vs. población:</strong> no siempre podemos medir a todos; trabajamos con muestras representativas.</li>
</ul>`,
		},
		{
			title: "Pensamiento crítico con datos",
			html: `<h2>Detecta las trampas</h2>
<p>Los datos pueden manipularse para contar la historia que interese. Aprende a detectar estas técnicas:</p>
<h3>1. Gráficos engañosos</h3>
<p>Un eje Y que no empieza en cero puede exagerar diferencias mínimas. Fíjate siempre en las escalas.</p>
<h3>2. Muestras sesgadas</h3>
<p>"El 90% de nuestros clientes están satisfechos" — ¿a cuántos preguntaron? ¿Solo a los que volvieron a comprar?</p>
<h3>3. Confundir correlación con causalidad</h3>
<p>"Los países que consumen más chocolate tienen más premios Nobel." ¿Significa eso que el chocolate te hace más listo?</p>
<h2>Actividad</h2>
<p>Busca una noticia reciente que use estadísticas y analiza: ¿la interpretación es correcta? ¿Falta contexto? ¿Hay algún sesgo?</p>`,
		},
	],

	"res-13": [
		{
			title: "Tu identidad digital",
			html: `<h2>¿Qué es la identidad digital?</h2>
<p>Tu identidad digital es el conjunto de información sobre ti que existe en internet: fotos, comentarios, perfiles en redes sociales, datos de registro en apps y servicios.</p>
<h2>Riesgos principales</h2>
<ul>
<li><strong>Suplantación de identidad:</strong> alguien se hace pasar por ti.</li>
<li><strong>Ciberacoso:</strong> uso de internet para acosar, intimidar o humillar.</li>
<li><strong>Huella digital permanente:</strong> lo que publicas puede perseguirte años.</li>
<li><strong>Robo de datos:</strong> tus datos personales pueden venderse o usarse sin tu consentimiento.</li>
</ul>`,
		},
		{
			title: "Protege tu identidad",
			html: `<h2>10 reglas de oro para la seguridad digital</h2>
<ol>
<li>Usa contraseñas largas y diferentes para cada servicio.</li>
<li>Activa la verificación en dos pasos siempre que sea posible.</li>
<li>No compartas información personal con desconocidos.</li>
<li>Piensa antes de publicar: ¿quién puede ver esto?</li>
<li>Revisa los permisos de las apps antes de instalarlas.</li>
<li>No hagas clic en enlaces sospechosos.</li>
<li>Mantén actualizados tus dispositivos y aplicaciones.</li>
<li>Usa una conexión segura (evita WiFi públicas para datos sensibles).</li>
<li>Si alguien te acosa en línea, guarda las pruebas y pide ayuda a un adulto.</li>
<li>Respeta la privacidad de los demás: no publiques fotos sin permiso.</li>
</ol>`,
		},
	],

	"res-14": [
		{
			title: "Patrones y secuencias",
			html: `<h2>Pensamos como un ordenador</h2>
<p>¿Sabéis que los ordenadores no piensan como nosotros? Los ordenadores siguen instrucciones muy sencillas, una detrás de otra. Hoy vamos a aprender a pensar como un ordenador, ¡pero sin ordenador!</p>
<h2>Actividad: Completa el patrón</h2>
<p>Observa la secuencia de figuras y dibuja las que faltan:</p>
<ul>
<li>🔴 🔵 🔴 🔵 🔴 ___</li>
<li>⬛ ⬛ ⬜ ⬛ ⬛ ⬜ ___</li>
<li>△ △ ○ △ △ ○ △ ___</li>
</ul>`,
		},
		{
			title: "Juegos de lógica",
			html: `<h2>El laberinto del robot</h2>
<p>Dibuja en el suelo un laberinto con cinta adhesiva. Un compañero será el "robot" y tú serás el "programador". Solo puedes dar estas instrucciones:</p>
<ul>
<li>AVANZA (un paso adelante)</li>
<li>GIRA DERECHA</li>
<li>GIRA IZQUIERDA</li>
</ul>
<p>¡El robot no puede moverse solo! Escribe las instrucciones en tarjetas antes de que el robot empiece a moverse.</p>
<h2>Reto: ¿Cuál es el camino más corto?</h2>
<p>¿Puedes encontrar el camino que use menos instrucciones? ¡Eso es lo que hacen los programadores: encontrar la solución más eficiente!</p>`,
		},
	],

	"res-15": [
		{
			title: "Planifica tu podcast",
			html: `<h2>Antes de grabar: planificación</h2>
<p>Un buen podcast empieza mucho antes de encender el micrófono. La planificación es la fase más importante.</p>
<h2>Pasos previos</h2>
<ol>
<li><strong>Elige un tema:</strong> ¿Sobre qué quieres hablar? Debe ser algo que te apasione y que interese a tu audiencia.</li>
<li><strong>Define tu audiencia:</strong> ¿A quién va dirigido? Esto determinará el tono, el lenguaje y la duración.</li>
<li><strong>Estructura el episodio:</strong> Introducción (30s), desarrollo (5-10 min), cierre (30s).</li>
<li><strong>Escribe un guion:</strong> No hace falta que sea palabra por palabra, pero sí los puntos clave.</li>
<li><strong>Prepara los recursos técnicos:</strong> micrófono, software de grabación, espacio silencioso.</li>
</ol>`,
		},
		{
			title: "Grabación y edición",
			html: `<h2>Grabación</h2>
<ul>
<li>Usa un micrófono externo si es posible (incluso los auriculares del móvil mejoran la calidad).</li>
<li>Graba en un espacio pequeño y con telas (absorben el eco).</li>
<li>Mantén una distancia constante con el micrófono (10-15 cm).</li>
<li>Haz una prueba de sonido antes de empezar.</li>
</ul>
<h2>Edición con software libre</h2>
<p>Audacity es un editor de audio gratuito y multiplataforma que permite:</p>
<ul>
<li>Cortar y pegar fragmentos de audio.</li>
<li>Eliminar ruido de fondo.</li>
<li>Añadir música de introducción y cierre.</li>
<li>Normalizar el volumen.</li>
<li>Exportar en MP3 o WAV.</li>
</ul>`,
		},
	],

	"res-16": [
		{
			title: "Rúbricas digitales: conceptos",
			html: `<h2>¿Qué es una rúbrica?</h2>
<p>Una rúbrica es una herramienta de evaluación que describe criterios de calidad en diferentes niveles de desempeño. Permite una evaluación más transparente, objetiva y formativa.</p>
<h2>Tipos de rúbricas</h2>
<ul>
<li><strong>Holística:</strong> evalúa el trabajo de forma global con una única escala.</li>
<li><strong>Analítica:</strong> evalúa cada criterio por separado, dando retroalimentación más detallada.</li>
</ul>
<h2>Ventajas de las rúbricas digitales</h2>
<ul>
<li>Fáciles de compartir con el alumnado antes de la tarea.</li>
<li>Permiten autoevaluación y evaluación entre iguales.</li>
<li>Generan datos cuantitativos para el seguimiento del progreso.</li>
<li>Se pueden reutilizar y adaptar entre cursos.</li>
</ul>`,
		},
		{
			title: "Diseño y herramientas",
			html: `<h2>Cómo diseñar una buena rúbrica</h2>
<ol>
<li>Define los criterios de evaluación (¿qué quiero evaluar?).</li>
<li>Establece niveles de desempeño (excelente, bien, suficiente, insuficiente).</li>
<li>Describe cada nivel con indicadores observables y medibles.</li>
<li>Comparte la rúbrica con el alumnado antes de la actividad.</li>
<li>Usa la rúbrica también para dar retroalimentación, no solo nota.</li>
</ol>
<h2>Herramientas digitales recomendadas</h2>
<ul>
<li><strong>CoRubrics:</strong> complemento de Google Sheets para crear y gestionar rúbricas colaborativas.</li>
<li><strong>Rubistar:</strong> generador web de rúbricas con plantillas prediseñadas.</li>
<li><strong>Moodle/Campus Virtual:</strong> la mayoría de LMS incluyen herramientas de rúbricas integradas.</li>
</ul>`,
		},
	],

	"res-17": [
		{
			title: "¿Qué es el ABP?",
			html: `<h2>Aprendizaje Basado en Proyectos</h2>
<p>El ABP es una metodología activa en la que el alumnado aprende investigando y dando respuesta a un problema real y complejo. No se trata de hacer un "trabajo" al final del tema, sino de que el proyecto sea el eje vertebrador del aprendizaje.</p>
<h2>Características del ABP</h2>
<ul>
<li>Parte de una pregunta motriz auténtica y relevante.</li>
<li>El alumnado investiga, colabora y crea un producto final.</li>
<li>Integra varias competencias y áreas de conocimiento.</li>
<li>Incluye reflexión y revisión continua.</li>
<li>El producto final se presenta a una audiencia real.</li>
</ul>`,
		},
		{
			title: "Planificación de un proyecto ABP",
			html: `<h2>Fases de un proyecto ABP</h2>
<ol>
<li><strong>Pregunta motriz:</strong> formula una pregunta abierta y desafiante que motive la investigación.</li>
<li><strong>Planificación:</strong> el alumnado planifica qué necesita saber y cómo va a investigarlo.</li>
<li><strong>Investigación:</strong> búsqueda de información, entrevistas, experimentos.</li>
<li><strong>Creación:</strong> desarrollo del producto final (maqueta, informe, app, vídeo, etc.).</li>
<li><strong>Presentación:</strong> el producto se comparte con una audiencia real.</li>
<li><strong>Evaluación:</strong> autoevaluación, coevaluación y evaluación docente con rúbricas.</li>
</ol>
<h2>Ejemplo: ¿Cómo podemos hacer nuestro barrio más sostenible?</h2>
<p>El alumnado investiga el consumo energético, la movilidad y los residuos de su barrio, propone mejoras y las presenta al ayuntamiento.</p>`,
		},
	],

	"res-18": [
		{
			title: "¿Qué es el storytelling digital?",
			html: `<h2>Contar historias con tecnología</h2>
<p>El storytelling digital combina la narrativa tradicional con herramientas digitales: imágenes, audio, vídeo y animaciones. Es una forma poderosa de desarrollar la creatividad, la competencia lingüística y la alfabetización mediática.</p>
<h2>Elementos de una buena historia digital</h2>
<ul>
<li><strong>Personajes:</strong> ¿quién protagoniza la historia?</li>
<li><strong>Conflicto:</strong> ¿qué problema o reto tienen que superar?</li>
<li><strong>Escenario:</strong> ¿dónde y cuándo ocurre?</li>
<li><strong>Desenlace:</strong> ¿cómo se resuelve?</li>
<li><strong>Mensaje:</strong> ¿qué queremos transmitir?</li>
</ul>`,
		},
		{
			title: "Crea tu historia digital",
			html: `<h2>Paso a paso</h2>
<ol>
<li><strong>Elige tu historia:</strong> puede ser un cuento inventado, una anécdota personal o una adaptación de un cuento clásico.</li>
<li><strong>Haz un storyboard:</strong> dibuja las escenas principales en viñetas (6-8 viñetas).</li>
<li><strong>Busca o crea las imágenes:</strong> fotos propias, dibujos escaneados o imágenes libres.</li>
<li><strong>Graba la narración:</strong> lee el texto en voz alta con buena entonación.</li>
<li><strong>Monta todo:</strong> usa una herramienta como Book Creator, Canva o PowerPoint para combinar imágenes, texto y audio.</li>
<li><strong>Comparte:</strong> presenta tu historia digital en clase.</li>
</ol>`,
		},
	],

	"res-19": [
		{
			title: "Primeros pasos con Scratch",
			html: `<h2>¿Qué es Scratch?</h2>
<p>Scratch es un lenguaje de programación visual creado por el MIT. En lugar de escribir código, arrastras bloques de colores que encajan como piezas de un puzle. Es perfecto para aprender a programar desde cero.</p>
<h2>Conceptos básicos</h2>
<ul>
<li><strong>Escenario:</strong> el fondo donde ocurre todo.</li>
<li><strong>Sprites:</strong> los personajes u objetos que se mueven.</li>
<li><strong>Bloques:</strong> las instrucciones de colores que les das a los sprites.</li>
<li><strong>Eventos:</strong> qué hace que algo empiece (clic en bandera verde, presionar una tecla...).</li>
</ul>`,
		},
		{
			title: "Tu primer programa",
			html: `<h2>Actividad: Haz que el gato camine</h2>
<ol>
<li>Abre Scratch en <strong>scratch.mit.edu</strong>.</li>
<li>Verás un gato en el escenario. Es tu primer sprite.</li>
<li>Arrastra el bloque <strong>"al presionar bandera verde"</strong> (eventos).</li>
<li>Debajo, pon <strong>"mover 10 pasos"</strong> (movimiento).</li>
<li>Haz clic en la bandera verde. ¿Qué pasa?</li>
</ol>
<h2>Reto: Haz que el gato rebote</h2>
<p>Añade estos bloques:</p>
<ul>
<li>"por siempre" (control) — para que se repita.</li>
<li>"mover 10 pasos" — dentro del bucle.</li>
<li>"si toca un borde, rebotar" — para que no se salga.</li>
</ul>
<p>¡Experimenta cambiando el número de pasos y añadiendo sonidos!</p>`,
		},
	],

	"res-20": [
		{
			title: "HTML y CSS básico",
			html: `<h2>Fundamentos del diseño web</h2>
<p>Una página web se construye con tres tecnologías fundamentales:</p>
<ul>
<li><strong>HTML:</strong> define la estructura y el contenido (títulos, párrafos, imágenes, enlaces).</li>
<li><strong>CSS:</strong> define la apariencia (colores, fuentes, espaciado, disposición).</li>
<li><strong>JavaScript:</strong> añade interactividad (pero eso lo veremos más adelante).</li>
</ul>
<h2>Estructura básica HTML</h2>
<p>Todo documento HTML tiene esta estructura mínima: doctype, html, head (metadatos) y body (contenido visible). Las etiquetas se abren y se cierran, y pueden anidarse unas dentro de otras.</p>`,
		},
		{
			title: "Diseño responsive",
			html: `<h2>¿Qué es el diseño responsive?</h2>
<p>Un diseño responsive se adapta automáticamente al tamaño de la pantalla: móvil, tablet o escritorio. Hoy en día, más del 60% del tráfico web viene de dispositivos móviles.</p>
<h2>Herramientas clave</h2>
<ul>
<li><strong>Viewport meta tag:</strong> le dice al navegador que ajuste el ancho al dispositivo.</li>
<li><strong>Media queries:</strong> reglas CSS que se aplican según el tamaño de pantalla.</li>
<li><strong>Unidades relativas:</strong> usar %, em, rem, vw en lugar de píxeles fijos.</li>
<li><strong>Flexbox y Grid:</strong> sistemas de layout que facilitan la distribución de elementos.</li>
</ul>
<h2>Ejercicio práctico</h2>
<p>Crea una página con tu currículum que se vea bien en móvil y en escritorio. Usa media queries para cambiar la disposición de las columnas.</p>`,
		},
	],

	"res-21": [
		{
			title: "Conceptos de Machine Learning",
			html: `<h2>¿Qué es el aprendizaje automático?</h2>
<p>El machine learning (ML) es una rama de la IA donde los sistemas aprenden de los datos sin ser programados explícitamente para cada tarea.</p>
<h2>Tipos principales</h2>
<ul>
<li><strong>Aprendizaje supervisado:</strong> el modelo aprende de ejemplos etiquetados (spam/no spam).</li>
<li><strong>Aprendizaje no supervisado:</strong> el modelo encuentra patrones en datos sin etiquetar.</li>
<li><strong>Aprendizaje por refuerzo:</strong> el modelo aprende por prueba y error, recibiendo recompensas.</li>
</ul>
<p><em>Este recurso está en desarrollo. Se añadirán actividades prácticas y ejemplos con herramientas sin código.</em></p>`,
		},
	],

	"res-22": [
		{
			title: "El huerto conectado",
			html: `<h2>Ciencia y tecnología en el huerto</h2>
<p>Este proyecto combina ciencias naturales y tecnología: usaremos sensores IoT para monitorizar las condiciones de un huerto escolar y aprenderemos a analizar los datos recogidos.</p>
<h2>¿Qué vamos a medir?</h2>
<ul>
<li><strong>Humedad del suelo:</strong> ¿cuándo necesitan agua las plantas?</li>
<li><strong>Temperatura ambiente:</strong> ¿cómo afecta al crecimiento?</li>
<li><strong>Luminosidad:</strong> ¿cuántas horas de sol recibe el huerto?</li>
<li><strong>pH del suelo:</strong> ¿es adecuado para los cultivos elegidos?</li>
</ul>`,
		},
		{
			title: "Montaje y análisis",
			html: `<h2>Material necesario</h2>
<ul>
<li>Placa ESP32 o Arduino con módulo WiFi.</li>
<li>Sensores: humedad del suelo, temperatura (DHT22), luminosidad (LDR).</li>
<li>Cables y protoboard.</li>
<li>Acceso a una plataforma de datos (ThingSpeak, Google Sheets).</li>
</ul>
<h2>Análisis de datos</h2>
<p>Cada semana, descargad los datos recogidos y cread gráficos para responder:</p>
<ol>
<li>¿A qué hora del día hay más luz?</li>
<li>¿Cuántas veces por semana necesitamos regar?</li>
<li>¿Hay correlación entre temperatura y crecimiento de las plantas?</li>
</ol>
<p><em>Este recurso está pendiente de revisión editorial.</em></p>`,
		},
	],
};
