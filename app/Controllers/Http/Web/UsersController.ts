import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import UserService from 'App/Services/UserService'
//import Hash from '@ioc:Adonis/Core/Hash'
//import Database from '@ioc:Adonis/Lucid/Database'

export default class UsersController {
  public async create({ view }: HttpContextContract) {
    return view.render('users/create')
  }

 /* public async login({ view }: HttpContextContract) {
    return view.render('users/login') 
  }
 */

  public async store({ request, response }: HttpContextContract) {
    const email = request.input('email', undefined)
    const password = request.input('password', undefined)

    if (!email || !password) {
      response.status(400)
      return response
    }

    const userService = new UserService()
    const user = await userService.create(email, password)

    return response.redirect().toRoute('users.login', { id: user.id })
  }

  public async show({ params, view }: HttpContextContract) {
    const user = await User.findOrFail(params.id)
    const posts = await user.related('posts').query();

    return view.render('users/show', { user, posts });
  }

  public async update({ params, view }: HttpContextContract) {
    const user = await User.findOrFail(params.id)

    return view.render('users/update', { user: user })
  }

  public async patch({ params, request, response }: HttpContextContract) {
    const user = await User.findOrFail(params.id)

    const email = request.input('email', undefined)
    const password = request.input('password', undefined)

    user.email = email ? email : user.email
    user.password = password ? password : user.password

    await user.save()

    return response.redirect().toRoute('users.show', { id: user.id })
  }

  public async index({ view }: HttpContextContract) {
    const users = await User.all()

    return view.render('users/index', { users: users })
  }

  public async authlogin({ request, response, session }: HttpContextContract) {
    const { email, password } = request.all()
  
    try {
      const user = await User.findBy('email', email)
  
      if (user) {
        const passwordValid = user.password === password // Verifica se a senha é válida
        if (passwordValid) {
          // Armazene o ID do usuário na sessão
          session.put('userId', user.id)  
          return response.redirect().toRoute('posts.index')
        }
      }
  
      return response.badRequest('Credenciais inválidas')
    } catch (error) {
      return response.badRequest('Ocorreu um erro ao procurar o usuário')
    }
  }
  
  public async authlogout({ response, session }: HttpContextContract) {
    session.forget('userId')
    return response.redirect().toRoute('home.show')
  }
}
