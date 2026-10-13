import { useState } from 'react';

const perfil = {
  nombre: 'Juan Pérez',
  rol: 'Aprendiz',
  centro: 'Centro de Biotecnología Agropecuaria (Mosquera)',
  programa: 'Análisis y Desarrollo de Software (ADSO)',
  ficha: '3409609',
  jornada: 'Nocturna',
  habilidades: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS']
};

const talentos = [
  { id: 1, nombre: 'María Pérez', centro: 'Centro de Biotecnología Agropecuaria (Mosquera)', programa: 'ADSO', ficha: '2670123', habilidades: ['React', 'DB', 'JavaScript'], whatsapp: '573001112233' },
  { id: 2, nombre: 'Carlos Gómez', centro: 'Centro de Electricidad y Electrónica', programa: 'Diseño Gráfico', ficha: '2704589', habilidades: ['Figma', 'UI', 'Ilustración'], whatsapp: '573112223344' },
  { id: 3, nombre: 'Ana María Rojas', centro: 'Centro Agropecuario de Mosquera', programa: 'Gestión Logística', ficha: '2890112', habilidades: ['Excel', 'Logística', 'Python'], whatsapp: '573223334455' }
];

const proyectosIniciales = [
  { id: 1, titulo: 'Plataforma IoT para Control de Riego', autor: 'Juan Pérez', descripcion: 'Buscamos un aprendiz con bases de electrónica o Python para sensorizar invernaderos.', habilidades: ['Python', 'IoT'], estado: 'Buscando Equipo' },
  { id: 2, titulo: 'App Móvil de Inventarios Lácteos', autor: 'María Pérez', descripcion: 'Necesitamos gestor de base de datos y diseñador UI para app de control lechero.', habilidades: ['React', 'Figma'], estado: 'Buscando Equipo' }
];

const navegacion = [
  ['directorio', 'Directorio'],
  ['proyectos', 'Proyectos'],
  ['productiva', 'Etapa Productiva']
];

const proyectoVacio = { titulo: '', descripcion: '', habilidad: '' };

