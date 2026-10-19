import { useEffect, useState } from 'react';
import './App.css';

async function solicitarApi(ruta, opciones = {}) {
  const respuesta = await fetch(ruta, {
    ...opciones,
    headers: {
      ...(opciones.body ? { 'Content-Type': 'application/json' } : {}),
      ...opciones.headers
    }
  });
  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(resultado.error || `La solicitud falló (${respuesta.status}).`);
  }

  return resultado;
}

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

function AuthScreen({ modo, setModo, mensaje, onRegister, onLogin }) {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [perfil, setPerfil] = useState({
    nombre: '',
    rol: 'Aprendiz',
    centro: '',
    programa: '',
    ficha: '',
    jornada: '',
    habilidades: ''
  });
  const camposPerfil = [
    ['nombre', 'Nombre completo'],
    ['rol', 'Rol en la plataforma'],
    ['centro', 'Centro de formación'],
    ['programa', 'Programa'],
    ['ficha', 'Número de ficha'],
    ['jornada', 'Jornada']
  ];

  function enviarFormulario(evento) {
    evento.preventDefault();
    if (modo === 'login') {
      onLogin({ email, contrasena });
      return;
    }

    onRegister({
      email,
      contrasena,
      perfil: {
        ...perfil,
        nombre: perfil.nombre.trim(),
        habilidades: perfil.habilidades.split(',').map(habilidad => habilidad.trim()).filter(Boolean)
      }
    });
  }

  return (
    <div className="app-shell">
      <main className="auth-layout">
        <section className="panel auth-card">
          <div className="brand-block auth-brand">
            <div className="brand-badge">SENA</div>
            <span className="brand-name">SENA NEXO</span>
          </div>
          <h1 className="section-title">{modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h1>
          <p className="section-subtitle">
            {modo === 'login' ? 'Ingresa con el correo y la contraseña de tu cuenta.' : 'Registra tus datos para crear tu perfil académico.'}
          </p>
          {mensaje && (
            <div className={`alert-message ${mensaje.startsWith('No se pudo') || mensaje.startsWith('Correo o') || mensaje.startsWith('Ya existe') ? 'error' : 'exito'}`} role="status">
              {mensaje}
            </div>
          )}
          <form className="auth-form" onSubmit={enviarFormulario}>
            {modo === 'register' && (
              <>
                {camposPerfil.map(([campo, etiqueta]) => (
                  <div className="field-group" key={campo}>
                    <label htmlFor={`register-${campo}`}>{etiqueta}</label>
                    <input
                      id={`register-${campo}`}
                      className="field"
                      value={perfil[campo]}
                      onChange={evento => setPerfil({ ...perfil, [campo]: evento.target.value })}
                      required
                    />
                  </div>
                ))}
                <div className="field-group">
                  <label htmlFor="register-skills">Habilidades (separadas por comas)</label>
                  <input
                    id="register-skills"
                    className="field"
                    value={perfil.habilidades}
                    onChange={evento => setPerfil({ ...perfil, habilidades: evento.target.value })}
                    placeholder="React, JavaScript, SQL"
                  />
                </div>
              </>
            )}
            <div className="field-group">
              <label htmlFor="auth-email">Correo electrónico</label>
              <input id="auth-email" className="field" type="email" autoComplete="email" value={email} onChange={evento => setEmail(evento.target.value)} required />
            </div>
            <div className="field-group">
              <label htmlFor="auth-password">Contraseña</label>
              <input id="auth-password" className="field" type="password" autoComplete={modo === 'login' ? 'current-password' : 'new-password'} minLength="8" value={contrasena} onChange={evento => setContrasena(evento.target.value)} required />
              {modo === 'register' && <small>Debe tener al menos 8 caracteres.</small>}
            </div>
            <button className="primary-button" type="submit">
              {modo === 'login' ? 'Iniciar sesión' : 'Registrar usuario'}
            </button>
          </form>
          <p className="auth-switch">
            {modo === 'login' ? '¿Aún no tienes cuenta?' : '¿Ya tienes una cuenta?'}{' '}
            <button className="text-button" type="button" onClick={() => setModo(modo === 'login' ? 'register' : 'login')}>
              {modo === 'login' ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </p>
          <p className="storage-note">
            Las cuentas y contraseñas se guardan en el servidor de la aplicación.
          </p>
        </section>
      </main>
      <footer className="app-footer">
        <p>SENA NEXO • Centro de Biotecnología Agropecuaria (Regional Cundinamarca)</p>
      </footer>
    </div>
  );
}

export default function App() {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [modoAutenticacion, setModoAutenticacion] = useState('login');
  const [mensajeAutenticacion, setMensajeAutenticacion] = useState('');
  const [activeTab, setActiveTab] = useState('directorio');
  const [filtros, setFiltros] = useState({ centro: '', programa: '', habilidad: '' });
  const [proyectos, setProyectos] = useState(proyectosIniciales);
  const [nuevoProyecto, setNuevoProyecto] = useState(proyectoVacio);
  const [mensajeAlerta, setMensajeAlerta] = useState(null);
  const perfil = usuarioActual?.perfil;
  const [perfilEditado, setPerfilEditado] = useState(null);
  const [mensajePerfil, setMensajePerfil] = useState('');

  useEffect(() => {
    solicitarApi('/api/me')
      .then(({ usuario }) => {
        setUsuarioActual(usuario);
        setPerfilEditado(usuario ? {
          ...usuario.perfil,
          habilidades: usuario.perfil.habilidades.join(', ')
        } : null);
      })
      .catch(error => setMensajeAutenticacion(`No se pudo conectar con el servidor: ${error.message}`))
      .finally(() => setCargandoSesion(false));
  }, []);

  async function manejarRegistro(datos) {
    try {
      await solicitarApi('/api/register', {
        method: 'POST',
        body: JSON.stringify(datos)
      });
      setModoAutenticacion('login');
      setMensajeAutenticacion('Cuenta creada correctamente. Inicia sesión con tu correo y contraseña.');
    } catch (error) {
      setMensajeAutenticacion(error.message);
    }
  }

  async function manejarInicioSesion(datos) {
    try {
      const { usuario } = await solicitarApi('/api/login', {
        method: 'POST',
        body: JSON.stringify(datos)
      });
      setUsuarioActual(usuario);
      setPerfilEditado({ ...usuario.perfil, habilidades: usuario.perfil.habilidades.join(', ') });
      setMensajeAutenticacion('');
      setMensajePerfil('');
    } catch (error) {
      setMensajeAutenticacion(error.message);
    }
  }

  async function manejarCierreSesion() {
    try {
      await solicitarApi('/api/logout', { method: 'POST' });
      setUsuarioActual(null);
      setPerfilEditado(null);
      setModoAutenticacion('login');
      setMensajeAutenticacion('');
      setActiveTab('directorio');
    } catch (error) {
      setMensajePerfil(`No se pudo cerrar la sesión: ${error.message}`);
    }
  }

  function manejarCambioPerfil(campo, valor) {
    setPerfilEditado({ ...perfilEditado, [campo]: valor });
  }

  async function guardarPerfil(evento) {
    evento.preventDefault();
    const perfilGuardado = {
      ...perfilEditado,
      nombre: perfilEditado.nombre.trim(),
      habilidades: perfilEditado.habilidades
        .split(',')
        .map(habilidad => habilidad.trim())
        .filter(Boolean)
    };
    try {
      const { usuario } = await solicitarApi('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(perfilGuardado)
      });
      setUsuarioActual(usuario);
      setPerfilEditado({ ...usuario.perfil, habilidades: usuario.perfil.habilidades.join(', ') });
      setMensajePerfil('Perfil actualizado correctamente.');
    } catch (error) {
      setMensajePerfil(error.message);
    }
  }

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

  if (cargandoSesion) {
    return <main className="auth-layout"><section className="panel auth-card">Conectando con el servidor…</section></main>;
  }

  if (!perfil) {
    return (
      <AuthScreen
        modo={modoAutenticacion}
        setModo={setModoAutenticacion}
        mensaje={mensajeAutenticacion}
        onRegister={manejarRegistro}
        onLogin={manejarInicioSesion}
      />
    );
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

  const encabezados = {
    directorio: {
      etiqueta: 'Comunidad SENA · Cundinamarca',
      titulo: 'Conecta talento.\nImpulsa proyectos.',
      descripcion: 'Encuentra personas con las habilidades que tu próximo proyecto necesita.',
    },
    proyectos: {
      etiqueta: 'Colaboración · Proyectos formativos',
      titulo: 'Las buenas ideas\nencuentran equipo.',
      descripcion: 'Comparte lo que estás construyendo y reúne el talento para hacerlo realidad.',
    },
    productiva: {
      etiqueta: 'Orientación · Oportunidades',
      titulo: 'Tu siguiente paso\nempieza aquí.',
      descripcion: 'Recursos para acercarte a la etapa productiva y conectar con egresados.',
    },
    perfil: {
      etiqueta: 'Tu espacio · Perfil académico',
      titulo: 'Muestra lo que\nsabes hacer.',
      descripcion: 'Mantén tu perfil actualizado para que la comunidad pueda encontrarte.',
    },
  };

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
            <button className="secondary-button" type="button" onClick={manejarCierreSesion}>
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="page-content">
        <section className="workspace-heading">
          <span className="workspace-eyebrow text-xs font-bold uppercase tracking-widest text-nexo-lime">
            {encabezados[activeTab].etiqueta}
          </span>
          <h1>{encabezados[activeTab].titulo}</h1>
          <p>{encabezados[activeTab].descripcion}</p>
        </section>

        {/* PESTAÑA 1: DIRECTORIO DE TALENTOS */}
        {activeTab === 'directorio' && (
          <div className="panel-wrap">
            {/* Buscador Inteligente / Wireframe G */}
            <div className="panel search-panel">
                <h2 className="section-title">Filtra por perfil</h2>
                <p className="section-subtitle">Explora aprendices por centro, programa o habilidad.</p>
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
              <h3 className="results-title">Personas destacadas <span>({talentosFiltrados.length})</span></h3>
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
                {talentosFiltrados.length === 0 && (
                  <p className="empty-state">No encontramos perfiles con esos filtros. Prueba con otros términos.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: TABLERO DE PROYECTOS (MATCHMAKING) */}
        {activeTab === 'proyectos' && (
          <div className="panel-wrap">
            <div className="panel project-panel">
              <h2 className="section-title">Publica una oportunidad</h2>
              <p className="section-subtitle">Cuéntale a la comunidad qué estás creando y a quién necesitas. Puedes tener hasta 3 proyectos activos.</p>

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
              <h2 className="section-title">Recursos para avanzar</h2>
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
              <h2 className="section-title">Información académica</h2>
              <p className="section-subtitle">Correo de acceso: {usuarioActual.email}</p>
              {mensajePerfil && (
                <div className={`alert-message ${mensajePerfil.startsWith('No se pudo') ? 'error' : 'exito'}`}>
                  {mensajePerfil}
                </div>
              )}
              <form className="profile-grid" onSubmit={guardarPerfil}>
                <div className="form-row compact-row">
                  <div className="field-group">
                    <label>Nombre Completo</label>
                    <input className="field" type="text" value={perfilEditado.nombre} onChange={e => manejarCambioPerfil('nombre', e.target.value)} required />
                  </div>
                  <div className="field-group">
                    <label>Rol en la plataforma</label>
                    <input className="field" type="text" value={perfilEditado.rol} onChange={e => manejarCambioPerfil('rol', e.target.value)} required />
                  </div>
                </div>

                <div className="field-group">
                  <label>Centro de Formación</label>
                  <input className="field" type="text" value={perfilEditado.centro} onChange={e => manejarCambioPerfil('centro', e.target.value)} required />
                </div>

                <div className="form-row compact-row">
                  <div className="field-group">
                    <label>Programa</label>
                    <input className="field" type="text" value={perfilEditado.programa} onChange={e => manejarCambioPerfil('programa', e.target.value)} required />
                  </div>
                  <div className="field-group">
                    <label>Número de Ficha</label>
                    <input className="field" type="text" value={perfilEditado.ficha} onChange={e => manejarCambioPerfil('ficha', e.target.value)} required />
                  </div>
                  <div className="field-group">
                    <label>Jornada</label>
                    <input className="field" type="text" value={perfilEditado.jornada} onChange={e => manejarCambioPerfil('jornada', e.target.value)} required />
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="profile-skills">Habilidades técnicas (separadas por comas)</label>
                  <input id="profile-skills" className="field" type="text" value={perfilEditado.habilidades} onChange={e => manejarCambioPerfil('habilidades', e.target.value)} />
                </div>
                <div className="profile-actions">
                  <button className="primary-button" type="submit">Guardar perfil</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* Pie de página institucional */}
      <footer className="app-footer">
        <p>SENA NEXO • Centro de Biotecnología Agropecuaria (Regional Cundinamarca)</p>
        <p>Ficha {perfil.ficha} • Proyecto Formativo - Taller Formativo</p>
      </footer>
    </div>
  );
}