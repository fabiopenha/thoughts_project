const Thought = require('../models/Thought')
const User = require('../models/User')

const { Op } = require('sequelize')

module.exports = class ThoughtController {
    static async showThoughts(req, res) {

        let search = ''

        if(req.query.search) {
            search = req.query.search
        }

        let order = 'DESC'

           if(req.query.order === 'old') {
                order = 'ASC'
           } else {
               order = 'DESC'
           }

        const thoughtsData = await Thought.findAll({
            include: User,
            where: {
                title: {[Op.like]: `%${search}%`},
            },
            order: [['createdAt', order]]
        })

        const thoughts = thoughtsData.map((result) => result.get({plain: true}))

        let thoughtQty = thoughts.length

        if(thoughtQty === 0) {
            thoughtQty = false
        }


        res.render('thoughts/home', { thoughts, search, thoughtQty })
    }

    static async removeThought(req, res) {
        const id = req.body.id
        const UserId = req.session.userid

        try{
            await Thought.destroy({where: {id: id, UserId: UserId}})
            req.flash('message', 'Pensamento removido com sucesso!')

            req.session.save(() => {
                res.redirect('/thoughts/dashboard')
            })
        }catch (error) {
            console.log(error)
        }
    }

    static async dashboardView(req, res) {
        const userId = req.session.userid

        const user = await User.findOne({
            where: { 
                id : userId,
            },
            include: Thought,
            plain: true,
    })

    // check if user exits
    if(!user){
        res.redirect('/login')
    }

    const thoughts = user.Thoughts.map((result) => result.dataValues)

    let emptyThought = false

    if(thoughts.length === 0) {
         emptyThought = true
    }

        
    res.render('thoughts/dashboard', { thoughts, emptyThought })
    }

    static createThought(req, res) {
        res.render('thoughts/create')
    }

    static async createThoughtSave(req, res) {
        const thought = {
            title: req.body.title,
            UserId: req.session.userid
        }

        try {
            await Thought.create(thought)

            req.flash('message', 'Pensamento criado com sucesso!')

            req.session.save(() => {
                res.redirect('/thoughts/dashboard')
            })
        } catch (error) {
            console.log('Aconteceu um erro: ' + error)
        }
    }

    static async updateThought(req, res) {
        const id = req.params.id

        const thoughts = await Thought.findOne({where: {id: id}, raw: true})

        console.log(thoughts)

        res.render('thoughts/edit', { thoughts })
    }

    static async updateThoughtSave(req, res) {
        
        const id = req.body.id

        const thoughts = {
            title: req.body.title
        }

        try {
            await Thought.update(thoughts, {where: {id: id}})
        
            req.flash('message', 'Pensamento atualizado com sucesso!')
    
            req.session.save(() => {
                res.redirect('/thoughts/dashboard')
            })
        } catch (error) {
            console.log(error)
        }
    }
}