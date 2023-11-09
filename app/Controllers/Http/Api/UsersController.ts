import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from 'App/Models/User'
import UserService from 'App/Services/UserService'
//import Hash from '@ioc:Adonis/Core/Hash'
//import Database from '@ioc:Adonis/Lucid/Database'
//import { AuthContract } from '@ioc:Adonis/Addons/Auth'

export default class UsersController {
  public async index({}: HttpContextContract) {
    const users = await User.all()

    return users
  }

  public async destroy({ params }: HttpContextContract) {
    const user = await User.findOrFail(params.id)
    await user.delete()

    return null
  }

  public async update({ request, params }: HttpContextContract) {
    const user = await User.findOrFail(params.id)

    const email = request.input('email', undefined)
    const password = request.input('password', undefined)

    user.email = email ? email : user.email
    user.password = password ? password : user.password

    await user.save()

    return user
  }

  public async store({ request, response }: HttpContextContract) {
    const email = request.input('email', undefined)
    const password = request.input('password', undefined)

    if (!email || !password) {
      response.status(400)
      return response
    }

    const userService = new UserService()
    const user = await userService.create(email, password)

    return user
  }

  public async show({ params }: HttpContextContract) {
    const user = await User.findOrFail(params.id)

    return user
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

/*  public async authlogin({ auth, request, response }: HttpContextContract) {
    const { email, password } = request.all()

    try {
      if (await auth.attempt(email, password)) {
        return response.redirect().toRoute('posts.index')
      }

      return response.badRequest('Credenciais inválidas')
    } catch (error) {
      return response.badRequest('Ocorreu um erro ao procurar o usuário')
    }
  }
*/ 
  public async authlogout({ response, session }: HttpContextContract) {
    session.forget('userId')
    return response.redirect().toRoute('home.show')
  }

}
