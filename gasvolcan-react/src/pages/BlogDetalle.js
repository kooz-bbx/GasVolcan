import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Seccion from '../components/Seccion';
import { BLOGS } from '../data/datos';

const BlogDetalle = () => {
  const { id } = useParams();
  const blog = BLOGS.find((b) => String(b.id) === id);

  if (!blog) {
    return (
      <Seccion>
        <p>Artículo no encontrado. <Link to="/blogs">Volver a los blogs</Link>.</p>
      </Seccion>
    );
  }

  return (
    <Seccion titulo={blog.titulo} icono="bi-journal-text">
      <p>{blog.intro}</p>
      {blog.secciones.map((s) => (
        <div key={s.titulo}>
          <h3>{s.titulo}</h3>
          {s.texto && <p>{s.texto}</p>}
          {s.items && (
            <ul>{s.items.map((item) => <li key={item}>{item}</li>)}</ul>
          )}
        </div>
      ))}
      <p>
        {blog.cierre} <Link to="/contacto">Ir a contacto</Link>
      </p>
      <Link to="/blogs"><i className="bi bi-arrow-left" /> Volver a los blogs</Link>
    </Seccion>
  );
};

export default BlogDetalle;
