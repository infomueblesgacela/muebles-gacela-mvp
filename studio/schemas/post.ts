export default {
  name: 'post',
  title: 'Nota de Novedad',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'author',
      title: 'Autor',
      type: 'string',
      initialValue: 'Equipo Muebles Gacela'
    },
    {
      name: 'mainImage',
      title: 'Imagen de Portada',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'category',
      title: 'Categoría',
      type: 'string',
      options: {
        list: [
          { title: 'Tendencias', value: 'Tendencias' },
          { title: 'Lanzamientos', value: 'Lanzamientos' },
          { title: 'Institucional', value: 'Institucional' },
          { title: 'Proyectos', value: 'Proyectos' },
        ],
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'publishedAt',
      title: 'Fecha de Publicación',
      type: 'datetime',
      initialValue: (new Date()).toISOString()
    },
    {
      name: 'body',
      title: 'Cuerpo de la nota',
      type: 'array',
      of: [
        {
          type: 'block'
        },
        {
          type: 'image'
        }
      ],
      validation: Rule => Rule.required()
    },
    {
      name: 'tags',
      title: 'Etiquetas para Productos Relacionados',
      description: 'Escribí las Líneas o Ambientes (ej: Kyoto, Living) para que se muestren productos relacionados automáticamente.',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags'
      }
    }
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author',
      media: 'mainImage',
    },
    prepare(selection) {
      const {author} = selection
      return Object.assign({}, selection, {
        subtitle: author && `por ${author}`,
      })
    },
  },
}
