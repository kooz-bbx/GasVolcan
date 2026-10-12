import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Seccion from '../components/Seccion';
import { BLOGS } from '../data/datos';

const Blogs = () => (
  <Seccion titulo="Noticias Importantes" icono="bi-newspaper">
    {BLOGS.map((blog) => (
      <Card key={blog.id} className="mb-3">
        <Card.Body>
          <Card.Title as="h5">Caso Curioso #{blog.id}: {blog.titulo}</Card.Title>
          <Card.Text>{blog.resumen}</Card.Text>
          <Link to={`/blogs/${blog.id}`} className="btn-enviar text-decoration-none d-inline-block">Ver caso</Link>
        </Card.Body>
      </Card>
    ))}
  </Seccion>
);

export default Blogs;
