import { useState } from 'react';
import './App.css';

const perfil = {
  nombre: 'Juan Pérez',
  rol: 'Aprendiz',
  centro: 'Centro de Biotecnología Agropecuaria (Mosquera)',
  programa: 'Análisis y Desarrollo de Software (ADSO)',
  ficha: '3409609',
  jornada: 'Mixta',
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
      className={`nav-button ${activeTab === pestana ? 'is-active' : ''}`}
      onClick={() => setActiveTab(pestana)}
    >
      {texto}
    </button>
  ));

  return (
    <div className="app-shell">
      {/* Barra de Navegación Superior */}
      <header className="app-header">
        <div className="header-inner">
          <div className="brand-block">
            <div className="brand-badge">SENA</div>
            <span className="brand-name">SENA NEXO</span>
          </div>
          <nav className="main-nav">
            {botonesNavegacion}
            <button
              className={`nav-button profile-button ${activeTab === 'perfil' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('perfil')}
            >
              Mi Perfil ({perfil.nombre.split(' ')[0]})
            </button>
          </nav>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="page-content">

        {/* PESTAÑA 1: DIRECTORIO DE TALENTOS */}
        {activeTab === 'directorio' && (
          <div className="panel-wrap">
            {/* Buscador Inteligente / Wireframe G */}
            <div className="panel search-panel">
              <h2 className="section-title">
                 BUSCADOR DE TALENTO TECNOLÓGICO
              </h2>
              <div className="filters-grid">
                <select
                  className="field"
                  value={filtros.centro}
                  onChange={(e) => actualizarFiltro('centro', e.target.value)}
                >
                  <option value="">Centro de Formación (Todos)</option>
                  <option value="Mosquera">Centro de Biotecnología Agropecuaria (Mosquera)</option>
                  <option value="Electricidad">Centro de Electricidad y Electrónica</option>
                  <option value="Agropecuario">Centro Agropecuario de Mosquera</option>
                </select>

                <select
                  className="field"
                  value={filtros.programa}
                  onChange={(e) => actualizarFiltro('programa', e.target.value)}
                >
                  <option value="">Programa (Todos)</option>
                  <option value="ADSO">ADSO (Análisis y Desarrollo de Software)</option>
                  <option value="Diseño Gráfico">Diseño Gráfico</option>
                  <option value="Gestión Logística">Gestión Logística</option>
                </select>

                <input
                  className="field"
                  type="text"
                  placeholder="Habilidad (ej. Python, React)"
                  value={filtros.habilidad}
                  onChange={(e) => actualizarFiltro('habilidad', e.target.value)}
                />
              </div>
              <div className="actions-row">
                <button className="primary-button">
                   Buscar Talentos
                </button>
              </div>
            </div>

            {/* Resultados */}
            <div className="panel results-panel">
              <h3 className="results-title"><span className="mini-icon">•</span> RESULTADOS ({talentosFiltrados.length})</h3>
              <div className="cards-grid">
                {talentosFiltrados.map(talento => (
                  <div key={talento.id} className="talent-card">
                    <div className="card-head">
                      <div className="avatar">{talento.nombre.charAt(0)}</div>
                      <div className="talent-meta">
                        <h4>{talento.nombre}</h4>
                        <p> {talento.programa} - Ficha {talento.ficha}</p>
                        <p> {talento.centro}</p>
                      </div>
                    </div>
                    <div className="skill-block">
                        <span className="label-row"><span className="mini-icon">◦</span> Habilidades:</span>
                        <div className="tags-row">
                          {talento.habilidades.map((h, i) => (
                            <span className="tag" key={i}>{h}</span>
                          ))}
                        </div>
                    </div>
                    <a
                      className="wa-link"
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
          <div className="panel-wrap">
            <div className="panel project-panel">
              <h2 className="section-title"> Tablero de Proyectos Colaborativos (HU03)</h2>
              <p className="section-subtitle">Publica solicitudes de equipo para tus proyectos formativos. (Regla RN01: Máximo 3 proyectos activos por aprendiz).</p>

              {/* Mensajes de Alerta / Hallazgos del Taller */}
              {mensajeAlerta && (
                <div className={`alert-message ${mensajeAlerta.tipo}`}>
                  {mensajeAlerta.texto}
                </div>
              )}

              <form className="project-form" onSubmit={manejarPublicacionProyecto}>
                <div className="form-row">
                  <input
                    className="field"
                    type="text"
                    placeholder="Título del Proyecto"
                    value={nuevoProyecto.titulo}
                    onChange={(e) => actualizarProyecto('titulo', e.target.value)}
                  />
                  <input
                    className="field"
                    type="text"
                    placeholder="Habilidad técnica requerida (ej. React, Python)"
                    value={nuevoProyecto.habilidad}
                    onChange={(e) => actualizarProyecto('habilidad', e.target.value)}
                  />
                </div>
                <textarea
                  className="field textarea"
                  placeholder="Descripción de la necesidad del equipo o perfil que buscas..."
                  rows="3"
                  value={nuevoProyecto.descripcion}
                  onChange={(e) => actualizarProyecto('descripcion', e.target.value)}
                ></textarea>
                <button
                  className="primary-button"
                  type="submit"
                >
                   Publicar Proyecto de Aula
                </button>
              </form>
            </div>

            {/* Listado de Proyectos */}
            <div className="panel results-panel">
              <h3 className="results-title"> Proyectos Buscando Equipo ({proyectos.length})</h3>
              <div className="cards-grid">
                {proyectos.map(proj => (
                  <div key={proj.id} className="project-card">
                    <div className="project-head">
                      <div>
                        <h4>{proj.titulo}</h4>
                        <span className="project-status">{proj.estado}</span>
                      </div>
                    </div>
                    <p className="project-author">Liderado por: <span>{proj.autor}</span></p>
                    <p>{proj.descripcion}</p>
                    <div className="tags-row">
                        {proj.habilidades.map((h, i) => (
                          <span className="tag tag-muted" key={i}>Req: {h}</span>
                        ))}
                    </div>
                    <button
                      className="secondary-button"
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
          <div className="panel-wrap">
            <div className="panel">
              <h2 className="section-title"> Radar de Etapa Productiva y Red de Egresados</h2>
              <p className="section-subtitle">Espacio para orientación, consejos de contratación de aprendizaje y mentores egresados.</p>

              <div className="info-grid">
                <div className="info-card">
                  <h4> Tips de Entrevista SENA</h4>
                  <p>Recomendaciones para destacar en tus entrevistas con empresas patrocinadoras y portales de empleo.</p>
                </div>
                <div className="info-card">
                  <h4> Red de Mentores Egresados</h4>
                  <p>Conecta con ex-aprendices que ya laboran en el sector tecnológico y de agrobiotecnología regional.</p>
                </div>
                <div className="info-card">
                  <h4> Convocatorias Abiertas</h4>
                  <p>Enlaces y guías simplificadas para postulación a contratos de aprendizaje vigentes.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 4: MI PERFIL */}
        {activeTab === 'perfil' && (
          <div className="panel-wrap">
            <div className="panel profile-panel">
              <h2 className="section-title"><span className="mini-icon">◌</span> Mi Perfil Académico (HU01 / RF02)</h2>
              <div className="profile-grid">
                <div className="form-row compact-row">
                  <div className="field-group">
                    <label>Nombre Completo</label>
                    <input className="field" type="text" value={perfil.nombre} readOnly />
                  </div>
                  <div className="field-group">
                    <label>Rol en la plataforma</label>
                    <input className="field" type="text" value={perfil.rol} readOnly />
                  </div>
                </div>

                <div className="field-group">
                  <label>Centro de Formación</label>
                  <input className="field" type="text" value={perfil.centro} readOnly />
                </div>

                <div className="form-row compact-row">
                  <div className="field-group">
                    <label>Programa</label>
                    <input className="field" type="text" value={perfil.programa} readOnly />
                  </div>
                  <div className="field-group">
                    <label>Número de Ficha</label>
                    <input className="field" type="text" value={perfil.ficha} readOnly />
                  </div>
                  <div className="field-group">
                    <label>Jornada</label>
                    <input className="field" type="text" value={perfil.jornada} readOnly />
                  </div>
                </div>

                <div className="field-group">
                  <label>Mis Habilidades Técnicas (Etiquetas)</label>
                  <div className="tags-row">
                    {perfil.habilidades.map(habilidad => (
                      <span className="tag" key={habilidad}>{habilidad}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Pie de página institucional */}
      <footer className="app-footer">
        <p>SENA NEXO • Centro de Biotecnología Agropecuaria (Regional Cundinamarca)</p>
        <p>Ficha 3409609 • Proyecto Formativo - Taller Formativo</p>
      </footer>
    </div>
  );
}