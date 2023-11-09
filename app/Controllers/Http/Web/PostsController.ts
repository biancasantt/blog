import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Post from 'App/Models/Post'
import PostService from 'App/Services/PostService'
import CreatePostValidator from 'App/Validators/CreatePostValidator'
//import session from 'Config/session'
//import auth from '@ioc:Adonis/Addons/Auth'

export default class PostsController {
  public async create({ view }: HttpContextContract) {
    return view.render('posts/create')
  }

  public async store({ request, response, session}: HttpContextContract) {
    const payload = await request.validate(CreatePostValidator)

   // Recupera o ID do usuário armazenado na sessão
   const userId = session.get('userId')

   if (!userId) {
     return response.badRequest('ID do usuário não encontrado na sessão.')
   }
 
   const user = await User.findOrFail(userId)   
    //TODO: Pegar o usuario logado
    //const user = await User.findOrFail(2)

    const postService = new PostService()
    const post = await postService.create(user, payload)

    return response.redirect().toRoute('posts.show', { id: post.id })
  }

  public async show({ params, view }: HttpContextContract) {
    const post = await Post.findOrFail(params.id)

    await post.load('user')

    return view.render('posts/show', { post: post })
  }

  public async update({ params, view }: HttpContextContract) {
    const post = await Post.findOrFail(params.id)

    return view.render('posts/update', { post: post })
  }
/*
  public async patch({ params, request, response }: HttpContextContract) {
    const post = await Post.findOrFail(params.id)

    const title = request.input('title', undefined)
    const content = request.input('content', undefined)

    post.title = title ? title : post.title
    post.content = content ? content : post.content

    await post.save()

    return response.redirect().toRoute('users.show', { id: post.id })
  }
*/
  public async patch({ params, request, view }: HttpContextContract) {
    const post = await Post.findOrFail(params.id)

    const title = request.input('title', undefined)
    const content = request.input('content', undefined)

    post.title = title ? title : post.title
    post.content = content ? content : post.content

    await post.save()

    const posts = await Post.query().preload('user')
    return view.render('posts/index', { posts: posts })
  }

  public async index({ view }: HttpContextContract) {
    const posts = await Post.query().preload('user')
    return view.render('posts/index', { posts: posts })
  }

  public async destroy({ params, view }: HttpContextContract) {
    const post = await Post.findOrFail(params.id)
    await post.delete()

    const posts = await Post.query().preload('user')
    return view.render('posts/index', { posts: posts })
  }
}