export default function App() {
  const [activeTab, setActiveTab] = useState('directorio');
  const [filtros, setFiltros] = useState({ centro: '', programa: '', habilidad: '' });
  const [proyectos, setProyectos] = useState(proyectosIniciales);
  const [nuevoProyecto, setNuevoProyecto] = useState(proyectoVacio);
  const [mensajeAlerta, setMensajeAlerta] = useState(null);

  const talentosFiltrados = talentos.filter(talento => {
    const coincideCentro = talento.centro.toLowerCase().includes(filtros.centro.toLowerCase());
    const coincidePrograma = talento.programa.toLowerCase().includes(filtros.programa.toLowerCase());
    const coincideHabilidad = talento.habilidades.some(habilidad =>
      habilidad.toLowerCase().includes(filtros.habilidad.toLowerCase())
    );

    return coincideCentro && coincidePrograma && coincideHabilidad;
  });

  function manejarPublicacionProyecto(evento) {
    evento.preventDefault();

    const proyectosDelUsuario = proyectos.filter(proyecto => proyecto.autor === perfil.nombre);

    if (proyectosDelUsuario.length >= 3) {
      setMensajeAlerta({ tipo: 'error', texto: 'Error (RN01): Ha alcanzado el límite máximo de 3 proyectos activos simultáneamente.' });
      return;
    }

    if (!nuevoProyecto.titulo || !nuevoProyecto.descripcion || !nuevoProyecto.habilidad) {
      setMensajeAlerta({ tipo: 'error', texto: 'Por favor complete todos los campos obligatorios del proyecto.' });
      return;
    }

    const proyecto = {
      ...nuevoProyecto,
      id: proyectos.length + 1,
      autor: perfil.nombre,
      habilidades: [nuevoProyecto.habilidad],
      estado: 'Buscando Equipo'
    };

    setProyectos([proyecto, ...proyectos]);
    setNuevoProyecto(proyectoVacio);

    setMensajeAlerta(
      proyectosDelUsuario.length === 2
        ? { tipo: 'aviso', texto: 'Aviso: Ha alcanzado el límite máximo (3) de proyectos permitidos activos.' }
        : { tipo: 'exito', texto: '¡Proyecto publicado exitosamente!' }
    );
  }

  function actualizarFiltro(campo, valor) {
    setFiltros({ ...filtros, [campo]: valor });
  }

  function actualizarProyecto(campo, valor) {
    setNuevoProyecto({ ...nuevoProyecto, [campo]: valor });
  }

  const botonesNavegacion = navegacion.map(([pestana, texto]) => (
    <button
      key={pestana}
      onClick={() => setActiveTab(pestana)}
    >
      [{texto}]
    </button>
  ));

  return (
    <div>
      {/* Barra de Navegación Superior */}
      <header>
        <div>
          <div>
            <div>SENA</div>
            <span>[ SENA COLAB ]</span>
          </div>
          <nav>
            {botonesNavegacion}
            <button
              onClick={() => setActiveTab('perfil')}
            >
              [Mi Perfil ({perfil.nombre.split(' ')[0]})]
            </button>
          </nav>
        </div>
      </header>

      {/* Contenido Principal */}
      <main>

        {/* PESTAÑA 1: DIRECTORIO DE TALENTOS */}
        {activeTab === 'directorio' && (
          <div>
            {/* Buscador Inteligente / Wireframe G */}
            <div>
              <h2>
                 BUSCADOR DE TALENTO TECNOLÓGICO
              </h2>
              <div>
                <select
                  value={filtros.centro}
                  onChange={(e) => actualizarFiltro('centro', e.target.value)}
                >
                  <option value="">Centro de Formación (Todos)</option>
                  <option value="Mosquera">Centro de Biotecnología Agropecuaria (Mosquera)</option>
                  <option value="Electricidad">Centro de Electricidad y Electrónica</option>
                  <option value="Agropecuario">Centro Agropecuario de Mosquera</option>
                </select>

                <select
                  value={filtros.programa}
                  onChange={(e) => actualizarFiltro('programa', e.target.value)}
                >
                  <option value="">Programa (Todos)</option>
                  <option value="ADSO">ADSO (Análisis y Desarrollo de Software)</option>
                  <option value="Diseño Gráfico">Diseño Gráfico</option>
                  <option value="Gestión Logística">Gestión Logística</option>
                </select>

                <input
                  type="text"
                  placeholder="Habilidad (ej. Python, React)"
                  value={filtros.habilidad}
                  onChange={(e) => actualizarFiltro('habilidad', e.target.value)}
                />
              </div>
              <div>
                <button
                >
                   Buscar Talentos
                </button>
              </div>
            </div>

            {/* Resultados */}
            <div>
              <h3>👥 RESULTADOS ({talentosFiltrados.length})</h3>
              <div>
                {talentosFiltrados.map(talento => (
                  <div key={talento.id}>
                    <div>
                      <div>
                        <div>
                          {talento.nombre.charAt(0)}
                        </div>
                        <div>
                          <h4>{talento.nombre}</h4>
                          <p> {talento.programa} - Ficha {talento.ficha}</p>
                          <p> {talento.centro}</p>
                        </div>
                      </div>
                      <div>
                        <span>🛠️ Habilidades:</span>
                        <div>
                          {talento.habilidades.map((h, i) => (
                            <span key={i}>{h}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <a
                      href={`https://wa.me/${talento.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                       Contactar WhatsApp
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: TABLERO DE PROYECTOS (MATCHMAKING) */}
        {activeTab === 'proyectos' && (
          <div>
            <div>
              <h2> Tablero de Proyectos Colaborativos (HU03)</h2>
              <p>Publica solicitudes de equipo para tus proyectos formativos. (Regla RN01: Máximo 3 proyectos activos por aprendiz).</p>

              {/* Mensajes de Alerta / Hallazgos del Taller */}
              {mensajeAlerta && (
                <div>
                  {mensajeAlerta.texto}
                </div>
              )}

              <form onSubmit={manejarPublicacionProyecto}>
                <div>
                  <input
                    type="text"
                    placeholder="Título del Proyecto"
                    value={nuevoProyecto.titulo}
                    onChange={(e) => actualizarProyecto('titulo', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Habilidad técnica requerida (ej. React, Python)"
                    value={nuevoProyecto.habilidad}
                    onChange={(e) => actualizarProyecto('habilidad', e.target.value)}
                  />
                </div>
                <textarea
                  placeholder="Descripción de la necesidad del equipo o perfil que buscas..."
                  rows="3"
                  value={nuevoProyecto.descripcion}
                  onChange={(e) => actualizarProyecto('descripcion', e.target.value)}
                ></textarea>
                <button
                  type="submit"
                >
                   Publicar Proyecto de Aula
                </button>
              </form>
            </div>

            {/* Listado de Proyectos */}
            <div>
              <h3> Proyectos Buscando Equipo ({proyectos.length})</h3>
              <div>
                {proyectos.map(proj => (
                  <div key={proj.id}>
                    <div>
                      <div>
                        <h4>{proj.titulo}</h4>
                        <span>{proj.estado}</span>
                      </div>
                      <p>Liderado por: <span>{proj.autor}</span></p>
                      <p>{proj.descripcion}</p>
                      <div>
                        {proj.habilidades.map((h, i) => (
                          <span key={i}>Req: {h}</span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Solicitud de postulación enviada a ${proj.autor}. ¡Pronto se pondrán en contacto contigo!`)}
                    >
                       Unirme al Equipo
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 3: ETAPA PRODUCTIVA Y EGRESADOS */}
        {activeTab === 'productiva' && (
          <div>
            <div>
              <h2> Radar de Etapa Productiva y Red de Egresados</h2>
              <p>Espacio para orientación, consejos de contratación de aprendizaje y mentores egresados.</p>

              <div>
                <div>
                  <h4> Tips de Entrevista SENA</h4>
                  <p>Recomendaciones para destacar en tus entrevistas con empresas patrocinadoras y portales de empleo.</p>
                </div>
                <div>
                  <h4> Red de Mentores Egresados</h4>
                  <p>Conecta con ex-aprendices que ya laboran en el sector tecnológico y de agrobiotecnología regional.</p>
                </div>
                <div>
                  <h4> Convocatorias Abiertas</h4>
                  <p>Enlaces y guías simplificadas para postulación a contratos de aprendizaje vigentes.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 4: MI PERFIL */}
        {activeTab === 'perfil' && (
          <div>
            <h2>👤 Mi Perfil Académico (HU01 / RF02)</h2>
            <div>
              <div>
                <div>
                  <label>Nombre Completo</label>
                  <input type="text" value={perfil.nombre} readOnly />
                </div>
                <div>
                  <label>Rol en la plataforma</label>
                  <input type="text" value={perfil.rol} readOnly />
                </div>
              </div>

              <div>
                <label>Centro de Formación</label>
                <input type="text" value={perfil.centro} readOnly />
              </div>

              <div>
                <div>
                  <label>Programa</label>
                  <input type="text" value={perfil.programa} readOnly />
                </div>
                <div>
                  <label>Número de Ficha</label>
                  <input type="text" value={perfil.ficha} readOnly />
                </div>
                <div>
                  <label>Jornada</label>
                  <input type="text" value={perfil.jornada} readOnly />
                </div>
              </div>

              <div>
                <label>Mis Habilidades Técnicas (Etiquetas)</label>
                <div>
                  {perfil.habilidades.map(habilidad => (
                    <span key={habilidad}>{habilidad}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Pie de página institucional */}
      <footer>
        <p>SENA Colab • Centro de Biotecnología Agropecuaria (Regional Cundinamarca)</p>
        <p>Ficha 3409609 • Proyecto Formativo - Taller 02</p>
      </footer>
    </div>
  );
}